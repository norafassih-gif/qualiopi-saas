// Criteres des questionnaires de satisfaction des parties prenantes
// (indicateur 30) : financeurs et entreprises commanditaires. Partages par
// l'ecran de saisie et par le moteur de documents.
export type StakeholderKind = "financeur" | "entreprise";

export const STAKEHOLDER_LABELS: Record<StakeholderKind, { title: string; respondent: string }> = {
  financeur: { title: "Financeur", respondent: "Organisme financeur" },
  entreprise: { title: "Entreprise", respondent: "Entreprise" },
};

export const STAKEHOLDER_CRITERIA: Record<StakeholderKind, ReadonlyArray<{ key: string; label: string }>> = {
  financeur: [
    { key: "f_offre", label: "Clarté et accessibilité de l'offre de formation" },
    { key: "f_echanges", label: "Qualité des échanges et réactivité administrative" },
    { key: "f_conformite", label: "Conformité de la prestation à la commande" },
    { key: "f_suivi", label: "Qualité du suivi transmis (émargements, attestations, bilans)" },
    { key: "f_delais", label: "Respect des délais et des conditions convenues" },
    { key: "f_objectifs", label: "Atteinte des objectifs de la formation" },
  ],
  entreprise: [
    { key: "e_besoin", label: "Compréhension de votre besoin et conseil avant la formation" },
    { key: "e_organisation", label: "Qualité de la communication et de l'organisation (dates, lieu, horaires)" },
    { key: "e_contenu", label: "Adéquation du contenu de la formation aux besoins de l'entreprise" },
    { key: "e_formateur", label: "Compétences et pédagogie du formateur" },
    { key: "e_suivi", label: "Qualité du suivi de votre salarié pendant la formation" },
    { key: "e_competences", label: "Montée en compétences observée après la formation" },
  ],
};

export const STAKEHOLDER_QUESTIONS: Record<
  StakeholderKind,
  ReadonlyArray<{ field: "attentes" | "recommande" | "renouveler"; label: string; values: string[] }>
> = {
  financeur: [
    { field: "recommande", label: "Recommanderiez-vous notre organisme ?", values: ["oui", "non"] },
    { field: "renouveler", label: "Souhaitez-vous renouveler votre financement avec notre organisme ?", values: ["oui", "non"] },
  ],
  entreprise: [
    { field: "attentes", label: "Cette formation a-t-elle répondu aux attentes de l'entreprise ?", values: ["oui", "partiellement", "non"] },
    { field: "recommande", label: "Recommanderiez-vous notre organisme ?", values: ["oui", "non"] },
    { field: "renouveler", label: "Souhaitez-vous refaire appel à notre organisme ?", values: ["oui", "non"] },
  ],
};

export function isStakeholderKind(value: unknown): value is StakeholderKind {
  return value === "financeur" || value === "entreprise";
}
