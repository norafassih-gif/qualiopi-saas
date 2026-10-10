// Contrôle de complétude des documents AVANT toute génération de PDF.
//
// Règle (demande de Nora, 10/10/2026, après un dossier AKADEMOS EVO sorti avec
// "représenté par" vide) : un document ne sort JAMAIS s'il lui manque une
// information. Toute variable utilisée par un modèle est donc OBLIGATOIRE par
// défaut ; seules celles listées dans OPTIONAL_VARIABLES peuvent rester vides.
//
// Trois filets, appliqués dans buildDocumentHtml (donc pour la route PDF et
// pour tout futur appelant) :
//  1. variable utilisée par un modèle mais vide ou inconnue ;
//  2. marqueur de remplacement visible dans le texte rendu
//     ("[... à compléter]", "[... à préciser]", "[Aucune évaluation ...]") ;
//  3. formule de signataire suivie de pointillés ("représenté par ……").

export type MissingItem = { label: string; href: string | null };

const HREF = {
  entreprise: "/parametres/entreprise",
  qualite: "/parametres/qualite",
  session: "/parametres/session",
  formation: "/parametres/formation",
  identite: "/parametres/identite-visuelle",
  sousTraitant: "/parametres/sous-traitant",
  partenaire: "/parametres/partenaire",
  evaluation: "/evaluation",
} as const;

// Variables autorisées à rester vides : informations réellement facultatives
// (elles ne s'appliquent pas à tous les organismes ou à tous les clients).
// Tout le reste est bloquant. Les variables nda_* (parcours NDA) sont
// facultatives par préfixe : leur contenu est calculé et peut être vide.
export const OPTIONAL_VARIABLES = new Set<string>([
  "company_website",
  "org_stamp_image",
  "org_signature_image",
  "org_signature_src",
  "external_trainer_discipline",
  "external_trainer_name",
  "external_trainer_contract_type",
  "technical_provider_name",
  "technical_provider_company",
  "funding_details",
  "student_company", // un particulier n'a pas d'entreprise ; la convention exige student_company_required
  "student_email",
  "student_role",
  "partner_contact_email",
  "partner_contact_phone",
  "partner_legal_representative_role",
  "partner_tutor_role",
  "partner_tutor_email",
  "partner_tutor_phone",
  "sole_practitioner_note",
  "trainer_signature_block", // cadre de signature manuscrite si le formateur n'est pas le dirigeant
]);

function isOptional(key: string): boolean {
  return OPTIONAL_VARIABLES.has(key) || key.startsWith("nda_");
}

// Nom lisible et page où renseigner chaque variable.
const VARIABLE_FIELDS: Record<string, MissingItem> = {
  company_name: { label: "Raison sociale", href: HREF.entreprise },
  commercial_name: { label: "Nom commercial", href: HREF.entreprise },
  manager_name: { label: "Nom du dirigeant", href: HREF.entreprise },
  director_name: { label: "Nom du dirigeant", href: HREF.entreprise },
  siret: { label: "SIRET", href: HREF.entreprise },
  address: { label: "Adresse", href: HREF.entreprise },
  phone: { label: "Téléphone", href: HREF.entreprise },
  email: { label: "Email", href: HREF.entreprise },
  organization_city: { label: "Ville du siège", href: HREF.qualite },
  region: { label: "Région", href: HREF.qualite },
  pedagogical_referent: { label: "Référent pédagogique", href: HREF.qualite },
  pedagogical_referent_name: { label: "Référent pédagogique", href: HREF.qualite },
  quality_referent: { label: "Référent qualité", href: HREF.qualite },
  quality_referent_name: { label: "Référent qualité", href: HREF.qualite },
  administrative_referent_name: { label: "Référent administratif", href: HREF.qualite },
  disability_referent_name: { label: "Référent handicap", href: HREF.qualite },
  training_name: { label: "Nom de la formation", href: HREF.formation },
  training_duration: { label: "Durée de la formation", href: HREF.formation },
  trainer_name: { label: "Nom du formateur", href: HREF.session },
  training_start_date: { label: "Date de début de la session", href: HREF.session },
  training_end_date: { label: "Date de fin de la session", href: HREF.session },
  training_hours: { label: "Horaires de la session", href: HREF.session },
  training_schedule_sentence: { label: "Dates de la session", href: HREF.session },
  schedule_table_row: { label: "Dates et horaires de la session", href: HREF.session },
  training_location: { label: "Lieu de la formation (ou « À distance »)", href: HREF.session },
  student_name: { label: "Nom du bénéficiaire", href: HREF.session },
  student_company_required: { label: "Entreprise du bénéficiaire (cocontractant)", href: HREF.session },
  student_company_representative: { label: "Représentant de l'entreprise cliente", href: HREF.session },
  diplomas_qualifications: { label: "Diplômes et qualifications du bénéficiaire", href: HREF.session },
  related_experience: { label: "Expérience professionnelle en lien avec la formation", href: HREF.session },
};

