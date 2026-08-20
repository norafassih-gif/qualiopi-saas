import type { TrainingDomainContent } from "./types";

/**
 * Source : pivotformation.com/communication-digitale (contenu réel Pivot
 * Formation, cf. demande de Nora du 20/08/2026).
 */
export const communicationContent: TrainingDomainContent = {
  categoryId: "communication",
  slug: "communication",
  label: "Communication",
  shortDescription:
    "Stratégie éditoriale, brand voice, e-réputation : un dossier Qualiopi construit autour d'une vraie démarche de communication, pas de généralités.",
  heroIntro:
    "Pour une formation en communication, le programme doit couvrir la stratégie éditoriale, l'identité de marque, l'e-réputation et la mesure — avec un cadre juridique clair (droits d'auteur, RGPD). Qualiopi Pilote construit vos documents à partir de cette structure, avec des objectifs mesurables et des livrables concrets.",
  objectiveGroups: [
    {
      title: "Stratégie éditoriale et image de marque",
      objectives: [
        "Construire une stratégie éditoriale simple (cibles, messages, rubriquage, brand voice, calendrier).",
        "Définir ou clarifier le branding digital (plateforme de marque, charte, identité visuelle et verbale).",
      ],
    },
    {
      title: "E-réputation",
      objectives: [
        "Piloter l'e-réputation : veille, social listening, réponses types.",
        "Gérer des situations sensibles et des avis négatifs selon une politique de réponse claire.",
      ],
    },
    {
      title: "Production et diffusion",
      objectives: [
        "Produire et diffuser des contenus adaptés à chaque canal (site, blog, réseaux, e-mail).",
        "Mettre en place un tableau de bord (portée, engagement, trafic/conversions) et optimiser en continu.",
      ],
    },
  ],
  modulesStandard: {
    label: "Six axes, déclinables sur trois durées (35h / 70h / 105h)",
    modules: [
      { title: "Fondamentaux et stratégie (objectifs, cibles, canaux, messages, personae)", durationLabel: "35h–105h" },
      { title: "Brand voice et guidelines (ton, style, règles rédactionnelles, identité multi-canal)", durationLabel: "35h–105h" },
      { title: "E-réputation (veille, social listening, gestion d'avis, escalade)", durationLabel: "35h–105h" },
      { title: "Production et diffusion par canal (LinkedIn, Instagram, TikTok, YouTube, email)", durationLabel: "35h–105h" },
      { title: "Outils (Canva, Figma, Trello, Notion, Meta Planner, Buffer, Hootsuite, Mailchimp, Brevo, Looker Studio)", durationLabel: "35h–105h" },
      { title: "Cadre juridique (droits d'auteur, RGPD, mentions légales, charte de modération)", durationLabel: "35h–105h" },
    ],
  },
  checkableThemes: [
    "Stratégie éditoriale",
    "Brand voice et charte éditoriale",
    "E-réputation et social listening",
    "Gestion d'avis et de situations sensibles",
    "Production de contenu multi-canal",
    "Outils de communication (Canva, Buffer, Mailchimp...)",
    "Cadre juridique (RGPD, droits d'auteur)",
    "Tableau de bord et mesure d'impact",
  ],
  documentsNote:
    "À partir des thèmes cochés, Qualiopi Pilote génère automatiquement le programme, la convention, les questionnaires et les évaluations : dossier stratégie éditoriale et brand voice, kit de marque simplifié, plan e-réputation documenté, tableau de bord avec soutenance et recommandations.",
  faqs: [
    {
      question: "Cette formation couvre-t-elle la communication de crise ?",
      answer:
        "La gestion de situations sensibles et l'escalade en cas d'avis négatifs ou de crise d'e-réputation font partie du module dédié — le contenu s'enrichit selon vos besoins spécifiques.",
    },
    {
      question: "Le cadre juridique (RGPD, droits d'auteur) est-il vraiment intégré au programme, pas juste évoqué ?",
      answer:
        "Oui, c'est un axe à part entière de la banque de contenu, avec ses propres objectifs et son propre contenu de programme, pas une simple mention en fin de formation.",
    },
  ],
};
