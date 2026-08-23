import type { Organization } from "@/lib/actions/organization";
import type { TrainingSession, Beneficiary } from "@/lib/actions/session";

export type MissingFieldGroup = "entreprise" | "qualite" | "session";

export type MissingField = {
  label: string;
  group: MissingFieldGroup;
  href: string;
};

export const MISSING_FIELD_GROUP_LABELS: Record<MissingFieldGroup, string> = {
  entreprise: "Mon entreprise",
  qualite: "Mes informations qualité",
  session: "Ma session",
};

const GROUP_HREF: Record<MissingFieldGroup, string> = {
  entreprise: "/parametres/entreprise",
  qualite: "/parametres/qualite",
  session: "/parametres/session",
};

function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Recense les champs qui apparaîtront comme "[... à compléter]" (ou "à
 * préciser") dans les documents générés — demande explicite de Nora
 * (24/08/2026) : "on devrait avoir une alerte dès qu'il manque quelque
 * chose qui n'est pas rempli pour pouvoir générer un document", dans la
 * continuité de la Phase 30 ("on parle d'un audit, c'est très sérieux").
 *
 * Reflète EXACTEMENT les mêmes vérifications que lib/engine/document-
 * variables.ts (fonction required() et équivalents pour le tarif/le
 * financement) — si un champ est ajouté ici sans exister côté moteur de
 * documents (ou inversement), cette alerte se désynchronise du contenu
 * réel des PDF. Ne couvre volontairement PAS :
 *  - les champs sous-traitant/partenaire (déjà signalés directement sur
 *    /documents, juste à côté des 2 documents concernés) ;
 *  - les scores d'évaluation (normal tant qu'aucun QCM n'a été passé, ce
 *    n'est pas une donnée "oubliée") ;
 *  - {{student_role}} (poste du bénéficiaire) : n'utilise pas required(),
 *    reste une chaîne vide sans placeholder visible si non renseigné.
 */
export function getMissingRequiredFields(
  org: Organization,
  session: TrainingSession | null,
  beneficiary: Beneficiary | null
): MissingField[] {
  const missing: MissingField[] = [];
  const push = (group: MissingFieldGroup, label: string, value: string | null | undefined) => {
    if (isEmpty(value)) missing.push({ label, group, href: GROUP_HREF[group] });
  };

  push("entreprise", "SIRET", org.siret);
  push("entreprise", "Adresse", org.address);
  push("entreprise", "Téléphone", org.phone);
  push("entreprise", "Email", org.email);
  push("entreprise", "Nom du dirigeant", org.manager_name);

  push("qualite", "Référent pédagogique", org.pedagogical_referent);
  push("qualite", "Email du référent pédagogique", org.pedagogical_referent_email);
  push("qualite", "Téléphone du référent pédagogique", org.pedagogical_referent_phone);
  push("qualite", "Référent qualité", org.quality_referent);
  push("qualite", "Référent administratif", org.administrative_referent);
  push("qualite", "Email du référent administratif", org.administrative_referent_email);
  push("qualite", "Téléphone du référent administratif", org.administrative_referent_phone);
  push("qualite", "Référent handicap", org.disability_referent);
  push("qualite", "Email du référent handicap", org.disability_referent_email);
  push("qualite", "Téléphone du référent handicap", org.disability_referent_phone);

  if (session) {
    if (session.price_unit !== "gratuit" && session.price_amount == null) {
      missing.push({ label: "Tarif de la formation", group: "session", href: GROUP_HREF.session });
    }
    if (!session.funding_type) {
      missing.push({ label: "Mode de financement", group: "session", href: GROUP_HREF.session });
    }
  }

  if (beneficiary) {
    push("session", "Expérience du bénéficiaire dans le domaine", beneficiary.experience_level);
    push("session", "Difficultés actuelles du bénéficiaire", beneficiary.current_difficulties);
    push("session", "Attentes personnelles du bénéficiaire", beneficiary.personal_expectations);
    push("session", "Compétences visées en priorité", beneficiary.priority_skills);
    push("session", "Contexte professionnel du bénéficiaire", beneficiary.professional_context);
    push("session", "Résultats attendus par l'employeur/financeur", beneficiary.expected_results);
    push("session", "Modalité préférée du bénéficiaire", beneficiary.preferred_modality);
    push("session", "Rythme souhaité du bénéficiaire", beneficiary.preferred_rhythm);
    push("session", "Contraintes d'emploi du temps du bénéficiaire", beneficiary.schedule_constraints);
    if (beneficiary.has_disability == null) {
      missing.push({
        label: "Situation de handicap du bénéficiaire",
        group: "session",
        href: GROUP_HREF.session,
      });
    }
  }

  return missing;
}