/** Page où renseigner une information, déduite de son libellé (pour les marqueurs "à compléter"). */
export function hrefForLabel(label: string): string | null {
  const l = label.toLowerCase();
  if (/(sous-traitant|taux horaire)/.test(l)) return HREF.sousTraitant;
  if (/(partenaire|tuteur|représentant légal)/.test(l)) return HREF.partenaire;
  if (/évaluation/.test(l)) return HREF.evaluation;
  if (/(référent|ville du siège|région)/.test(l)) return HREF.qualite;
  if (/(siret|adresse|téléphone|email|dirigeant|raison sociale)/.test(l)) return HREF.entreprise;
  if (/signature/.test(l)) return HREF.identite;
  if (
    /(tarif|financement|bénéficiaire|cocontractant|expérience|difficult|attentes|compétences|contexte|résultats|modalité|rythme|contraintes|handicap|diplôme|formateur)/.test(
      l
    )
  )
    return HREF.session;
  return null;
}

const KEY_PATTERN = /\{\{(\w+)\}\}/g;

/** Clés {{variable}} utilisées par les sections d'un modèle. */
export function templateKeys(sections: Array<{ html_template: string | null }>): string[] {
  const keys = new Set<string>();
  for (const section of sections) {
    for (const match of (section.html_template ?? "").matchAll(KEY_PATTERN)) keys.add(match[1]);
  }
  return [...keys];
}

/** Filet 1 : variables utilisées par le modèle mais vides ou inconnues. */
export function findEmptyVariables(keys: string[], vars: Record<string, string>): MissingItem[] {
  const items: MissingItem[] = [];
  for (const key of keys) {
    if (!(key in vars)) {
      items.push({ label: `Variable inconnue « ${key} » dans le modèle (erreur du modèle, à corriger dans l'administration)`, href: null });
      continue;
    }
    if (isOptional(key)) continue;
    if (String(vars[key] ?? "").trim().length === 0) {
      const known = VARIABLE_FIELDS[key];
      items.push(known ?? { label: `Information « ${key} »`, href: null });
    }
  }
  return items;
}

// Marqueurs visibles : "[SIRET à compléter]", "[Expérience à préciser]"...
const PLACEHOLDER_MARKER =
  /\[[^\]\n<>]{1,160}?(?:à compléter|à préciser|à renseigner|à saisir)[^\]\n<>]{0,80}\]|\[Aucune évaluation[^\]\n<>]{0,80}\]/gi;

// Formule de signataire suivie de pointillés : "représenté par ……………".
const SIGNATORY_WITH_DOTS = /représent(?:é|ée)\s+par\s*(?:<[^>]*>\s*)*(?:…{2,}|\.{4,})/i;

function cleanMarkerLabel(marker: string): string {
  let label = marker.replace(/^\[|\]$/g, "").trim();
  label = label.replace(/\s*[\u2014\u2013-]\s*à renseigner dans Mes paramètres/i, "");
  label = label.replace(/(?:\s*(?:à compléter|à préciser|à renseigner|à saisir))+\s*$/i, "");
  return label.trim();
}

/** Filets 2 et 3 : marqueurs de remplacement visibles dans le HTML des sections. */
export function findPlaceholderMarkers(sectionsHtml: string): MissingItem[] {
  const items: MissingItem[] = [];
  for (const match of sectionsHtml.matchAll(PLACEHOLDER_MARKER)) {
    const label = cleanMarkerLabel(match[0]) || "Résultat de l'évaluation";
    items.push({ label, href: hrefForLabel(label) });
  }
  if (SIGNATORY_WITH_DOTS.test(sectionsHtml)) {
    items.push({ label: "Nom du signataire (« représenté par » est vide)", href: HREF.session });
  }
  return items;
}

/** Fusionne les manques en supprimant les doublons de libellé. */
export function dedupeMissing(items: MissingItem[]): MissingItem[] {
  const seen = new Set<string>();
  const out: MissingItem[] = [];
  for (const item of items) {
    const key = item.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/** Message affiché à l'utilisateur quand la génération est bloquée. */
export function formatMissingMessage(templateLabel: string, items: MissingItem[]): string {
  const n = items.length;
  return (
    `Génération bloquée : il manque ${n} information${n > 1 ? "s" : ""} pour « ${templateLabel} » : ` +
    items.map((i) => i.label).join(" ; ") +
    ". Complétez-les puis relancez la génération."
  );
}
