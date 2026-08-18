import type { Organization } from "@/lib/actions/organization";
import type { Training } from "@/lib/actions/training";
import type { TrainingSession } from "@/lib/actions/session";

const MODALITY_LABELS: Record<string, string> = {
  presentiel: "présentiel",
  distanciel: "à distance",
  hybride: "hybride (présentiel et distanciel)",
};

const PRICE_UNIT_LABELS: Record<string, string> = {
  gratuit: "Formation gratuite",
  total_ttc: "Prix total TTC",
  total_ht: "Prix total HT (TVA non applicable, art. 293 B du CGI, le cas échéant)",
  per_participant_ht: "Prix HT par participant",
  per_hour_ht: "Prix HT par heure de formation",
};

const FUNDING_TYPE_LABELS: Record<string, string> = {
  autofinancement: "Autofinancement (paiement direct par le bénéficiaire)",
  entreprise: "Prise en charge par l'entreprise",
  opco: "Financement OPCO",
  pole_emploi: "Financement France Travail (ex-Pôle Emploi)",
  cpf: "Financement CPF (Compte Personnel de Formation)",
  region: "Financement Conseil régional",
  autre: "Autre financeur",
};

function formatCurrency(amount: number | null, priceUnit: string | undefined): string {
  if (priceUnit === "gratuit") return "Gratuit";
  if (amount == null) return "[Tarif à compléter]";
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
}

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

// Pour les champs personnels (référents, contacts) qui n'ont pas de valeur
// par défaut sûre : plutôt que d'inventer une donnée ou de laisser un vide
// silencieux, on affiche un repère visible dans le document généré, pour que
// l'utilisateur sache qu'il doit compléter ce champ dans "Mon entreprise"
// avant de présenter le document à l'audit.
function required(value: string | null | undefined, label: string): string {
  return value && value.trim().length > 0 ? value : `[${label} à compléter]`;
}

/**
 * Construit le contexte de variables "champs de fusion" ({{company_name}},
 * {{training_name}}, etc. — cf. point "SYSTÈME DE VARIABLES" de la
 * conception) utilisé pour interpoler les modèles de document. Toute
 * variable absente d'ici est remplacée par une chaîne vide dans le document
 * final plutôt que de faire échouer la génération.
 */
// Dernière tentative d'évaluation complétée pour la formation (cf.
// lib/actions/evaluation.ts) — optionnelle : tant qu'aucun QCM n'a été
// passé, le document de résultat affiche des placeholders visibles plutôt
// que d'échouer (même logique que `required()` ci-dessus).
export type EvaluationResultForVariables = {
  score_raw: number;
  score_max: number;
  score_percent: number;
  passed: boolean;
  completed_at: string | null;
} | null;

