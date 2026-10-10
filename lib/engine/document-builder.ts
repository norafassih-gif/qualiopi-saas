"use server";

import { TRAINER_SATISFACTION_CRITERIA } from "@/lib/engine/trainer-satisfaction-criteria";
import {
  dedupeMissing,
  findEmptyVariables,
  findPlaceholderMarkers,
  formatMissingMessage,
  templateKeys,
  type MissingItem,
} from "@/lib/engine/document-completeness";
import { CHECKBOX_CSS, makePdfSafe } from "@/lib/engine/pdf-safe";
import { ndaVariables, ndaCalendarRows } from "@/lib/engine/nda-documents";
import { CUSTOM_CATEGORY_ID, customBlocksByType, customModuleRows, parseCustomProgram } from "@/lib/engine/custom-program";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization, type Organization } from "@/lib/actions/organization";
import { getMyBilling } from "@/lib/actions/billing";
import { isPlatformAdmin } from "@/lib/actions/admin";
import { getMyFirstTraining } from "@/lib/actions/training";
import { getMyFirstSession, getMyFirstBeneficiary, getSessionBeneficiaries, type Beneficiary } from "@/lib/actions/session";
import { countDistinctBeneficiaries, dedupeBeneficiaries } from "@/lib/actions/beneficiary-dedup";
import { getMyFirstPartner, type PartnerType } from "@/lib/actions/partners";
import { getAttendanceSignatures, type AttendanceSignature } from "@/lib/actions/attendance";
import { computeAttendancePeriods, formatPeriodLabel, type AttendancePeriod } from "./attendance-periods";
import { resolveDocumentVariables, STUDENT_SCOPED_TEMPLATE_IDS } from "./document-variables";
import { EVALUATION_PHASE_DOCUMENT_TEMPLATE, type EvaluationPhase } from "./evaluation-phases";
import { getFontOption } from "./branding-fonts";

// Valeurs "document standard" (aucune personnalisation) — appliquées quand
// l'add-on "document personnalisé" (+5 €/mois, migration 0041) n'est pas
// actif, cf. applyPersonalizationGate ci-dessous.
const STANDARD_BRAND_COLOR_PRIMARY = "#1e3a8a";
const STANDARD_BRAND_COLOR_SECONDARY = "#64748b";
const STANDARD_FONT_FAMILY = "helvetica";

/**
 * Neutralise le logo, le cachet, la signature, les couleurs et la police de
 * l'organisme quand l'add-on "document personnalisé" (+5 €/mois) n'est pas
 * actif — demande explicite de Nora (24/08/2026) : "si je choisis 29 euros,
 * j'ai mes documents qui ne sont pas personnalisés". Renseigné une fois sur
 * /parametres/identite-visuelle, ces champs restaient auparavant utilisés
 * par tous les documents générés quel que soit l'abonnement ; ce filtre
 * s'applique ICI, au moment de la génération — pas seulement sur le
 * formulaire d'édition (cf. lib/actions/branding.ts) — pour que la
 * personnalisation disparaisse aussi immédiatement si le client résilie
 * l'option, sans dépendre d'une purge des données existantes.
 *
 * Les administrateurs plateforme restent exemptés (même règle que
 * requireActiveSubscription) pour que Nora puisse continuer à tester le
 * rendu personnalisé sans avoir à souscrire l'option sur son propre compte.
 */
async function applyPersonalizationGate(org: Organization): Promise<Organization> {
  if (await isPlatformAdmin()) return org;

  const billing = await getMyBilling();
  if (billing?.has_personalization_addon) return org;

  return {
    ...org,
    logo_url: null,
    stamp_url: null,
    signature_url: null,
    brand_color_primary: STANDARD_BRAND_COLOR_PRIMARY,
    brand_color_secondary: STANDARD_BRAND_COLOR_SECONDARY,
    font_family: STANDARD_FONT_FAMILY,
  };
}

// Quels modèles de document utilisent les variables {{partner_*}} (cf.
// migrations 0032/0033) et pour quel type de tiers — évite de faire un
// aller-retour base de données inutile pour tous les autres documents.
const PARTNER_TYPE_BY_TEMPLATE: Record<string, PartnerType> = {
  contrat_sous_traitance: "sous_traitant",
  convention_partenariat: "partenaire",
};

// Inverse de EVALUATION_PHASE_DOCUMENT_TEMPLATE — pour ces 3 modèles de
// document (résultat de positionnement / en cours / finale, migration
// 0027), on ne veut pas la dernière tentative toutes phases confondues mais
// la dernière tentative DU MOMENT concerné, sinon le document "Positionnement"
// afficherait par exemple le score de l'évaluation finale la plus récente.
const EVALUATION_TEMPLATE_TO_PHASE: Record<string, EvaluationPhase> = Object.fromEntries(
  Object.entries(EVALUATION_PHASE_DOCUMENT_TEMPLATE).map(([phase, templateId]) => [templateId, phase as EvaluationPhase])
);

type TemplateSection = {
  code: string;
  title: string;
  sort_order: number;
  content_type:
    | "rich_text"
    | "variable_block"
    | "table"
    | "content_block_list"
    | "checklist"
    | "signature_block"
    | "attendance_grid"
    | "org_chart"
    | "data_table"
    | "qcm_answers"
    | "satisfaction_results"
    | "trainer_satisfaction_results";
  html_template: string | null;
  source_content_block_type: string | null;
  // "training" (défaut) : blocs réellement retenus pour cette formation via
  // le moteur de règles (ex. programme). "global" : tous les blocs actifs de
  // ce type dans la banque de contenu, sans lien avec une formation précise
  // (ex. fiches de poste, sources de veille) — cf. migration 0009.
  content_block_scope: "training" | "global";
  data_source: string | null;
};

export type BuildDocumentResult =
  | {
      html: string;
      templateLabel: string;
      /**
       * Id du bénéficiaire effectivement utilisé pour remplir les variables
       * {{student_*}} de ce document (null si la session n'a aucun
       * bénéficiaire, ou si le document n'est pas "par apprenant"). Peut
       * différer du beneficiaryId demandé en paramètre si celui-ci ne
       * correspond à aucun bénéficiaire de la session courante — repli sur
       * getMyFirstBeneficiary(). Renvoyé pour que l'appelant (cf.
       * app/api/documents/[templateId]/route.ts) sache pour QUEL apprenant
       * stocker/mettre à jour le document, plutôt que de faire confiance au
       * paramètre brut reçu dans l'URL.
       */
      beneficiaryId: string | null;
    }
  // `missing` : liste des informations manquantes quand la génération est
  // bloquée par le contrôle de complétude (cf. document-completeness.ts).
  | { error: string; missing?: MissingItem[] };

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => vars[key] ?? "");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Construit le HTML complet d'un document, prêt pour l'impression PDF, à
 * partir d'un modèle stocké en base (`document_templates` /
 * `document_template_sections`) et des données réelles de l'organisme, de
 * la formation et de la session en cours — QUESTION -> RÉPONSE -> RÈGLE ->
 * VARIABLES -> BLOC DE CONTENU -> DOCUMENT (point 5-10 de la conception).
 * Chaque type de section est résolu différemment :
 *  - variable_block / rich_text : interpolation {{variable}} du html_template
 *  - content_block_list : liste des blocs de contenu de la banque, filtrés
 *    par type, effectivement retenus pour CETTE formation (training_content_blocks)
 *  - table : programme des modules retenus pour cette formation (training_modules)
 *  - checklist / signature_block : pas encore utilisés par un modèle, rendu
 *    minimal prévu pour les prochains documents (convention, émargement…)
 */
