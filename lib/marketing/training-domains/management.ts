import type { TrainingDomainContent } from "./types";

/**
 * Source : pivotformation.com/management (contenu réel Pivot Formation,
 * cf. demande de Nora du 20/08/2026).
 */
export const managementContent: TrainingDomainContent = {
  categoryId: "management",
  slug: "management",
  label: "Management",
  shortDescription:
    "Leadership, feedback, animation d'équipe : un dossier Qualiopi pensé pour de vrais managers de proximité, pas des généralités RH.",
  heroIntro:
    "Pour une formation en management, le programme doit parler à des managers de proximité en prise de poste : poser un cadre managérial, conduire des entretiens, animer une équipe, gérer les conflits. Qualiopi Pilote construit vos documents à partir de cette réalité de terrain, avec des mises en situation et des livrables concrets plutôt que de la théorie du leadership.",
  objectiveGroups: [
    {
      title: "Fondamentaux et posture managériale",
      objectives: [
        "Poser le cadre managérial (objectifs, rôles, règles, rituels).",
        "Clarifier son rôle, ses missions, son style et sa posture managériale.",
      ],
    },
    {
      title: "Communication et entretiens",
      objectives: [
        "Conduire des entretiens clés (1:1, feedback, recadrage, délégation, onboarding).",
        "Utiliser les outils DESC/SBI, l'écoute active, l'assertivité et une initiation à la CNV.",
      ],
    },
    {
      title: "Animation d'équipe et pilotage",
      objectives: [
        "Animer des réunions efficaces (objectifs, ordre du jour, time-boxing, décisions, compte rendu).",
        "Piloter la performance avec des indicateurs, tableaux de bord et méthodes de priorisation (Eisenhower, MoSCoW).",
      ],
    },
    {
      title: "Gestion des conflits et changement",
      objectives: [
        "Prévenir et gérer les conflits : signaux faibles, médiation, sensibilisation QVT/RPS.",
        "Accompagner le changement avec des modèles vulgarisés (ADKAR, Kotter).",
        "Adapter ses pratiques au management hybride (rituels à distance, collaboration asynchrone).",
      ],
    },
  ],
  modulesStandard: {
    label: "Huit modules, déclinables sur trois durées (35h / 70h / 105h)",
    modules: [
      { title: "Fondamentaux du management (rôle, missions, styles, posture, éthique)", durationLabel: "35h–105h" },
      { title: "Communication et feedback (DESC/SBI, écoute active, assertivité, CNV)", durationLabel: "35h–105h" },
      { title: "Entretiens managériaux (1:1, délégation, évaluation, onboarding)", durationLabel: "35h–105h" },
      { title: "Animation d'équipe et réunions", durationLabel: "35h–105h" },
      { title: "Pilotage de la performance (indicateurs, tableaux de bord, priorisation)", durationLabel: "35h–105h" },
      { title: "Gestion des conflits (prévention, médiation, QVT/RPS)", durationLabel: "35h–105h" },
      { title: "Conduite du changement (ADKAR, Kotter)", durationLabel: "35h–105h" },
      { title: "Management hybride (rituels à distance, collaboration asynchrone)", durationLabel: "35h–105h" },
    ],
  },
  checkableThemes: [
    "Posture managériale",
    "Feedback et communication managériale",
    "Entretiens (1:1, recadrage, délégation)",
    "Animation de réunions",
    "Pilotage de la performance",
    "Gestion des conflits",
    "Conduite du changement",
    "Management hybride / à distance",
  ],
  documentsNote:
    "À partir des thèmes cochés et du profil des managers formés, Qualiopi Pilote génère automatiquement le programme, la convention, les questionnaires et les évaluations : dossier cadre & rituels, simulations d'entretiens avec grille de critères, réunion animée évaluée, tableau de bord avec soutenance, et un projet fil rouge (plan managérial pour l'équipe du participant).",
  faqs: [
    {
      question: "Cette formation s'adresse-t-elle à des managers expérimentés ou débutants ?",
      answer:
        "Le programme cible d'abord les managers de proximité en prise de poste (chefs d'équipe, référents), sans exigence d'expérience managériale préalable — les entreprises et entrepreneurs souhaitant structurer leurs pratiques peuvent aussi l'utiliser.",
    },
    {
      question: "Les évaluations sont-elles théoriques (QCM) ou basées sur des mises en situation ?",
      answer:
        "Les évaluations reposent sur des mises en situation réelles : simulation d'entretien avec grille de critères, animation de réunion évaluée, et un projet fil rouge construit sur l'équipe réelle du participant.",
    },
  ],
};
