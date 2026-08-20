import type { TrainingDomainContent } from "./types";

/**
 * Source : pivotformation.com/cours-danglais-niveau-a1-c2 et
 * /cours-de-francais-niveau-a1-c2 (contenu réel Pivot Formation, cf.
 * demande de Nora du 20/08/2026 : "tu peux trouver certaines info sur mon
 * site evaluation.pivotformation.com"). Les niveaux, objectifs et méthodes
 * d'évaluation reprennent le programme réellement publié.
 */
export const languesContent: TrainingDomainContent = {
  categoryId: "langues",
  slug: "langues",
  label: "Langues",
  shortDescription:
    "Anglais et français, du niveau A1 au niveau C2 (CECRL) : un programme et des documents Qualiopi qui parlent vraiment de progression linguistique, pas de généralités.",
  heroIntro:
    "Pour une formation en langues, le dossier Qualiopi doit refléter une vraie logique de progression CECRL — positionnement à l'entrée, objectifs différents à chaque niveau, méthodes d'évaluation adaptées (oral, écrit, mise en situation). Qualiopi Pilote construit vos documents à partir d'une banque de contenu organisée par niveau, pas d'un programme générique recopié pour tous les domaines.",
  objectiveGroups: [
    {
      title: "Niveaux A1 / A2 — bases",
      objectives: [
        "Se présenter, présenter quelqu'un, demander et donner des informations personnelles simples.",
        "Maîtriser les expressions familières du quotidien (salutations, achats simples, directions basiques).",
        "Échanger des informations simples sur la vie quotidienne, le travail, les déplacements.",
        "Gérer une réservation ou un achat en autonomie.",
      ],
    },
    {
      title: "Niveaux B1 / B2 — usage professionnel",
      objectives: [
        "Comprendre les points essentiels d'une réunion simple ou d'une présentation courte.",
        "Gérer des appels et interactions professionnelles courantes.",
        "Argumenter et nuancer dans un contexte professionnel plus complexe.",
        "Rédiger des emails détaillés, des synthèses et des rapports courts.",
      ],
    },
    {
      title: "Niveaux C1 / C2 — maîtrise",
      objectives: [
        "Comprendre des discours longs ou exigeants et identifier les implicites et nuances.",
        "Argumenter avec finesse, présenter et défendre des positions complexes.",
        "S'exprimer spontanément et couramment, dans tous les registres.",
        "Mobiliser la rhétorique et la persuasion en négociation complexe.",
      ],
    },
  ],
  modulesStandard: {
    label: "Trois durées, selon le niveau de départ et l'objectif visé",
    modules: [
      { title: "Essentiel — positionnement + fondamentaux du niveau visé", durationLabel: "35h" },
      { title: "Opérationnel — consolidation et mise en situation professionnelle", durationLabel: "70h" },
      { title: "Avancé — approfondissement, projets et présentation soutenue", durationLabel: "105h" },
    ],
  },
  checkableThemes: [
    "Anglais",
    "Français langue étrangère",
    "Positionnement CECRL à l'entrée",
    "Expression orale",
    "Compréhension écrite",
    "Rédaction professionnelle",
    "Négociation et présentation",
    "Vocabulaire métier",
    "Grammaire et phonétique",
    "Mise en situation professionnelle",
  ],
  documentsNote:
    "À partir du niveau visé (A1 à C2), de la langue et de la durée choisie, Qualiopi Pilote génère automatiquement le programme, le test de positionnement, la convention, les questionnaires et les grilles d'évaluation adaptés à la progression CECRL — dialogues guidés et QCM pour les niveaux débutants, présentation soutenue et médiation multi-sources pour les niveaux avancés.",
  faqs: [
    {
      question: "Comment le positionnement initial est-il pris en compte ?",
      answer:
        "Le test d'entrée et l'auto-positionnement CECRL orientent vers le bon niveau de départ ; le programme et les documents générés s'ajustent en conséquence, plutôt que de proposer un parcours unique à tout le monde.",
    },
    {
      question: "Les méthodes d'évaluation sont-elles les mêmes à tous les niveaux ?",
      answer:
        "Non : dialogues guidés et mini-production écrite en A1, jusqu'à une présentation soutenue avec questions-réponses et un exercice de médiation multi-sources en C2 — le moteur adapte la grille d'évaluation générée au niveau réellement visé.",
    },
    {
      question: "Peut-on adapter le programme à un objectif professionnel précis (ex. négociation en anglais) ?",
      answer:
        "Oui, les thèmes et mises en situation professionnelles (appels, réunions, rapports, négociation) font partie de la banque de contenu à partir du niveau B1.",
    },
  ],
};