export async function buildDocumentHtml(
  documentTemplateId: string,
  /**
   * Date personnalisée pour {{generated_date}} (format "YYYY-MM-DD",
   * celui d'un <input type="date">) — cf. app/(app)/documents/page.tsx et
   * app/api/documents/[templateId]/route.ts. Demande de Nora (24/08/2026) :
   * les organismes doivent pouvoir choisir la date affichée sur leurs
   * documents plutôt que de subir systématiquement la date du jour.
   */
  customDate?: string,
  /**
   * Id du bénéficiaire pour lequel générer ce document — sélecteur "par
   * apprenant" sur "Mes documents" (cf. app/(app)/documents/download-form.tsx
   * et app/api/documents/[templateId]/route.ts). Uniquement pertinent pour
   * les modèles listés dans STUDENT_SCOPED_TEMPLATE_IDS (cf.
   * lib/engine/document-variables.ts) : pour les autres, ce paramètre est
   * simplement ignoré (un document "de session" ne dépend d'aucun
   * bénéficiaire précis). Si absent, ou si l'id ne correspond à aucun
   * bénéficiaire de la session courante, on retombe sur
   * getMyFirstBeneficiary() — comportement historique, inchangé pour les
   * organismes mono-apprenant.
   */
  beneficiaryId?: string
): Promise<BuildDocumentResult> {
  const rawOrg = await getMyOrganization();
  if (!rawOrg) return { error: "Organisme introuvable — complétez d'abord votre profil." };
  const org = await applyPersonalizationGate(rawOrg);

  const training = await getMyFirstTraining();
  if (!training) return { error: "Formation introuvable — créez d'abord votre formation." };

  const session = await getMyFirstSession();
  const supabase = await createClient();

  const [templateResponse, sectionsResponse] = await Promise.all([
    supabase.from("document_templates").select("id, label, folder_group").eq("id", documentTemplateId).maybeSingle(),
    supabase
      .from("document_template_sections")
      .select("code, title, sort_order, content_type, html_template, source_content_block_type, content_block_scope, data_source")
      .eq("document_template_id", documentTemplateId)
      .order("sort_order"),
  ]);

  if (templateResponse.error || !templateResponse.data) {
    return { error: "Modèle de document introuvable : " + documentTemplateId };
  }
  if (sectionsResponse.error) {
    return { error: "Erreur lors du chargement du modèle : " + sectionsResponse.error.message };
  }

  const sections = (sectionsResponse.data ?? []) as TemplateSection[];

  // Un document "par apprenant" (STUDENT_SCOPED_TEMPLATE_IDS) nomme un
  // bénéficiaire précis — il doit donc être signé par les DEUX parties
  // (dirigeant + apprenant), pas seulement l'organisme, cf. section
  // "signature_block" ci-dessous (demande de Nora, 25/08/2026 : "chaque
  // document doit être signé par les deux parties [...] on récupère les
  // signatures qui ont été faites, par le dirigeant et par l'apprenant").
  const isStudentScopedTemplate = (STUDENT_SCOPED_TEMPLATE_IDS as readonly string[]).includes(documentTemplateId);

  let beneficiaryName: string | null = null;
  let beneficiaryCompany: string | null = null;
  let beneficiaryCompanyRepresentative: string | null = null;
  let beneficiaryEmail: string | null = null;
  let beneficiaryRole: string | null = null;
  let beneficiaryCount = 0;
  let beneficiarySignatureName: string | null = null;
  let beneficiarySignatureAccepted = false;
  let beneficiarySignatureDate: string | null = null;
  let beneficiarySignatureDataUrl: string | null = null;
  // Recueil des besoins digitalisé (demande de Nora, 24/08/2026) — cf.
  // lib/actions/session.ts (type Beneficiary) et lib/engine/document-variables.ts.
  let beneficiaryExperienceLevel: string | null = null;
  let beneficiaryCurrentDifficulties: string | null = null;
  let beneficiaryPersonalExpectations: string | null = null;
  let beneficiaryPrioritySkills: string | null = null;
  let beneficiaryProfessionalContext: string | null = null;
  let beneficiaryExpectedResults: string | null = null;
  let beneficiaryPreferredModality: string | null = null;
  let beneficiaryPreferredRhythm: string | null = null;
  let beneficiaryScheduleConstraints: string | null = null;
  let beneficiaryHasDisability: boolean | null = null;
  let beneficiaryDiplomas: string | null = null;
  let beneficiaryRelatedExperience: string | null = null;
  let beneficiaryAccommodationDetails: string | null = null;
  // Toutes les lignes bénéficiaires de la session (hors doublons) — utilisé
  // par la grille d'émargement dynamique (content_type "attendance_grid",
  // cf. plus bas) qui doit lister TOUS les apprenants, pas un seul.
  let sessionBeneficiaries: Beneficiary[] = [];
  // Bénéficiaire effectivement utilisé pour ce document — cf. commentaire du
  // champ beneficiaryId sur BuildDocumentResult ci-dessus.
  let resolvedBeneficiaryId: string | null = null;
  if (session) {
    // getMyFirstBeneficiary() (lib/actions/session.ts) plutôt qu'une requête
    // ".order('id').limit(1)" locale : cette dernière était une 3e variante,
    // légèrement différente, de la même logique "premier bénéficiaire" déjà
    // dupliquée ailleurs — source du bug Phase 32bis (24/08/2026, Nora :
    // "j'ai toujours treize trucs à rajouter alors que je les ai déjà
    // rajoutés") où un document pouvait piocher une fiche vide plutôt que
    // celle réellement complétée par l'organisme, surtout après un doublon
    // historique de bénéficiaires sur une même session.
    // beneficiaryCount ne doit PAS être un simple COUNT(*) brut sur la table
    // : cf. Phase 32ter (24/08/2026, Nora : "je vois nombre de participants,
    // 3... il n'y a qu'une personne") — un devis affichait 3 participants à
    // cause de 3 lignes dupliquées désignant la même personne (même bug
    // historique que ci-dessus). countDistinctBeneficiaries() (lib/actions/
    // session.ts) déduplique par nom normalisé avant de compter.
    const [firstBeneficiary, allBeneficiaries] = await Promise.all([
      getMyFirstBeneficiary(session.id),
      getSessionBeneficiaries(session.id),
    ]);
    // Un beneficiaryId a été explicitement demandé (sélecteur "par
    // apprenant") : on l'utilise s'il correspond bien à un bénéficiaire de
    // CETTE session — jamais de confiance aveugle dans un id venu de l'URL
    // — sinon repli sur le bénéficiaire "le plus complet" comme avant cette
    // fonctionnalité. C'est ce bug précis (le sélecteur envoyait déjà
    // beneficiary_id, mais rien ici ne le lisait) que corrige ce chantier :
    // avant, TOUS les documents "par apprenant" d'une session à plusieurs
    // apprenants pointaient systématiquement vers la même personne.
    const requestedBeneficiary = beneficiaryId
      ? allBeneficiaries.find((b) => b.id === beneficiaryId) ?? null
      : null;
    const beneficiary = requestedBeneficiary ?? firstBeneficiary;
    if (beneficiary) {
      resolvedBeneficiaryId = beneficiary.id;
      beneficiaryName = beneficiary.full_name;
      beneficiaryCompany = beneficiary.company;
      beneficiaryCompanyRepresentative = (beneficiary as { company_representative?: string | null }).company_representative ?? null;
      beneficiaryEmail = beneficiary.email;
      beneficiaryRole = beneficiary.role;
      beneficiarySignatureName = beneficiary.signature_name;
      beneficiarySignatureAccepted = beneficiary.signature_accepted;
      beneficiarySignatureDate = beneficiary.signature_date;
      beneficiarySignatureDataUrl = (beneficiary as { signature_data_url?: string | null }).signature_data_url ?? null;
      beneficiaryExperienceLevel = beneficiary.experience_level;
      beneficiaryCurrentDifficulties = beneficiary.current_difficulties;
      beneficiaryPersonalExpectations = beneficiary.personal_expectations;
      beneficiaryPrioritySkills = beneficiary.priority_skills;
      beneficiaryProfessionalContext = beneficiary.professional_context;
      beneficiaryExpectedResults = beneficiary.expected_results;
      beneficiaryPreferredModality = beneficiary.preferred_modality;
      beneficiaryPreferredRhythm = beneficiary.preferred_rhythm;
      beneficiaryScheduleConstraints = beneficiary.schedule_constraints;
      beneficiaryHasDisability = beneficiary.has_disability;
      beneficiaryDiplomas = beneficiary.diplomas_qualifications;
      beneficiaryRelatedExperience = beneficiary.related_experience;
      beneficiaryAccommodationDetails = beneficiary.accommodation_details;
    }
    beneficiaryCount = countDistinctBeneficiaries(allBeneficiaries);
    sessionBeneficiaries = allBeneficiaries;

    // Signature du stagiaire reprise de l'émargement (retour de Nora,
    // 04/10/2026 : "la signature du stagiaire est sur les émargements, on
    // peut la récupérer") : si aucune signature n'a été enregistrée sur la
    // fiche du bénéficiaire, on réutilise son premier tracé d'émargement pour
    // la convention, le contrat, le devis... Requête faite seulement pour les
    // modèles qui affichent une signature du stagiaire.
    const showsStudentSignature =
      isStudentScopedTemplate ||
      sections.some((s) => /student_(signature|accord)_block/.test(s.html_template ?? ""));
    if (!beneficiarySignatureDataUrl && resolvedBeneficiaryId && showsStudentSignature) {
      const traced = (await getAttendanceSignatures(session.id))
        .filter((s) => s.beneficiary_id === resolvedBeneficiaryId && s.signature_data_url)
        .sort((a, b) => (a.signed_at < b.signed_at ? -1 : 1))[0];
      if (traced) {
        beneficiarySignatureDataUrl = traced.signature_data_url;
        beneficiarySignatureName = beneficiarySignatureName || traced.signer_name || beneficiaryName;
        beneficiarySignatureDate = beneficiarySignatureDate || traced.signed_at.slice(0, 10);
      }
    }
  }

  // Grille d'émargement (feuille_emargement, section "attendance_grid",
  // Phase 33, 25/08/2026) : construite dynamiquement — une page par
  // demi-journée de la session, avec tous les apprenants et, s'ils ont déjà
  // signé sur /emargement, leur tracé de signature. Ne coûte une requête
  // supplémentaire QUE pour les modèles qui ont réellement une telle
  // section — tous les autres documents restent inchangés.
  const needsAttendanceGrid = sections.some((s) => s.content_type === "attendance_grid");
  const attendancePeriods = needsAttendanceGrid && session
    ? computeAttendancePeriods(session.start_date, session.end_date)
    : [];
  const attendanceBeneficiaries = needsAttendanceGrid ? dedupeBeneficiaries(sessionBeneficiaries) : [];
  const attendanceSignatures =
    needsAttendanceGrid && session ? await getAttendanceSignatures(session.id) : [];

  // Dernière évaluation complétée pour cette formation (peu importe la
  // session/le bénéficiaire précis en MVP mono-session) — alimente les
  // variables evaluation_* des documents "Résultat de positionnement / en
  // cours / finale" (migrations 0025 et 0027) sans coupler ce document
  // générique au moteur d'évaluation lui-même. Pour ces 3 modèles précis, on
  // filtre en plus sur le moment concerné (positionnement/en_cours/finale)
  // pour ne pas afficher, par exemple, le score du positionnement sur le
  // document d'évaluation finale.
  const evaluationPhaseFilter = EVALUATION_TEMPLATE_TO_PHASE[documentTemplateId];
  let evaluationAttemptQuery = supabase
    .from("evaluation_attempts")
    .select("id, score_raw, score_max, score_percent, passed, completed_at")
    .eq("training_id", training.id)
    .not("completed_at", "is", null);
  if (evaluationPhaseFilter) {
    evaluationAttemptQuery = evaluationAttemptQuery.eq("phase", evaluationPhaseFilter);
  }
  const { data: latestAttempt } = await evaluationAttemptQuery
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

    // Detail du QCM renseigne par le stagiaire : question, reponse donnee,
    // reponse attendue. Demande de l'auditeur (27/09/2026) : le resultat seul
    // ne prouve pas que l'evaluation a eu lieu.
    type QcmRow = { question: string; given: string; expected: string; ok: boolean };
    const qcmRows: QcmRow[] = [];
    const attemptId = (latestAttempt as { id?: string } | null)?.id ?? null;
    if (attemptId && sections.some((s) => s.content_type === "qcm_answers")) {
      const { data: answerRows } = await supabase
        .from("evaluation_attempt_answers")
        .select("question_id, selected_option_id, is_correct")
        .eq("attempt_id", attemptId);
      const questionIds = (answerRows ?? []).map((r) => String(r.question_id));
      if (questionIds.length > 0) {
        const { data: questionRows } = await supabase
          .from("evaluation_questions")
          .select("id, question_text, sort_order")
          .in("id", questionIds);
        const { data: optionRows } = await supabase
          .from("evaluation_answer_options")
          .select("id, question_id, label, is_correct")
          .in("question_id", questionIds);
        const questionById = new Map((questionRows ?? []).map((q) => [String(q.id), q]));
        const optionById = new Map((optionRows ?? []).map((o) => [String(o.id), o]));
        const correctByQuestion = new Map<string, string>();
        for (const option of optionRows ?? []) {
          if (option.is_correct) correctByQuestion.set(String(option.question_id), String(option.label ?? ""));
        }
        for (const answer of answerRows ?? []) {
          const question = questionById.get(String(answer.question_id));
          const chosen = optionById.get(String(answer.selected_option_id));
          qcmRows.push({
            question: String(question?.question_text ?? ""),
            given: String(chosen?.label ?? "Sans réponse"),
            expected: correctByQuestion.get(String(answer.question_id)) ?? "",
            ok: Boolean(answer.is_correct),
          });
        }
      }
    }

  const partnerType = PARTNER_TYPE_BY_TEMPLATE[documentTemplateId];
  const partner = partnerType ? await getMyFirstPartner(partnerType) : null;

  const vars = resolveDocumentVariables({
    org,
    training,
    session,
    beneficiaryName,
    beneficiaryCompany,
    beneficiaryCompanyRepresentative,
    beneficiaryEmail,
    beneficiaryRole,
    beneficiaryCount,
    beneficiarySignatureName,
    beneficiarySignatureAccepted,
    beneficiarySignatureDataUrl,
    beneficiarySignatureDate,
    beneficiaryExperienceLevel,
    beneficiaryCurrentDifficulties,
    beneficiaryPersonalExpectations,
    beneficiaryPrioritySkills,
    beneficiaryProfessionalContext,
    beneficiaryExpectedResults,
    beneficiaryPreferredModality,
    beneficiaryPreferredRhythm,
    beneficiaryScheduleConstraints,
    beneficiaryHasDisability,
    beneficiaryDiplomas,
    beneficiaryRelatedExperience,
    beneficiaryAccommodationDetails,
    partner,
    generatedDate: customDate ?? null,
    evaluationResult:
      latestAttempt && latestAttempt.score_raw != null && latestAttempt.score_max != null
        ? {
            score_raw: latestAttempt.score_raw,
            score_max: latestAttempt.score_max,
            score_percent: latestAttempt.score_percent ?? 0,
            passed: latestAttempt.passed ?? false,
            completed_at: latestAttempt.completed_at,
          }
        : null,
  });

  const [blocksResponse, modulesResponse, globalBlocksResponse] = await Promise.all([
    supabase
      .from("training_content_blocks")
      .select("content_blocks(type, text)")
      .eq("training_id", training.id),
    supabase
      .from("training_modules")
      .select("sort_order, duration_hours, modules(title)")
      .eq("training_id", training.id)
      .order("sort_order"),
    // Blocs "globaux" (cf. content_block_scope) : indépendants de toute
    // formation, utilisés par les documents transverses (fiches de poste,
    // sources de veille, exemples...). Table de taille modeste (quelques
    // centaines de lignes) : un seul fetch, filtré ensuite en mémoire par type.
    supabase.from("content_blocks").select("type, code, text").eq("is_active", true).order("code"),
  ]);

  type BlockRow = { content_blocks: { type: string; text: string } | { type: string; text: string }[] | null };
  const blockRows = (blocksResponse.data ?? []) as unknown as BlockRow[];
  const blocksByType = new Map<string, string[]>();
  for (const row of blockRows) {
    const block = Array.isArray(row.content_blocks) ? row.content_blocks[0] : row.content_blocks;
    if (!block) continue;
    const list = blocksByType.get(block.type) ?? [];
    list.push(block.text);
    blocksByType.set(block.type, list);
  }

  type ModuleRow = { duration_hours: number | null; modules: { title: string } | { title: string }[] | null };
  let moduleRows = (modulesResponse.data ?? []) as unknown as ModuleRow[];

  // Formation sur mesure : objectifs, modules, méthodes... saisis par le
  // client remplacent la banque de contenus (migration 0051).
  if (training.category_id === CUSTOM_CATEGORY_ID) {
    const custom = parseCustomProgram(training.custom_program);
    blocksByType.clear();
    for (const [type, items] of customBlocksByType(custom)) blocksByType.set(type, items);
    moduleRows = customModuleRows(custom);
  }

  // Pièces du dossier de déclaration d'activité (NDA) : variables
  // supplémentaires, calculées uniquement pour ces modèles.
  if (templateResponse.data.folder_group === "00_Declaration_activite") {
    Object.assign(vars, ndaVariables(org, training, session), {
      nda_calendar_rows: ndaCalendarRows(training, session, moduleRows),
    });
  }

  const globalBlocksByType = new Map<string, string[]>();
  for (const block of globalBlocksResponse.data ?? []) {
    const list = globalBlocksByType.get(block.type) ?? [];
    list.push(block.text);
    globalBlocksByType.set(block.type, list);
  }

  // Registres de veille : les entrees saisies dans /conformite/veille sont
  // imprimees dans les procedures correspondantes. Sans cela, le PDF sortait
  // avec un tableau vide alors que le client avait saisi sa veille.
  // Organigramme saisi par le client : nom + fonction, rendu en schema.
  // Reponses de satisfaction saisies dans /conformite/satisfaction.
  const satisfactionRows: Array<Record<string, string | number | null>> = [];
  if (sections.some((s) => s.content_type === "satisfaction_results")) {
    const { data: satRows } = await supabase
      .from("satisfaction_responses")
      .select("*")
      .eq("organization_id", org.id)
      .order("answered_on", { ascending: false });
    for (const row of satRows ?? []) {
      satisfactionRows.push(row as Record<string, string | number | null>);
    }
  }

  // Reponses du formateur saisies dans /conformite/satisfaction-formateur.
  const trainerSatisfactionRows: Array<Record<string, string | number | null>> = [];
  if (sections.some((s) => s.content_type === "trainer_satisfaction_results")) {
    const { data: trainerRows } = await supabase
      .from("trainer_satisfaction_responses")
      .select("*")
      .eq("organization_id", org.id)
      .order("answered_on", { ascending: false });
    for (const row of trainerRows ?? []) {
      trainerSatisfactionRows.push(row as Record<string, string | number | null>);
    }
  }

  const orgChartRows: Array<{ person_name: string; function_label: string; level: number }> = [];
  if (sections.some((s) => s.content_type === "org_chart")) {
    const { data: chartRows } = await supabase
      .from("org_chart_entries")
      .select("person_name, function_label, level, sort_order")
      .eq("organization_id", org.id)
      .order("level")
      .order("sort_order");
    for (const row of chartRows ?? []) {
      orgChartRows.push({
        person_name: String(row.person_name ?? ""),
        function_label: String(row.function_label ?? ""),
        level: Number(row.level ?? 2),
      });
    }
  }

  const watchEntriesByAxis = new Map<string, Array<Record<string, string | null>>>();
  const dataTableSections = sections.filter((s) => s.content_type === "data_table");
  if (dataTableSections.length > 0) {
    const axisIds = dataTableSections
      .map((s) => String(s.data_source ?? "").split(":")[1])
      .filter((value): value is string => Boolean(value));
    if (axisIds.length > 0) {
      const { data: watchRows } = await supabase
        .from("watch_entries")
        .select("axis_id, consulted_on, source_name, source_url, title, summary, impact, action_taken, action_status, responsible")
        .eq("organization_id", org.id)
        .in("axis_id", axisIds)
        .order("consulted_on", { ascending: false });
      for (const row of watchRows ?? []) {
        const key = String(row.axis_id);
        const list = watchEntriesByAxis.get(key) ?? [];
        list.push(row as Record<string, string | null>);
        watchEntriesByAxis.set(key, list);
      }
    }
  }

  // Contrôle de complétude (filet 1) : toute variable utilisée par le modèle
  // doit avoir une valeur, sauf celles déclarées facultatives. Fait ici, une
  // fois toutes les variables assemblées (y compris celles du parcours NDA).
  const usedKeys = templateKeys(sections);
  const missingItems: MissingItem[] = findEmptyVariables(usedKeys, vars);
  // Le dirigeant est coché comme formateur mais n'a pas enregistré sa
  // signature : le document sortirait sans signature (retour auditeur,
  // questionnaire de satisfaction formateur, indicateur 30).
  if (session?.trainer_is_manager && usedKeys.includes("trainer_signature_block") && !rawOrg.signature_url) {
    missingItems.push({
      label: "Signature du dirigeant (formateur) : à ajouter dans Identité visuelle",
      href: "/parametres/identite-visuelle",
    });
  }

  const renderedSections = sections
    .map((section) =>
      renderSection(
        section,
        vars,
        blocksByType,
        globalBlocksByType,
        moduleRows,
        {
          periods: attendancePeriods,
          beneficiaries: attendanceBeneficiaries,
          signatures: attendanceSignatures,
        },
        isStudentScopedTemplate,
        watchEntriesByAxis,
        orgChartRows,
        qcmRows,
        satisfactionRows,
        trainerSatisfactionRows
      )
    )
    .join("\n");

  // Filets 2 et 3 : marqueurs "[... à compléter]" ou signataire en pointillés
  // restés dans le texte rendu. Un document incomplet ne sort jamais.
  missingItems.push(...findPlaceholderMarkers(renderedSections));
  const missing = dedupeMissing(missingItems);
  if (missing.length > 0) {
    return { error: formatMissingMessage(templateResponse.data.label, missing), missing };
  }

  // Cases à cocher dessinées et caractères rares neutralisés (cf. pdf-safe.ts).
  const sectionsHtml = makePdfSafe(renderedSections);

  const html = wrapDocument({ org, templateLabel: templateResponse.data.label, sectionsHtml, vars });

  return { html, templateLabel: templateResponse.data.label, beneficiaryId: resolvedBeneficiaryId };
}

