import type { TrainingDomainContent } from "./types";

/**
 * Source : pivotformation.com/outils-informatique-suite-office-google
 * (contenu réel Pivot Formation, cf. demande de Nora du 20/08/2026).
 */
export const bureautiqueContent: TrainingDomainContent = {
  categoryId: "bureautique",
  slug: "bureautique",
  label: "Bureautique",
  shortDescription:
    "Word/Docs, Excel/Sheets, PowerPoint/Slides, outils collaboratifs : un dossier Qualiopi orienté cas métier, pas un simple survol des logiciels.",
  heroIntro:
    "Pour une formation bureautique, le programme doit produire des compétences réellement transférables au poste : documents professionnels bien structurés, tableaux avec formules et graphiques, présentations claires, organisation cloud. Qualiopi Pilote construit vos documents à partir de cette logique par objectif, pas d'un catalogue générique de fonctionnalités.",
  objectiveGroups: [
    {
      title: "Documents et présentations",
      objectives: [
        "Créer, mettre en forme et structurer des documents professionnels (modèles, sommaires, styles).",
        "Concevoir des présentations claires (gabarits, masques, storytelling, médias).",
      ],
    },
    {
      title: "Tableurs et analyse",
      objectives: [
        "Construire des tableaux et analyses de base à intermédiaire (formules, filtres, tableaux croisés dynamiques, graphiques).",
      ],
    },
    {
      title: "Organisation et collaboration",
      objectives: [
        "Organiser l'information et le temps (messagerie, agendas, Drive/OneDrive, partage et co-édition).",
        "Mettre en place des méthodes et modèles réutilisables (checklists, automatisations simples).",
      ],
    },
  ],
  modulesStandard: {
    label: "Cinq modules, déclinables sur trois durées (35h / 70h / 105h)",
    modules: [
      { title: "Word / Docs (styles, mise en page, tableaux, modèles, publipostage de base)", durationLabel: "35h–105h" },
      { title: "Excel / Sheets (formules, SI, RECHERCHEV/XLOOKUP, tableaux croisés dynamiques, graphiques)", durationLabel: "35h–105h" },
      { title: "PowerPoint / Slides (masques, gabarits, storytelling, export PDF/vidéo)", durationLabel: "35h–105h" },
      { title: "Outlook / Gmail & agenda (filtres, signatures, règles, agendas partagés)", durationLabel: "35h–105h" },
      { title: "Collaboration et cloud (arborescence, versioning, partage, co-édition temps réel)", durationLabel: "35h–105h" },
    ],
  },
  modulesVariant: {
    label: "Parcours Avancé — 105 heures",
    context:
      "Le parcours le plus long va au-delà des fondamentaux : projets complets multi-outils, kits par service, optimisation de flux de travail.",
    modules: [
      { title: "Projets complets multi-outils (Word + Excel + PowerPoint combinés)", durationLabel: "105h" },
      { title: "Kits par service (administratif, commercial, RH, finance)", durationLabel: "105h" },
      { title: "Optimisation de flux et automatisations légères", durationLabel: "105h" },
    ],
  },
  checkableThemes: [
    "Word / Google Docs",
    "Excel / Google Sheets",
    "PowerPoint / Google Slides",
    "Messagerie et agenda (Outlook, Gmail)",
    "Cloud et collaboration (Drive, OneDrive)",
    "Tableaux croisés dynamiques",
    "Publipostage",
    "Automatisations simples",
  ],
  documentsNote:
    "À partir des logiciels cochés (Word/Docs, Excel/Sheets, PowerPoint/Slides...) et du public (administratif, commercial, RH, finance...), Qualiopi Pilote génère automatiquement le programme, la convention et les évaluations : document formaté selon des critères professionnels, tableau avec formules et graphiques, présentation avec médias, organisation cloud testée en partage et co-édition.",
  faqs: [
    {
      question: "La formation couvre-t-elle à la fois Microsoft Office et Google Workspace ?",
      answer:
        "Oui, le programme est conçu pour les deux suites en parallèle (Word/Docs, Excel/Sheets, PowerPoint/Slides, Outlook/Gmail) — vous choisissez l'orientation selon les outils réellement utilisés par vos stagiaires.",
    },
    {
      question: "Le contenu est-il vraiment adapté à un public non technique ?",
      answer:
        "Oui, aucune expérience avancée n'est requise en prérequis — seule une aisance de base (clavier/souris, navigation web) est nécessaire, et la progression va du niveau débutant à des projets multi-outils avancés.",
    },
  ],
};
