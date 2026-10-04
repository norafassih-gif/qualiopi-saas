// Parcours proposés à l'entrée du logiciel, formes juridiques et règles du
// parcours guidé de déclaration d'activité (NDA). Fichier pur, partagé par
// les écrans et les actions serveur (aucun appel réseau, aucune IA).

export type Track = "nda" | "qualiopi_initial" | "qualiopi_surveillance";

export const TRACKS: { id: Track; title: string; subtitle: string; description: string }[] = [
  {
    id: "nda",
    title: "Créer mon organisme",
    subtitle: "Déclaration d'activité (NDA)",
    description:
      "Vous n'avez pas encore de numéro de déclaration d'activité. Nous vous guidons étape par étape sur Mon Activité Formation et préparons toutes les pièces justificatives.",
  },
  {
    id: "qualiopi_initial",
    title: "Préparer mon audit Qualiopi",
    subtitle: "Audit initial",
    description:
      "Vous avez votre NDA et visez la certification. Le logiciel génère votre dossier complet, classé par critère et par indicateur.",
  },
  {
    id: "qualiopi_surveillance",
    title: "Préparer mon audit de surveillance",
    subtitle: "Organisme déjà certifié",
    description:
      "Vous êtes certifié Qualiopi. Rassemblez les preuves de fonctionnement de vos sessions (émargements, satisfaction, réclamations, veille, amélioration continue).",
  },
];

export function trackLabel(track: string | null | undefined): string {
  const t = TRACKS.find((x) => x.id === track);
  return t ? `${t.title} (${t.subtitle})` : "Préparer mon audit Qualiopi (Audit initial)";
}

export type LegalForm = "micro_entreprise" | "ei" | "eurl" | "sarl" | "sasu" | "sas" | "association" | "autre";

export const LEGAL_FORMS: {
  id: LegalForm;
  label: string;
  /** Qualité du dirigeant dans le formulaire MAF (Responsables juridiques). */
  managerTitle: string;
  /** Exercice comptable imposé du 01/01 au 31/12. */
  calendarYear: boolean;
  /** Justificatif d'immatriculation à joindre. */
  registrationProof: string;
}[] = [
  { id: "micro_entreprise", label: "Micro-entreprise (auto-entrepreneur)", managerTitle: "Entrepreneur individuel", calendarYear: true, registrationProof: "Avis de situation au répertoire Sirene" },
  { id: "ei", label: "Entreprise individuelle (EI, hors micro)", managerTitle: "Entrepreneur individuel", calendarYear: false, registrationProof: "Avis de situation au répertoire Sirene" },
  { id: "eurl", label: "EURL", managerTitle: "Gérant(e)", calendarYear: false, registrationProof: "Extrait Kbis de moins de 3 mois et statuts" },
  { id: "sarl", label: "SARL", managerTitle: "Gérant(e)", calendarYear: false, registrationProof: "Extrait Kbis de moins de 3 mois et statuts" },
  { id: "sasu", label: "SASU", managerTitle: "Président(e)", calendarYear: false, registrationProof: "Extrait Kbis de moins de 3 mois et statuts" },
  { id: "sas", label: "SAS", managerTitle: "Président(e)", calendarYear: false, registrationProof: "Extrait Kbis de moins de 3 mois et statuts" },
  { id: "association", label: "Association", managerTitle: "Président(e)", calendarYear: false, registrationProof: "Récépissé de déclaration en préfecture et statuts" },
  { id: "autre", label: "Autre forme juridique", managerTitle: "Dirigeant(e)", calendarYear: false, registrationProof: "Justificatif d'immatriculation de votre structure" },
];

export function legalFormInfo(id: string | null | undefined) {
  return LEGAL_FORMS.find((f) => f.id === id) ?? null;
}

/** Texte proposé pour le champ « Précisions sur le statut » du formulaire MAF. */
export function statusDetailsText(legalForm: string | null, companyName: string, siret: string | null): string {
  const s = siret ? `, SIRET ${formatSiret(siret)}` : "";
  switch (legalForm) {
    case "micro_entreprise":
      return `Entrepreneur individuel sous le régime de la micro-entreprise (micro-entrepreneur), activité de formation professionnelle continue${s}.`;
    case "ei":
      return `Entrepreneur individuel, activité de formation professionnelle continue${s}.`;
    case "eurl":
    case "sarl":
    case "sasu":
    case "sas":
      return `${companyName}, ${legalFormInfo(legalForm)?.label}, exerçant une activité de formation professionnelle continue${s}.`;
    case "association":
      return `Association ${companyName}, exerçant une activité de formation professionnelle continue${s}.`;
    default:
      return `${companyName}, activité de formation professionnelle continue${s}.`;
  }
}

export function formatSiret(siret: string): string {
  const d = siret.replace(/\D/g, "");
  if (d.length !== 14) return siret;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
}

/** SIREN (9 premiers chiffres) et numéro d'établissement / NIC (5 derniers). */
export function splitSiret(siret: string | null): { siren: string | null; nic: string | null } {
  const d = (siret ?? "").replace(/\D/g, "");
  if (d.length !== 14) return { siren: null, nic: null };
  return { siren: d.slice(0, 9), nic: d.slice(9) };
}

/** Spécialité de formation (nomenclature NSF) proposée selon le domaine choisi. */
export const NSF_BY_CATEGORY: Record<string, string> = {
  langues: "136 - Langues vivantes, civilisations étrangères et régionales",
  community_management: "320 - Spécialités plurivalentes de la communication",
  marketing_digital: "320 - Spécialités plurivalentes de la communication",
  communication: "320 - Spécialités plurivalentes de la communication",
  vente_commerce: "312 - Commerce, vente",
  management: "310 - Spécialités plurivalentes des échanges et de la gestion",
  entrepreneuriat_gestion: "310 - Spécialités plurivalentes des échanges et de la gestion",
  ressources_humaines: "315 - Ressources humaines, gestion du personnel, gestion de l'emploi",
  bureautique: "324 - Secrétariat, bureautique",
  web_digital: "326 - Informatique, traitement de l'information, réseaux de transmission",
};

/** Seuil de chiffre d'affaires affiché par Mon Activité Formation (2026). */
export const NDA_REVENUE_THRESHOLD = "83 600 €";

export const NDA_LINKS = {
  maf: "https://www.monactiviteformation.emploi.gouv.fr",
  sirene: "https://avis-situation-sirene.insee.fr/",
  casier: "https://casier-judiciaire.justice.gouv.fr/",
};

/** Étapes du parcours guidé, dans l'ordre exact du formulaire MAF. */
export const NDA_STEPS: { key: string; title: string }[] = [
  { key: "avant", title: "Avant de commencer" },
  { key: "declarant", title: "1. Déclarant" },
  { key: "statut", title: "2. Statut" },
  { key: "activite", title: "3. Activité" },
  { key: "formateurs", title: "4. Formateurs" },
  { key: "formations", title: "5. Formations dispensées" },
  { key: "responsables", title: "6. Responsables juridiques" },
  { key: "signataire", title: "7. Signataire" },
  { key: "suspensions", title: "8. Historique des suspensions" },
  { key: "depot", title: "Après le dépôt" },
];