function renderSection(
  section: TemplateSection,
  vars: Record<string, string>,
  blocksByType: Map<string, string[]>,
  globalBlocksByType: Map<string, string[]>,
  moduleRows: { duration_hours: number | null; modules: { title: string } | { title: string }[] | null }[],
  attendance: { periods: AttendancePeriod[]; beneficiaries: Beneficiary[]; signatures: AttendanceSignature[] },
  isStudentScopedTemplate: boolean,
  watchEntriesByAxis: Map<string, Array<Record<string, string | null>>> = new Map(),
  orgChartRows: Array<{ person_name: string; function_label: string; level: number }> = [],
  qcmRows: Array<{ question: string; given: string; expected: string; ok: boolean }> = [],
  satisfactionRows: Array<Record<string, string | number | null>> = [],
  trainerSatisfactionRows: Array<Record<string, string | number | null>> = []
): string {
  let body: string;

  switch (section.content_type) {
    case "rich_text":
    case "variable_block":
      body = section.html_template ? interpolate(section.html_template, vars) : "";
      break;

    case "content_block_list": {
      const source = section.content_block_scope === "global" ? globalBlocksByType : blocksByType;
      const items = source.get(section.source_content_block_type ?? "") ?? [];
      body =
        items.length > 0
          ? `<ul>${items.map((t) => `<li>${interpolate(escapeHtml(t), vars)}</li>`).join("")}</ul>`
          : `<p class="empty">Non applicable pour cette formation.</p>`;
      break;
    }

    case "table": {
      // Seul cas d'usage actuel : le programme des modules retenus pour la
      // formation. À généraliser (via source_content_block_type ou un champ
      // dédié) si d'autres sections "table" apparaissent (ex. tarifs).
      if (moduleRows.length === 0) {
        body = `<p class="empty">Aucun module généré — complétez d'abord vos thématiques.</p>`;
      } else {
        const rows = moduleRows
          .map((m) => {
            const mod = Array.isArray(m.modules) ? m.modules[0] : m.modules;
            return `<tr><td>${escapeHtml(mod?.title ?? "")}</td><td>${m.duration_hours ?? ""} h</td></tr>`;
          })
          .join("");
        body = `<table><thead><tr><th>Module</th><th>Durée</th></tr></thead><tbody>${rows}</tbody></table>`;
      }
      break;
    }

    case "checklist":
      body = section.html_template
        ? `<ul class="checklist">${section.html_template
            .split("\n")
            .filter(Boolean)
            .map((line) => `<li class="checkline">${escapeHtml(interpolate(line, vars))}</li>`)
            .join("")}</ul>`
        : "";
      break;

    // Organigramme fonctionnel schematise : l'indicateur 21 attend un schema,
    // pas une liste. Pour un organisme individuel, le meme nom apparait dans
    // chaque fonction, ce qui est exactement ce que l'auditeur veut voir.
    // Registre de veille imprime a partir des entrees reelles.
    case "data_table": {
      const axis = String(section.data_source ?? "").split(":")[1] ?? "";
      const rows = watchEntriesByAxis.get(axis) ?? [];
      if (rows.length === 0) {
        body =
          `<p class="emptyregister">Aucune entrée enregistrée à ce jour. Ce registre se remplit depuis votre espace Conformité, rubrique « Ma veille ».</p>`;
        break;
      }
      const head =
        `<tr><th>Date</th><th>Source</th><th>Thème</th><th>Impact identifié</th><th>Action mise en place</th><th>Responsable</th></tr>`;
      const lines = rows
        .map(
          (row) =>
            `<tr><td>${escapeHtml(String(row.consulted_on ?? "").split("-").reverse().join("/"))}</td>` +
            `<td>${escapeHtml(row.source_name ?? "")}</td>` +
            `<td>${escapeHtml(row.title ?? "")}</td>` +
            `<td>${escapeHtml(row.impact ?? row.summary ?? "")}</td>` +
            `<td>${escapeHtml(row.action_taken ?? "À exploiter")}</td>` +
            `<td>${escapeHtml(row.responsible ?? "")}</td></tr>`
        )
        .join("");
      body = `<table class="register"><thead>${head}</thead><tbody>${lines}</tbody></table>`;
      break;
    }
    // Detail du QCM renseigne par le stagiaire.
    // Resultats de satisfaction saisis dans l'outil.
    case "satisfaction_results": {
      const criteria: Array<[string, string]> = [
        ["q_accessibilite", "Qualité de l accueil"],
        ["q_organisation", "Locaux ou plateforme à distance"],
        ["q_attentes", "Respect des horaires"],
        ["q_recommandation", "Communication avant la formation"],
        ["q_objectifs", "Clarté des objectifs annoncés"],
        ["q_supports", "Qualité des supports pédagogiques"],
        ["q_formateur", "Pédagogie et disponibilité du formateur"],
        ["q_contenu", "Adéquation du contenu avec vos besoins"],
      ];
      if (satisfactionRows.length === 0) {
        // Aucune reponse saisie : on imprime la grille vierge, a remplir a la main.
        let blank = "";
        for (const [, label] of criteria) {
          blank += "<tr><td>" + escapeHtml(label) + "</td><td>&nbsp;</td></tr>";
        }
        body =
          "<p>Pour chaque critère, merci de noter de 1 (très insatisfait) à 5 (très satisfait).</p>" +
          "<table class=\"register\"><thead><tr><th>Critère</th><th>Note (1 à 5)</th></tr></thead><tbody>" +
          blank + "</tbody></table>" +
          "<p>Pensez-vous pouvoir appliquer rapidement ce que vous avez appris ? ☐ Oui ☐ Non ☐ Partiellement</p>" +
          "<p>Cette formation a-t-elle répondu à vos attentes ? ☐ Oui ☐ Non ☐ Partiellement</p>" +
          "<p>Recommanderiez-vous cette formation ? ☐ Oui ☐ Non</p>" +
          "<p>Note globale sur 20 : …… / 20</p>" +
          "<p>Remarques libres : ……………………………………………………………………</p>";
        break;
      }
      const avg = (key: string) => {
        const values = satisfactionRows
          .map((r) => (typeof r[key] === "number" ? (r[key] as number) : null))
          .filter((v): v is number => v !== null);
        if (values.length === 0) return null;
        return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
      };
      let lines = "";
      const allValues: number[] = [];
      for (const [key, label] of criteria) {
        const value = avg(key);
        if (value !== null) allValues.push(value);
        lines += "<tr><td>" + escapeHtml(label) + "</td><td>" +
          (value !== null ? String(value).replace(".", ",") + " / 5" : "Non renseigné") + "</td></tr>";
      }
      const globalAvg = allValues.length
        ? Math.round((allValues.reduce((a, b) => a + b, 0) / allValues.length) * 10) / 10
        : null;
      const share = (key: string, expected: string) => {
        const total = satisfactionRows.filter((r) => r[key]).length;
        if (total === 0) return null;
        const hits = satisfactionRows.filter((r) => String(r[key]) === expected).length;
        return Math.round((hits / total) * 100);
      };
      const noteGlobale = (() => {
        const values = satisfactionRows
          .map((r) => (typeof r.note_globale === "number" ? (r.note_globale as number) : null))
          .filter((v): v is number => v !== null);
        if (values.length === 0) return null;
        return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
      })();
      const extra =
        (share("application_rapide", "oui") !== null
          ? "<p>Peuvent appliquer rapidement les acquis : <strong>" + share("application_rapide", "oui") + " %</strong></p>"
          : "") +
        (share("attentes_reponse", "oui") !== null
          ? "<p>Formation ayant répondu aux attentes : <strong>" + share("attentes_reponse", "oui") + " %</strong></p>"
          : "") +
        (share("recommande", "oui") !== null
          ? "<p>Recommanderaient la formation : <strong>" + share("recommande", "oui") + " %</strong></p>"
          : "") +
        (noteGlobale !== null
          ? "<p>Note globale moyenne : <strong>" + String(noteGlobale).replace(".", ",") + " / 20</strong></p>"
          : "");
      const comments = satisfactionRows
        .map((r) => {
          const forts = r.points_forts ? "<li><strong>Points forts :</strong> " + escapeHtml(String(r.points_forts)) + "</li>" : "";
          const amel = r.points_ameliorer ? "<li><strong>À améliorer :</strong> " + escapeHtml(String(r.points_ameliorer)) + "</li>" : "";
          const libre = r.commentaire_libre ? "<li>" + escapeHtml(String(r.commentaire_libre)) + "</li>" : "";
          return forts + amel + libre;
        })
        .join("");
      body =
        "<p>Nombre de questionnaires recueillis : <strong>" + satisfactionRows.length + "</strong>" +
        (globalAvg !== null ? " — satisfaction moyenne : <strong>" + String(globalAvg).replace(".", ",") + " / 5</strong>" : "") +
        "</p>" +
        "<table class=\"register\"><thead><tr><th>Critère</th><th>Moyenne</th></tr></thead><tbody>" +
        lines + "</tbody></table>" + extra +
        (comments ? "<p><strong>Commentaires recueillis</strong></p><ul>" + comments + "</ul>" : "");
      break;
    }
    // Avis du formateur (indicateur 30), saisi dans l'outil.
    case "trainer_satisfaction_results": {
      const criteria = TRAINER_SATISFACTION_CRITERIA;
      const rows = trainerSatisfactionRows;
      if (rows.length === 0) {
        // Aucune reponse saisie : grille vierge a remplir par le formateur.
        let blank = "";
        for (const c of criteria) {
          blank += "<tr><td>" + escapeHtml(c.label) + "</td><td>&nbsp;</td></tr>";
        }
        body =
          "<p>Pour chaque critère, merci de noter de 1 (très insatisfait) à 5 (très satisfait).</p>" +
          "<table class=\"register\"><thead><tr><th>Critère</th><th>Note (1 à 5)</th></tr></thead><tbody>" +
          blank + "</tbody></table>" +
          "<p>Les objectifs pédagogiques ont-ils été atteints ? ☐ Oui ☐ Non ☐ Partiellement</p>" +
          "<p>Souhaitez-vous intervenir à nouveau pour notre organisme ? ☐ Oui ☐ Non</p>" +
          "<p>Difficultés rencontrées : ……………………………………………………………………</p>" +
          "<p>Suggestions d'amélioration : ……………………………………………………………………</p>";
        break;
      }
      const fmt = (n: number) => String(n).replace(".", ",");
      const avgOf = (values: number[]) =>
        values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : null;
      let lines = "";
      const allValues: number[] = [];
      for (const c of criteria) {
        const value = avgOf(
          rows.map((r) => (typeof r[c.key] === "number" ? (r[c.key] as number) : null)).filter((v): v is number => v !== null)
        );
        if (value !== null) allValues.push(value);
        lines += "<tr><td>" + escapeHtml(c.label) + "</td><td>" +
          (value !== null ? fmt(value) + " / 5" : "Non renseigné") + "</td></tr>";
      }
      const globalAvg = avgOf(allValues);
      const share = (key: string, expected: string) => {
        const total = rows.filter((r) => r[key]).length;
        if (total === 0) return null;
        return Math.round((rows.filter((r) => String(r[key]) === expected).length / total) * 100);
      };
      const names = Array.from(new Set(rows.map((r) => String(r.trainer_name ?? "").trim()).filter(Boolean)));
      const extra =
        (share("objectifs_atteints", "oui") !== null
          ? "<p>Objectifs pédagogiques atteints selon le formateur : <strong>" + share("objectifs_atteints", "oui") + " %</strong></p>"
          : "") +
        (share("reintervenir", "oui") !== null
          ? "<p>Souhaitent intervenir à nouveau : <strong>" + share("reintervenir", "oui") + " %</strong></p>"
          : "");
      const comments = rows
        .map((r) => {
          const diff = r.difficultes ? "<li><strong>Difficultés :</strong> " + escapeHtml(String(r.difficultes)) + "</li>" : "";
          const sugg = r.suggestions ? "<li><strong>Suggestions :</strong> " + escapeHtml(String(r.suggestions)) + "</li>" : "";
          const libre = r.commentaire_libre ? "<li>" + escapeHtml(String(r.commentaire_libre)) + "</li>" : "";
          return diff + sugg + libre;
        })
        .join("");
      body =
        "<p>Nombre de questionnaires recueillis : <strong>" + rows.length + "</strong>" +
        (names.length ? " (" + escapeHtml(names.join(", ")) + ")" : "") +
        (globalAvg !== null ? " — satisfaction moyenne : <strong>" + fmt(globalAvg) + " / 5</strong>" : "") +
        "</p>" +
        "<table class=\"register\"><thead><tr><th>Critère</th><th>Moyenne</th></tr></thead><tbody>" +
        lines + "</tbody></table>" + extra +
        (comments ? "<p><strong>Commentaires recueillis</strong></p><ul>" + comments + "</ul>" : "");
      break;
    }
    case "qcm_answers": {
      if (qcmRows.length === 0) {
        body = "<p class=\"emptyregister\">Le détail du questionnaire sera disponible une fois l'évaluation complétée par le bénéficiaire.</p>";
        break;
      }
      let lines = "";
      qcmRows.forEach((row, index) => {
        lines += "<tr><td>" + (index + 1) + "</td>" +
          "<td>" + escapeHtml(row.question) + "</td>" +
          "<td>" + escapeHtml(row.given) + "</td>" +
          "<td>" + escapeHtml(row.expected) + "</td>" +
          "<td>" + (row.ok ? "Correct" : "Incorrect") + "</td></tr>";
      });
      body = "<table class=\"register\"><thead><tr><th>N°</th><th>Question</th>" +
        "<th>Réponse du bénéficiaire</th><th>Réponse attendue</th><th>Résultat</th></tr></thead>" +
        "<tbody>" + lines + "</tbody></table>";
      break;
    }
    case "org_chart": {
      // Organigramme saisi par le client : rendu tel quel, niveau par niveau.
      if (orgChartRows.length > 0) {
        const cellOf = (r: { person_name: string; function_label: string }, cls: string) =>
          "<td class=\"" + cls + "\"><span class=\"orgrole\">" + escapeHtml(r.function_label) +
          "</span><span class=\"orgname\">" + escapeHtml(r.person_name) + "</span></td>";
        const byLevel = [1, 2, 3].map((lvl) => orgChartRows.filter((r) => r.level === lvl));
        const widest = Math.max(1, byLevel[0].length, byLevel[1].length, byLevel[2].length);
        let rowsHtml = "";
        byLevel.forEach((rows, index) => {
          if (rows.length === 0) return;
          const cls = index === 0 ? "orgbox orgtop" : "orgbox";
          if (rows.length === 1 && widest > 1) {
            rowsHtml += "<tr><td class=\"" + cls + "\" colspan=\"" + widest + "\">" +
              "<span class=\"orgrole\">" + escapeHtml(rows[0].function_label) + "</span>" +
              "<span class=\"orgname\">" + escapeHtml(rows[0].person_name) + "</span></td></tr>";
          } else {
            rowsHtml += "<tr>" + rows.map((r) => cellOf(r, cls)).join("") + "</tr>";
          }
          if (index === 0) {
            rowsHtml += "<tr><td class=\"orgstem\" colspan=\"" + widest + "\"></td></tr>";
          }
        });
        body = "<table class=\"orgchart\"><tbody>" + rowsHtml + "</tbody></table>" +
          "<p class=\"orgnote\">Les fonctions portées par la même personne sont signalées par la répétition de son nom.</p>";
        break;
      }
      const chief = vars.manager_name || vars.company_name || "";
      const roles: Array<[string, string]> = [
        ["Référent pédagogique", vars.pedagogical_referent || vars.pedagogical_referent_name || chief],
        ["Référent qualité", vars.quality_referent || vars.quality_referent_name || chief],
        ["Référent handicap", vars.disability_referent || vars.disability_referent_name || chief],
        ["Référent administratif", vars.administrative_referent_name || chief],
      ];
      const cell = (role: string, name: string) =>
        `<td class="orgbox"><span class="orgrole">${escapeHtml(role)}</span><span class="orgname">${escapeHtml(name)}</span></td>`;
      body =
        `<table class="orgchart"><tbody>` +
        `<tr><td class="orgbox orgtop" colspan="4"><span class="orgrole">Direction</span>` +
        `<span class="orgname">${escapeHtml(chief)}</span></td></tr>` +
        `<tr><td class="orgstem" colspan="4"></td></tr>` +
        `<tr>${roles.map(([role, name]) => cell(role, name)).join("")}</tr>` +
        `</tbody></table>` +
        `<p class="orgnote">Les fonctions portées par la même personne sont signalées par la répétition de son nom.</p>`;
      break;
    }
    case "signature_block": {
      // Cachet + signature électronique de l'organisme (cf. migration
      // 0029_cachet_signature.sql), injectés automatiquement dès qu'ils sont
      // renseignés sur /parametres/identite-visuelle — sans ça, une simple
      // ligne "Signature" à remplir à la main, comme avant cette phase.
      //
      // {{director_name}} ajouté ici (Phase 32quater, 25/08/2026, Nora :
      // "il faudrait que tous les documents [...] la signature du dirigeant
      // en bas, surtout quand son nom apparaît. Sinon on a un décalage") :
      // plusieurs documents (attestation, convocation, résultats
      // d'évaluation...) nomment déjà le dirigeant plus haut dans le texte
      // ("Je soussigné(e) {{director_name}}...") mais le bloc signature en
      // bas de page n'affichait que le nom de l'organisme, jamais le nom de
      // la personne — d'où l'impression de décalage entre le texte et la
      // signature. Cohérent avec les documents contractuels
      // (convention_formation, contrat_formation_particulier...) qui
      // affichaient déjà nom + signature + cachet ensemble.
      const visuals = (vars.org_signature_image ?? "") + (vars.org_stamp_image ?? "");
      const orgColumn = `<div>${vars.company_name ?? ""}</div>
        ${vars.director_name ? `<div>${vars.director_name}</div>` : ""}
        ${visuals ? `<div class="signature-visuals">${visuals}</div>` : ""}
        <div class="signature-line">Signature</div>`;

      if (isStudentScopedTemplate) {
        // Document "par apprenant" (attestation, convocation, résultats
        // d'évaluation/positionnement...) : nomme un bénéficiaire précis,
        // donc les DEUX parties doivent apparaître en bas de page — même
        // patron à deux colonnes (organisme | apprenant) déjà utilisé pour
        // la convention/le contrat particulier/le dossier d'admission
        // (sections "signatures" en base, cf. document_template_sections),
        // pour que tous les documents "par apprenant" soient visuellement
        // cohérents entre eux, que leur bloc signature vienne d'ici ou d'un
        // html_template stocké en base. {{student_signature_block}} reprend
        // la signature électronique déjà enregistrée par l'apprenant sur
        // /parametres/session (Phase 30) — jamais ressaisie ici.
        body = `<table style="width:100%; margin-top:8pt;"><tbody><tr>
          <td style="width:50%; vertical-align:top;">${orgColumn}</td>
          <td style="width:50%; vertical-align:top;">
            <div>Le stagiaire, ${vars.student_name ?? ""}</div>
            <br/>
            ${vars.student_signature_block ?? ""}
          </td>
        </tr></tbody></table>`;
      } else {
        body = `<div class="signature">${orgColumn}</div>`;
      }
      break;
    }

    case "attendance_grid":
      body = renderAttendanceGrid(attendance.periods,
        attendance.beneficiaries,
        attendance.signatures,
        vars.org_signature_src || null
      );
      break;

    default:
      body = "";
  }

  // Mise en valeur des reponses : dans "Libelle : valeur", la valeur passe en
  // gras. Demande de Nora (30/09/2026) : sans cela, l'information utile se perd
  // dans la phrase.
  body = body.replace(
    /<p>([^<:]{3,90}\s:\s)([^<]{1,200})<\/p>/g,
    (match, label, value) =>
      /^[…\.\s]*$/.test(value) ? match : `<p>${label}<strong>${value}</strong></p>`
  );

  return `<section>${section.code === "header" || !section.title ? "" : `<h2>${escapeHtml(section.title)}</h2>`}${body}</section>`;
}

