"use server";

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
    | "attendance_grid";
  html_template: string | null;
  source_content_block_type: string | null;
  // "training" (défaut) : blocs réellement retenus pour cette formation via
  // le moteur de règles (ex. programme). "global" : tous les blocs actifs de
  // ce type dans la banque de contenu, sans lien avec une formation précise
  // (ex. fiches de poste, sources de veille) — cf. migration 0009.
  content_block_scope: "training" | "global";
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
  | { error: string };

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
    supabase.from("document_templates").select("id, label").eq("id", documentTemplateId).maybeSingle(),
    supabase
      .from("document_template_sections")
      .select("code, title, sort_order, content_type, html_template, source_content_block_type, content_block_scope")
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
  let beneficiaryEmail: string | null = null;
  let beneficiaryRole: string | null = null;
  let beneficiaryCount = 0;
  let beneficiarySignatureName: string | null = null;
  let beneficiarySignatureAccepted = false;
  let beneficiarySignatureDate: string | null = null;
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
      beneficiaryEmail = beneficiary.email;
      beneficiaryRole = beneficiary.role;
      beneficiarySignatureName = beneficiary.signature_name;
      beneficiarySignatureAccepted = beneficiary.signature_accepted;
      beneficiarySignatureDate = beneficiary.signature_date;
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
    }
    beneficiaryCount = countDistinctBeneficiaries(allBeneficiaries);
    sessionBeneficiaries = allBeneficiaries;
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
    .select("score_raw, score_max, score_percent, passed, completed_at")
    .eq("training_id", training.id)
    .not("completed_at", "is", null);
  if (evaluationPhaseFilter) {
    evaluationAttemptQuery = evaluationAttemptQuery.eq("phase", evaluationPhaseFilter);
  }
  const { data: latestAttempt } = await evaluationAttemptQuery
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const partnerType = PARTNER_TYPE_BY_TEMPLATE[documentTemplateId];
  const partner = partnerType ? await getMyFirstPartner(partnerType) : null;

  const vars = resolveDocumentVariables({
    org,
    training,
    session,
    beneficiaryName,
    beneficiaryCompany,
    beneficiaryEmail,
    beneficiaryRole,
    beneficiaryCount,
    beneficiarySignatureName,
    beneficiarySignatureAccepted,
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
  const moduleRows = (modulesResponse.data ?? []) as unknown as ModuleRow[];

  const globalBlocksByType = new Map<string, string[]>();
  for (const block of globalBlocksResponse.data ?? []) {
    const list = globalBlocksByType.get(block.type) ?? [];
    list.push(block.text);
    globalBlocksByType.set(block.type, list);
  }

  const sectionsHtml = sections
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
        isStudentScopedTemplate
      )
    )
    .join("\n");

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
  isStudentScopedTemplate: boolean
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
            .map((line) => `<li>☐ ${escapeHtml(interpolate(line, vars))}</li>`)
            .join("")}</ul>`
        : "";
      break;

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
      body = renderAttendanceGrid(attendance.periods, attendance.beneficiaries, attendance.signatures);
      break;

    default:
      body = "";
  }

  return `<section><h2>${escapeHtml(section.title)}</h2>${body}</section>`;
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
  signatures: AttendanceSignature[]
): string {
  if (beneficiaries.length === 0) {
    return `<p class="empty">Aucun apprenant enregistré pour cette session — complétez d'abord "Ma session".</p>`;
  }
  if (periods.length === 0) {
    return `<p class="empty">Dates de session manquantes — complétez les dates de début/fin sur "Ma session" pour générer la grille d'émargement.</p>`;
  }

  const signatureByKey = new Map<string, AttendanceSignature>();
  for (const sig of signatures) {
    signatureByKey.set(`${sig.beneficiary_id}|${sig.period_date}|${sig.period_slot}`, sig);
  }

  return periods
    .map((period) => {
      const rows = beneficiaries
        .map((b, index) => {
          const sig = signatureByKey.get(`${b.id}|${period.date}|${period.slot}`);
          const cell = sig
            ? `<img src="${sig.signature_data_url}" alt="Signature" style="max-height:14mm; max-width:40mm;" />`
            : "";
          return `<tr><td>${index + 1}</td><td>${escapeHtml(b.full_name)}</td><td>${cell}</td></tr>`;
        })
        .join("");
      return `<div class="attendance-period">
        <p class="attendance-period-label">${escapeHtml(formatPeriodLabel(period))}</p>
        <table><thead><tr><th>N°</th><th>Nom et prénom</th><th>Signature</th></tr></thead><tbody>${rows}</tbody></table>
        <p style="margin-top:8pt;">Signature du formateur / de la formatrice : ……………………………</p>
      </div>`;
    })
    .join("");
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
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
${fontLinkTag}
<style>
  @page { margin: 24mm 18mm; }
  body { font-family: ${font.cssFontFamily}; color: #1f2937; font-size: 11pt; line-height: 1.5; }
  h1 { color: ${primary}; font-size: 18pt; margin-bottom: 4pt; }
  .subtitle { color: ${secondary}; font-size: 10pt; margin-bottom: 20pt; }
  section { margin-bottom: 16pt; }
  h2 { color: ${primary}; font-size: 12pt; border-bottom: 1px solid ${primary}33; padding-bottom: 4pt; margin-bottom: 8pt; }
  p { margin: 0 0 6pt; }
  ul { margin: 0; padding-left: 18pt; }
  li { margin-bottom: 4pt; }
  .empty { color: #6b7280; font-style: italic; }
  table { width: 100%; border-collapse: collapse; margin-top: 4pt; }
  th, td { text-align: left; padding: 6pt 8pt; border-bottom: 1px solid #e5e7eb; }
  th { color: ${secondary}; font-weight: 600; font-size: 9pt; text-transform: uppercase; }
  .signature-line { margin-top: 24pt; border-top: 1px solid #1f2937; width: 60mm; padding-top: 4pt; }
  .signature-visuals { display: flex; align-items: flex-end; gap: 12pt; margin-top: 10pt; }
  .attendance-period { page-break-inside: avoid; margin-bottom: 20pt; }
  .attendance-period + .attendance-period { page-break-before: always; }
  .attendance-period-label { font-weight: 600; color: ${primary}; margin-bottom: 4pt; }
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
