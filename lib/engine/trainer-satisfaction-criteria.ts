// Criteres du questionnaire de satisfaction du formateur (indicateur 30 :
// appreciation des equipes pedagogiques). Partages par l'ecran de saisie
// et par le moteur de documents, pour que les deux disent la meme chose.
export const TRAINER_SATISFACTION_CRITERIA = [
  { key: "t_preparation", label: "Informations transmises avant la formation" },
  { key: "t_objectifs", label: "Clarté des objectifs et du programme à animer" },
  { key: "t_locaux", label: "Locaux ou plateforme à distance" },
  { key: "t_moyens", label: "Matériel et moyens pédagogiques mis à disposition" },
  { key: "t_groupe", label: "Niveau du groupe au regard des prérequis" },
  { key: "t_implication", label: "Implication et assiduité des apprenants" },
  { key: "t_suivi", label: "Communication et suivi par l'organisme" },
  { key: "t_conditions", label: "Respect des conditions convenues (planning, rémunération)" },
] as const;