/**
 * Grille d'émargement dynamique — une page par demi-journée de la session,
 * listant tous les apprenants (dédupliqués) avec, s'il existe, le tracé de
 * signature capturé sur /emargement (cf. lib/actions/attendance.ts). Répond
 * à la demande de Nora (25/08/2026) : "avoir plusieurs apprenants, pouvoir
 * leur faire signer directement les émargements sur l'écran" — le PDF généré
 * reflète alors fidèlement ce qui a déjà été signé, plutôt qu'un tableau
 * statique à remplir à la main comme avant cette phase.
 */
function renderAttendanceGrid(
  periods: AttendancePeriod[],
  beneficiaries: Beneficiary[],
  signatures: AttendanceSignature[],
  trainerSignatureUrl: string | null = null
): string {
  if (beneficiaries.length === 0) {
    return `<p class="empty">Aucun apprenant renseigné pour cette session.</p>`;
  }
  if (periods.length === 0) {
    return `<p class="empty">Dates de session non renseignées : la feuille ne peut pas être générée.</p>`;
  }

  // Une seule feuille : les demi-journees en colonnes, les apprenants en
  // lignes. Retour de Nora (24/09/2026) : une page par demi-journee rendait
  // la feuille illisible et inutilement longue.
  const slotLabel = (slot: string) => (slot === "matin" ? "Matin" : "Après-midi");
  const dayLabel = (iso: string) => {
    const parts = String(iso).split("-");
    return parts.length === 3 ? parts[2] + "/" + parts[1] : String(iso);
  };

  const signatureFor = (beneficiaryId: string, period: AttendancePeriod) =>
    signatures.find(
      (s) =>
        String((s as { beneficiary_id?: string }).beneficiary_id ?? "") === beneficiaryId &&
        String((s as { period_date?: string }).period_date ?? "") === period.date &&
        String((s as { period_slot?: string }).period_slot ?? "") === period.slot
    );

  const head =
    "<tr><th class=\"attname\">Nom et prénom</th>" +
    periods
      .map(
        (p) =>
          "<th>" + escapeHtml(dayLabel(p.date)) + "<br/><span class=\"attslot\">" +
          escapeHtml(slotLabel(String(p.slot))) + "</span></th>"
      )
      .join("") +
    "</tr>";

  const rows = beneficiaries
    .map((b) => {
      const cells = periods
        .map((p) => {
          const sig = signatureFor(String(b.id), p);
          const url = sig ? (sig as { signature_data_url?: string | null }).signature_data_url : null;
          const content = url
            ? "<img src=\"" + String(url) + "\" alt=\"signature\" class=\"attsig\" />"
            : "&nbsp;";
          return "<td class=\"attcell\">" + content + "</td>";
        })
        .join("");
      return "<tr><td class=\"attname\">" + escapeHtml(b.full_name ?? "") + "</td>" + cells + "</tr>";
    })
    .join("");

  // La formatrice signe chaque demi-journee : on reprend la signature deposee
  // dans Identite visuelle plutot que de laisser la ligne vide.
  const trainerCell = trainerSignatureUrl
    ? "<td class=\"attcell\"><img src=\"" + trainerSignatureUrl + "\" alt=\"signature\" class=\"attsig\" /></td>"
    : "<td class=\"attcell\">&nbsp;</td>";
  const trainerRow =
    "<tr><td class=\"attname\">Formateur ou formatrice</td>" +
    periods.map(() => trainerCell).join("") +
    "</tr>";

  return (
    "<table class=\"attendance\"><thead>" + head + "</thead><tbody>" + rows + trainerRow +
    "</tbody></table>" +
    "<p class=\"attnote\">Chaque case est signée par la personne concernée pour la demi-journée correspondante. " +
    "Toute absence est mentionnée par la mention « absent » dans la case.</p>"
  );
}