export function resolveDocumentVariables(input: {
  org: Organization;
  training: Training;
  session: TrainingSession | null;
  beneficiaryName: string | null;
  beneficiaryCompany: string | null;
  beneficiaryEmail?: string | null;
  beneficiaryRole?: string | null;
  beneficiaryCount?: number;
  evaluationResult?: EvaluationResultForVariables;
}): Record<string, string> {
  const {
    org,
    training,
    session,
    beneficiaryName,
    beneficiaryCompany,
    beneficiaryEmail = null,
    beneficiaryRole = null,
    beneficiaryCount = 0,
    evaluationResult = null,
  } = input;

  return {
    company_name: org.company_name ?? "",
    commercial_name: org.commercial_name ?? org.company_name ?? "",
    siret: org.siret ?? "",
    address: org.address ?? "",
    organization_city: required(org.organization_city, "Ville du siège"),
    region: required(org.region, "Région"),
    jurisdiction: org.jurisdiction ?? "Tribunal de Commerce du lieu du siège social",
    phone: org.phone ?? "",
    email: org.email ?? "",
    company_website: org.website ?? "",
    manager_name: org.manager_name ?? "",
    director_name: required(org.manager_name, "Nom du dirigeant"),
    pedagogical_referent: org.pedagogical_referent ?? "",
    pedagogical_referent_name: required(org.pedagogical_referent, "Référent pédagogique"),
    pedagogical_referent_email: required(org.pedagogical_referent_email, "Email référent pédagogique"),
    pedagogical_referent_phone: required(org.pedagogical_referent_phone, "Téléphone référent pédagogique"),
    quality_referent: org.quality_referent ?? "",
    quality_referent_name: required(org.quality_referent, "Référent qualité"),
    administrative_referent_name: required(org.administrative_referent, "Référent administratif"),
    administrative_referent_email: required(org.administrative_referent_email, "Email référent administratif"),
    administrative_referent_phone: required(org.administrative_referent_phone, "Téléphone référent administratif"),
    disability_referent: org.disability_referent ?? "non désigné à ce jour",
    disability_referent_name: required(org.disability_referent, "Référent handicap"),
    disability_referent_email: required(org.disability_referent_email, "Email référent handicap"),
    disability_referent_phone: required(org.disability_referent_phone, "Téléphone référent handicap"),
    disability_contact_email: org.email ?? "",
    dpo_contact_email: org.dpo_contact_email ?? org.email ?? "",
    complaints_email: org.complaints_email ?? org.email ?? "",
    complaint_ack_delay: org.complaint_ack_delay ?? "48h ouvrées",
    complaint_response_delay: org.complaint_response_delay ?? "15 jours",

    is_sole_practitioner: org.is_sole_practitioner ? "true" : "false",
    sole_practitioner_note: org.is_sole_practitioner
      ? `${required(org.manager_name, "Nom du dirigeant")} assure seul(e) l'ensemble des fonctions ci-dessus — Prestataire indépendant.`
      : "",

    external_trainer_discipline: org.external_trainer_discipline ?? "",
    external_trainer_name: org.external_trainer_name ?? "",
    external_trainer_contract_type: org.external_trainer_contract_type ?? "",
    technical_provider_name: org.technical_provider_name ?? "",
    technical_provider_company: org.technical_provider_company ?? "",

    procedure_version: org.procedure_version ?? "1.0",
    archiving_duration: org.archiving_duration ?? "5 ans",
    archiving_duration_trainer_docs: org.archiving_duration_trainer_docs ?? "5 ans après la fin de la collaboration",
    watch_collect_frequency: org.watch_collect_frequency ?? "mensuelle",
    watch_review_frequency: org.watch_review_frequency ?? "semestrielle",
    insertion_survey_delay: org.insertion_survey_delay ?? "6 mois après la fin de la formation",
    training_budget_percent_payroll: org.training_budget_percent_payroll ?? "2 %",
    plan_period: org.plan_period ?? "2026-2027",
    satisfaction_rate_target: org.satisfaction_rate_target ?? "90 %",
    trainer_satisfaction_rate_target: org.trainer_satisfaction_rate_target ?? "90 %",
    partner_satisfaction_rate_target: org.partner_satisfaction_rate_target ?? "85 %",
    success_rate_target: org.success_rate_target ?? "80 %",
    insertion_rate_target_6months: org.insertion_rate_target_6months ?? "60 %",
    absence_relance_delay_1: org.absence_relance_delay_1 ?? "H+30",
    absence_relance_delay_2: org.absence_relance_delay_2 ?? "H+90",
    absence_relance_delay_3: org.absence_relance_delay_3 ?? "J+1",

    // Champs calculés du tableau de bord qualité (indicateur 32) : pas encore
    // de calcul automatique réel (nécessiterait d'agréger les réponses aux
    // questionnaires de satisfaction, non encore collectées) — affichés comme
    // "à renseigner" plutôt que d'inventer un chiffre.
    computed_learner_satisfaction: "à renseigner",
    computed_trainer_satisfaction: "à renseigner",
    computed_partner_satisfaction: "à renseigner",
    computed_complaints_resolved_ratio: "à renseigner",
    computed_success_rate: "à renseigner",
    computed_insertion_rate: "à renseigner",

    training_name: training.name ?? "",
    training_duration: training.duration_hours != null ? String(training.duration_hours) : "",
    training_modality: MODALITY_LABELS[training.modality ?? ""] ?? training.modality ?? "",
    training_audience:
      training.target_audience && training.target_audience.length > 0
        ? `Cette formation s'adresse à : ${training.target_audience.join(", ")}.`
        : "Cette formation s'adresse à tout public concerné par la thématique traitée.",

    trainer_name: session?.trainer_name ?? "",
    training_start_date: formatDate(session?.start_date ?? null),
    training_end_date: formatDate(session?.end_date ?? null),
    training_location: session?.location ?? "",

    student_name: beneficiaryName ?? "",
    student_company: beneficiaryCompany ?? "",
    student_email: beneficiaryEmail ?? "",
    student_role: beneficiaryRole ?? "",
    participant_count: beneficiaryCount > 0 ? String(beneficiaryCount) : "1",

    // Tarif / financement (cf. migration 0012) — utilisés par le devis, la
    // convention et le contrat de formation. Un placeholder visible plutôt
    // qu'un vide silencieux si la session n'a pas encore ces informations.
    price_amount_formatted: formatCurrency(session?.price_amount ?? null, session?.price_unit),
    price_unit_label: PRICE_UNIT_LABELS[session?.price_unit ?? "total_ttc"] ?? "Prix total TTC",
    funding_type_label: session?.funding_type
      ? FUNDING_TYPE_LABELS[session.funding_type] ?? "Autre financeur"
      : "[Mode de financement à compléter]",
    funding_details: session?.funding_details ?? "",
    payment_terms: session?.payment_terms || "Paiement à réception de facture, sauf accord contraire précisé ci-dessus.",
    quote_reference: session?.quote_reference || `DEV-${(session?.id ?? "").slice(0, 8).toUpperCase() || "XXXXXXXX"}`,
    convention_reference:
      session?.convention_reference || `CONV-${(session?.id ?? "").slice(0, 8).toUpperCase() || "XXXXXXXX"}`,

    generated_date: formatDate(new Date().toISOString()),

    // Résultat d'évaluation (QCM, cf. migration 0024/0025 — moteur
    // d'évaluation) : placeholders explicites tant qu'aucune tentative n'a
    // été complétée, pour ne pas laisser un document de résultat vide.
    evaluation_score_raw: evaluationResult ? String(evaluationResult.score_raw) : "[à compléter]",
    evaluation_score_max: evaluationResult ? String(evaluationResult.score_max) : "[à compléter]",
    evaluation_score_on20: evaluationResult
      ? (Math.round((evaluationResult.score_raw / evaluationResult.score_max) * 20 * 10) / 10).toString()
      : "[à compléter]",
    evaluation_score_percent: evaluationResult ? String(evaluationResult.score_percent) : "[à compléter]",
    evaluation_passed_label: evaluationResult
      ? evaluationResult.passed
        ? "Acquis (≥ 70 %)"
        : "Non acquis (< 70 %) — à retravailler"
      : "[Aucune évaluation complétée pour l'instant]",
    evaluation_completed_date: evaluationResult ? formatDate(evaluationResult.completed_at) : "[à compléter]",

    // Cachet et signature électronique de l'organisme (cf. migration
    // 0029_cachet_signature.sql) : des extraits HTML <img> prêts à l'emploi
    // plutôt que de simples URLs, pour pouvoir être insérés directement dans
    // un html_template rich_text (ex. un futur bloc de signature à deux
    // colonnes) sans logique supplémentaire côté moteur. Chaîne vide si
    // l'organisme n'a pas encore renseigné l'un ou l'autre — le
    // renderSection "signature_block" (lib/engine/document-builder.ts) gère
    // aussi ce cas et ne les injecte automatiquement que lorsqu'ils existent.
    org_stamp_image: org.stamp_url
      ? `<img src="${org.stamp_url}" alt="Cachet de l'organisme" style="max-height:28mm; max-width:28mm;" />`
      : "",
    org_signature_image: org.signature_url
      ? `<img src="${org.signature_url}" alt="Signature" style="max-height:18mm; max-width:50mm;" />`
      : "",
  };
}
