import type { Organization } from "@/lib/actions/organization";
import type { TrainingSession, Beneficiary } from "@/lib/actions/session";
import type { Partner, PartnerType } from "@/lib/actions/partners";

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

  // Ville du siège et région (cf. lib/engine/document-variables.ts,
  // required()) : utilisées sur la quasi-totalité des documents pour la
  // formule de clôture "Fait à {{organization_city}}, le ...", oubliées de
  // cette liste jusqu'ici — demande de Nora (25/08/2026) : "je veux bien
  // renseigner les informations manquantes, mais il faut que le système me
  // dise qu'elles sont manquantes."
  push("qualite", "Ville du siège", org.organization_city);
  push("qualite", "Région", org.region);

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

    // Phase 32ter, 24/08/2026 : Nora a généré une convention de formation
    // dont la ligne "cocontractant" était vide car l'entreprise du
    // bénéficiaire n'était pas renseignée (champ étiqueté "optionnel" sur
    // /parametres/session). Ne signaler ce champ que lorsque le financement
    // suppose une entreprise/OPCO cocontractant — pas pour un particulier en
    // autofinancement/CPF, pour qui ce champ est réellement facultatif.
    if (
      session &&
      (session.funding_type === "entreprise" || session.funding_type === "opco") &&
      isEmpty(beneficiary.company)
    ) {
      missing.push({
        label: "Entreprise du bénéficiaire (nécessaire pour la convention de formation)",
        group: "session",
        href: GROUP_HREF.session,
      });
    }
  }

  return missing;
}

// Champs sous-traitant/partenaire (table partners, migration 0032) qui
// s'affichent en "[... à compléter]" dans le Contrat de sous-traitance et la
// Convention de partenariat (cf. lib/engine/document-variables.ts, variables
// partner_*) si non renseignés. Volontairement PAS dans
// getMissingRequiredFields() : contrairement aux référents ou à la session,
// un organisme qui ne travaille jamais avec de sous-traitant ou de
// partenaire n'a simplement pas de fiche à créer — l'afficher dans la
// bannière générale serait une alerte permanente et non pertinente pour la
// majorité des organismes. Affiché à la place directement sur la carte du
// document concerné (cf. app/(app)/documents/page.tsx), seulement quand
// l'organisme a commencé à générer ce document précis.
//
// IMPORTANT — spécifique au type (bug corrigé le 25/08/2026, Nora : "j'ai
// bien mis mes coordonnées [...] mais ça me met toujours en orange") : le
// Contrat de sous-traitance (indicateur 27) n'utilise NULLE PART
// {{partner_legal_representative_name}} ni {{partner_tutor_name}} — et le
// formulaire (app/(app)/parametres/_components/partner-form.tsx) ne montre
// même pas ces 2 champs pour un sous-traitant, seulement pour un
// partenaire. Les exiger pour le type "sous_traitant" rendait la fiche
// impossible à compléter. Seule la Convention de partenariat (indicateur
// 28) les utilise réellement — et n'utilise jamais hourly_rate.
export function isPartnerInfoComplete(partner: Partner | null, partnerType: PartnerType): boolean {
  if (!partner) return false;
  const hasCoreIdentity =
    !isEmpty(partner.full_name) && !isEmpty(partner.siret) && !isEmpty(partner.address);
  if (!hasCoreIdentity) return false;

  if (partnerType === "sous_traitant") {
    return partner.hourly_rate != null;
  }
  return !isEmpty(partner.legal_representative_name) && !isEmpty(partner.tutor_name);
}