function wrapDocument({
  org,
  templateLabel,
  sectionsHtml,
  vars,
}: {
  org: Organization;
  templateLabel: string;
  sectionsHtml: string;
  vars: Record<string, string>;
}): string {
  const primary = org.brand_color_primary || "#1e3a8a";
  const secondary = org.brand_color_secondary || "#64748b";
  // Identité visuelle (logo + police) — cf. migration 0028_identite_visuelle.sql
  // et claude/roadmap-produit-et-tarifs.md (socle technique de l'offre
  // "personnalisée"). Liste de polices fermée (lib/engine/branding-fonts.ts) :
  // les polices Google Fonts sont chargées via un <link>, uniquement quand
  // choisies, pour ne pas alourdir inutilement les documents restés en police
  // par défaut.
  const font = getFontOption(org.font_family);
  const fontLinkTag = font.googleFontHref
    ? `<link rel="stylesheet" href="${escapeHtml(font.googleFontHref)}" />`
    : "";
  const logoTag = org.logo_url
    ? `<img src="${escapeHtml(org.logo_url)}" alt="${escapeHtml(vars.company_name ?? "Logo")}" style="max-height:20mm; max-width:60mm; margin-bottom:8pt;" />`
    : `<div class="letterhead-name">${escapeHtml(org.company_name ?? "")}</div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
${fontLinkTag}
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap" />
<style>
  @page { margin: 24mm 18mm; }
  body { font-family: ${font.cssFontFamily}; color: #1f2937; font-size: 9.5pt; line-height: 1.38; }
  h1 { color: ${primary}; font-size: 15pt; margin-bottom: 4pt; }
  .subtitle { color: ${secondary}; font-size: 8.5pt; margin-bottom: 20pt; }
  section { margin-bottom: 11pt; }
  h2 { color: ${primary}; font-size: 11pt; border-bottom: 1px solid ${primary}33; padding-bottom: 4pt; margin-bottom: 8pt; }
  p { margin: 0 0 6pt; }
  ul { margin: 0; padding-left: 18pt; }
  li { margin-bottom: 4pt; }
  .empty { color: #6b7280; font-style: italic; }
  table { width: 100%; border-collapse: collapse; margin-top: 4pt; }
  th, td { text-align: left; padding: 3.5pt 6pt; border-bottom: 1px solid #e5e7eb; }
  th { color: ${secondary}; font-weight: 600; font-size: 8pt; text-transform: uppercase; }
  .signature-line { margin-top: 24pt; border-top: 1px solid #1f2937; width: 60mm; padding-top: 4pt; }
  .signature-visuals { display: flex; align-items: flex-end; gap: 12pt; margin-top: 10pt; }
  .attendance-period { page-break-inside: avoid; margin-bottom: 20pt; }
  .attendance-period + .attendance-period { page-break-before: always; }
  .attendance-period-label { font-weight: 600; color: ${primary}; margin-bottom: 4pt; }

${CHECKBOX_CSS}
    /* Case a cocher dessinee en CSS : le glyphe unicode sortait en carre vide
       selon la police choisie par le client (audit du 23/09/2026). */
    li.checkline { list-style: none; margin-left: 0; }
    li.checkline::before {
      content: ""; display: inline-block; width: 9px; height: 9px;
      border: 1px solid #555; border-radius: 1px; margin-right: 7px;
      vertical-align: baseline;
    }
    /* Valeurs longues dans les tableaux : on borne la colonne de libelles et
       on autorise la cesure plutot que de laisser deborder. */
    /* Pas de largeur imposee : sur un tableau a 8 colonnes, forcer 30% par en-tete
       ecrasait les colonnes suivantes et empilait les lettres a la verticale. */
    table td, table th { overflow-wrap: break-word; word-break: normal; hyphens: auto; font-size: 0.95em; }
    /* Un bloc de signature ne doit jamais partir seul sur une page. */
    .signature-block, section:last-of-type { break-inside: avoid; page-break-inside: avoid; }
  
    /* Sans logo, le nom de l'organisme fait office de papier a en-tete. */
    .letterhead-name { font-size: 17px; font-weight: 700; letter-spacing: 0.02em; color: var(--brand, #111); }
  
    /* Densite revue le 24/09/2026 : les documents partaient sur deux pages
       pour quelques lignes, et les cellules se chevauchaient. */
    table { width: 100%; border-collapse: collapse; margin: 6pt 0; }
    table td, table th { vertical-align: top; line-height: 1.3; }
    p { margin: 0 0 5pt; }
    ul, ol { margin: 0 0 6pt; padding-left: 16pt; }
    li { margin-bottom: 2pt; }
    h1 { margin-bottom: 2pt; }
    h2 { margin: 0 0 5pt; }
  
    /* Organigramme schematise (indicateur 21). */
    table.orgchart { width: 100%; border-collapse: separate; border-spacing: 6pt; margin: 6pt 0 2pt; }
    .orgbox { border: 1px solid ${primary}; border-radius: 3pt; padding: 5pt 4pt; text-align: center; vertical-align: middle; }
    .orgtop { background: #f3f4f6; }
    .orgrole { display: block; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.04em; color: ${secondary}; }
    .orgname { display: block; font-weight: 600; font-size: 9pt; margin-top: 2pt; }
    .orgstem { height: 10pt; border-left: 1px solid ${primary}; width: 0; }
    .orgnote { font-size: 7.5pt; color: #6b7280; font-style: italic; }
  
    /* Registre de veille imprime : beaucoup de colonnes, donc plus compact. */
    table.register { font-size: 7.8pt; }
    table.register th { width: auto; background: #f9fafb; }
    table.register td { line-height: 1.25; }
    .emptyregister { font-size: 8.5pt; color: #6b7280; font-style: italic; border: 1px dashed #d1d5db; padding: 6pt; }
  
    /* Emargement sur une seule feuille : demi-journees en colonnes. */
    table.attendance { font-size: 8pt; table-layout: fixed; }
    table.attendance th { background: #f9fafb; text-align: center; font-size: 7.5pt; }
    table.attendance .attslot { font-weight: 400; font-size: 6.8pt; color: #6b7280; }
    table.attendance .attname { text-align: left; width: 38mm; }
    table.attendance .attcell { height: 13mm; text-align: center; vertical-align: middle; }
    table.attendance .attsig { max-height: 12mm; max-width: 100%; }
    .attnote { font-size: 7.5pt; color: #6b7280; font-style: italic; }
  
    /* Mention manuscrite "Lu et approuve" au-dessus de la signature. */
    .handwritten {
      display: block; font-family: "Caveat", cursive; font-size: 15pt;
      color: #111827; line-height: 1.1; margin-bottom: 1pt;
    }
  </style>
</head>
<body>
  ${logoTag}
  <h1>${escapeHtml(templateLabel)}</h1>
  <p class="subtitle">${escapeHtml(vars.company_name ?? "")} — ${escapeHtml(vars.generated_date ?? "")}</p>
  ${sectionsHtml}
</body>
</html>`;
}
