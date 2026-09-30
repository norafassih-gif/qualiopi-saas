// Criteres du questionnaire de satisfaction.
// Ils reprennent mot pour mot ceux du formulaire papier remis au beneficiaire,
// pour que la saisie et le document dise la meme chose.
export const SATISFACTION_CRITERIA = [
  { key: "q_accessibilite", label: "Qualité de l accueil" },
  { key: "q_organisation", label: "Locaux ou plateforme à distance" },
  { key: "q_attentes", label: "Respect des horaires" },
  { key: "q_recommandation", label: "Communication avant la formation" },
  { key: "q_objectifs", label: "Clarté des objectifs annoncés" },
  { key: "q_supports", label: "Qualité des supports pédagogiques" },
  { key: "q_formateur", label: "Pédagogie et disponibilité du formateur" },
  { key: "q_contenu", label: "Adéquation du contenu avec vos besoins" },
] as const;
