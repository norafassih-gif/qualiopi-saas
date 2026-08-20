import type { TrainingDomainContent } from "./types";

/**
 * Contenu source : claude/banque-contenu-community-management.md (projet
 * "Logiciel qualiopi"). Sélection et reformulation pour une page publique —
 * les intitulés des objectifs/modules restent ceux réellement utilisés par
 * le moteur de règles, rien n'est inventé.
 */
export const communityManagementContent: TrainingDomainContent = {
  categoryId: "community_management",
  slug: "community-management",
  label: "Community Management / Réseaux sociaux",
  shortDescription:
    "Stratégie social media, création de contenu, animation de communauté : un dossier Qualiopi qui parle vraiment de réseaux sociaux, pas de généralités.",
  heroIntro:
    "Pour une formation en Community Management, un dossier Qualiopi générique tombe vite à côté : les objectifs pédagogiques, les questionnaires de positionnement et les modalités d'évaluation doivent parler d'Instagram, de LinkedIn, de calendrier éditorial ou de KPI social media — pas de généralités interchangeables avec n'importe quel autre domaine. Qualiopi Pilote construit votre programme et vos documents à partir d'une banque de contenu écrite spécifiquement pour ce métier.",
  objectiveGroups: [
    {
      title: "Stratégie et fondamentaux",
      objectives: [
        "Comprendre le panorama des réseaux sociaux et le fonctionnement des algorithmes de diffusion.",
        "Savoir définir une stratégie social media adaptée à sa cible et à ses objectifs.",
        "Définir sa cible et ses personas pour adapter sa communication digitale.",
        "Réaliser un audit des réseaux sociaux existants, du site internet et de la fiche Google My Business d'une entreprise.",
      ],
    },
    {
      title: "Création et gestion de contenu",
      objectives: [
        "Créer et programmer du contenu engageant sur les réseaux sociaux.",
        "Créer des stories et des Reels pour Instagram.",
        "Construire et exploiter un calendrier éditorial multi-plateformes.",
        "Identifier les tendances et créer des vidéos courtes sur TikTok.",
        "Utiliser un outil de gestion multi-comptes (Hootsuite, Meta Business Suite) pour programmer ses publications.",
      ],
    },
    {
      title: "Plateformes spécifiques",
      objectives: [
        "Optimiser son profil et sa page entreprise sur Instagram et Facebook.",
        "Optimiser son profil professionnel et la page entreprise sur LinkedIn.",
        "Utiliser Twitter/X pour la veille et la communication en temps réel.",
        "Optimiser une chaîne YouTube (SEO vidéo et monétisation).",
      ],
    },
    {
      title: "Pilotage et prospection B2B",
      objectives: [
        "Analyser les performances des publications et ajuster sa stratégie (KPI, reporting).",
        "Mettre en place une campagne de prospection ciblée avec LinkedIn Ads et Sales Navigator.",
        "Analyser des KPI B2B (leads générés, taux de conversion, engagement professionnel).",
        "Élaborer un plan d'action à 90 jours à partir d'un reporting LinkedIn.",
      ],
    },
  ],
  modulesStandard: {
    label: "Programme standard — 5 jours / 35 heures (public généraliste)",
    modules: [
      { title: "Panorama des réseaux sociaux, algorithmes et démarrage Facebook/Instagram", durationLabel: "7h" },
      { title: "Stratégie de contenu Instagram, stories & Reels, publicité Facebook basique", durationLabel: "7h" },
      { title: "LinkedIn (profil + page entreprise), Twitter/X veille, exercices multi-plateformes", durationLabel: "7h" },
      { title: "TikTok tendances & vidéos courtes, YouTube SEO/monétisation, atelier calendrier éditorial", durationLabel: "7h" },
      { title: "Outils de gestion (Hootsuite, Meta Business Suite), analyse des performances, évaluation finale", durationLabel: "7h" },
    ],
  },
  modulesVariant: {
    label: "Variante B2B — 3 jours / 21 heures",
    context:
      "Quand le public est salarié, en entreprise ou orienté prospection, le moteur ne se contente pas d'ajouter des blocs LinkedIn : il retire aussi TikTok et YouTube, jugés peu pertinents en B2B, et recentre le programme sur la prospection professionnelle.",
    modules: [
      { title: "Panorama réseaux sociaux (accent B2B), optimisation LinkedIn, atelier rédaction de posts", durationLabel: "7h" },
      { title: "LinkedIn Ads & Sales Navigator, veille concurrentielle, atelier campagne sponsorisée", durationLabel: "7h" },
      { title: "Outils multi-comptes (Buffer/Hootsuite), analyse KPI B2B, atelier reporting + plan d'action 90 jours", durationLabel: "7h" },
    ],
  },
  checkableThemes: [
    "Stratégie social media",
    "Définition de la cible",
    "Instagram",
    "Facebook",
    "TikTok",
    "LinkedIn",
    "Twitter / X",
    "YouTube",
    "Création de contenu",
    "Canva",
    "Vidéo",
    "Rédaction",
    "Calendrier éditorial",
    "Programmation / outils multi-comptes",
    "Engagement et animation de communauté",
    "Publicité (Meta Ads, LinkedIn Ads)",
    "Influence",
    "Statistiques et reporting",
    "Audit / diagnostic des réseaux existants",
  ],
  documentsNote:
    "À partir des thèmes cochés, votre durée de formation et votre public, Qualiopi Pilote génère automatiquement le programme, la convention, les questionnaires de positionnement et de satisfaction, les grilles d'évaluation (quiz, étude de cas, jeu de rôle) et l'ensemble des documents de preuve attendus par le référentiel Qualiopi — sans jargon à maîtriser de votre côté.",
  faqs: [
    {
      question: "Le programme généré parle-t-il vraiment de réseaux sociaux, ou juste de \"formation\" en général ?",
      answer:
        "Les objectifs, modules, questionnaires et évaluations sont écrits spécifiquement pour le community management (Instagram, LinkedIn, TikTok, calendrier éditorial, KPI social media...) — la banque de contenu de ce domaine compte plus de 90 blocs distincts, pas un texte générique recyclé pour tous les domaines.",
    },
    {
      question: "Et si mon public est plutôt B2B (prospection LinkedIn) que grand public ?",
      answer:
        "Le moteur détecte cette orientation à partir de vos réponses (durée choisie, type de public, objectif) et bascule automatiquement sur la variante B2B en 21 heures, qui remplace TikTok/YouTube par LinkedIn Ads, Sales Navigator et le reporting B2B.",
    },
    {
      question: "Est-ce que je peux ajouter des thèmes qui ne sont pas dans la liste (ex. Pinterest, Snapchat) ?",
      answer:
        "La banque de contenu s'enrichit en continu. Si un thème vous manque, contactez-nous : c'est exactement ce que le back-office est conçu pour ajouter sans redévelopper le moteur.",
    },
  ],
};
