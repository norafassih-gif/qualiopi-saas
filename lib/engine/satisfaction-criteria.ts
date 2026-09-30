// Criteres du questionnaire de satisfaction.
// Fichier separe : un fichier "use server" ne peut exporter que des fonctions.
export const SATISFACTION_CRITERIA = [
  { key: "q_attentes", label: "La formation a répondu à mes attentes" },
  { key: "q_objectifs", label: "Les objectifs pédagogiques étaient clairs" },
  { key: "q_contenu", label: "Le contenu était adapté à mon niveau" },
  { key: "q_formateur", label: "Le formateur a su s adapter et répondre à mes questions" },
  { key: "q_supports", label: "Les supports remis sont utiles et exploitables" },
  { key: "q_organisation", label: "L organisation matérielle était satisfaisante" },
  { key: "q_accessibilite", label: "Les conditions d accueil et d accessibilité étaient adaptées" },
  { key: "q_recommandation", label: "Je recommanderais cette formation" },
] as const;
