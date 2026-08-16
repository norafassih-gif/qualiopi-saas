import type { Organization } from "@/lib/actions/organization";
import type { Training } from "@/lib/actions/training";
import type { TrainingSession } from "@/lib/actions/session";

const MODALITY_LABELS: Record<string, string> = {
  presentiel: "présentiel",
  distanciel: "à distance",
  hybride: "hybride (présentiel et distanciel)",
};

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

/**
 * Construit le contexte de variables "champs de fusion" ({{company_name}},
 * {{training_name}}, etc. — cf. point "SYSTÈME DE VARIABLES" de la
 * conception) utilisé pour interpoler les modèles de document. Toute
 * variable absente d'ici est remplacée par une chaîne vide dans le document
 * final plutôt que de faire échouer la génération.
 */
export function resolveDocumentVariables(input: {
  org: Organization;
  training: Training;
  session: TrainingSession | null;
  beneficiaryName: string | null;
  beneficiaryCompany: string | null;
}): Record<string, string> {
  const { org, training, session, beneficiaryName, beneficiaryCompany } = input;

  return {
    company_name: org.company_name ?? "",
    commercial_name: org.commercial_name ?? org.company_name ?? "",
    siret: org.siret ?? "",
    address: org.address ?? "",
    phone: org.phone ?? "",
    email: org.email ?? "",
    manager_name: org.manager_name ?? "",
    pedagogical_referent: org.pedagogical_referent ?? "",
    quality_referent: org.quality_referent ?? "",
    disability_referent: org.disability_referent ?? "non désigné à ce jour",

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

    generated_date: formatDate(new Date().toISOString()),
  };
}
