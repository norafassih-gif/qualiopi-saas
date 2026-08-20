import type { TrainingDomainContent } from "./types";

/**
 * Source : pivotformation.com/marketing-et-communication (formation
 * "Marketing Digital") et pivotformation.com/seo-sea (contenu réel Pivot
 * Formation, cf. demande de Nora du 20/08/2026).
 */
export const marketingDigitalContent: TrainingDomainContent = {
  categoryId: "marketing_digital",
  slug: "marketing-digital",
  label: "Marketing digital",
  shortDescription:
    "SEO, SEA, emailing, growth, analytics : un dossier Qualiopi qui parle de stratégie omnicanale et de pilotage par KPI, pas de généralités marketing.",
  heroIntro:
    "Pour une formation en marketing digital, le programme doit couvrir l'acquisition (SEO, SEA, réseaux sociaux), la conversion et la mesure — sans se limiter à une définition théorique du marketing. Qualiopi Pilote construit vos documents à partir d'une banque de contenu qui reprend ces vrais leviers, avec des objectifs mesurables plutôt que des généralités.",
  objectiveGroups: [
    {
      title: "Stratégie et fondamentaux",
      objectives: [
        "Construire un plan d'actions marketing digital adapté à sa cible et à ses objectifs.",
        "Poser les bases d'une stratégie omnicanale (persona, canaux, messages).",
        "Comprendre les fondamentaux et tendances du marketing digital.",
      ],
    },
    {
      title: "Acquisition SEO / SEA",
      objectives: [
        "Réaliser un audit SEO débutant et prioriser un plan d'actions (quick wins et chantiers).",
        "Optimiser le référencement naturel on-page (balises, en-têtes, maillage interne, images).",
        "Structurer un compte SEA débutant et rédiger des annonces orientées bénéfices.",
        "Poser les bases techniques du référencement (indexation, sitemap, Core Web Vitals).",
      ],
    },
    {
      title: "Réseaux sociaux et e-mailing",
      objectives: [
        "Mettre en œuvre une acquisition via les réseaux sociaux (calendrier éditorial, social ads).",
        "Concevoir des campagnes d'e-mailing et de marketing automation.",
      ],
    },
    {
      title: "Mesure et pilotage",
      objectives: [
        "Créer des tableaux de bord analytics (GA4, conversions, KPI).",
        "Mettre en place un suivi de performance et optimiser en continu.",
        "Piloter des mini-projets digitaux jusqu'à la restitution.",
      ],
    },
  ],
  modulesStandard: {
    label: "Neuf modules, déclinables sur trois durées (35h / 70h / 105h)",
    modules: [
      { title: "Fondamentaux du marketing digital et tendances", durationLabel: "35h–105h" },
      { title: "Stratégie omnicanale et persona", durationLabel: "35h–105h" },
      { title: "SEO débutant (mots-clés, optimisation on-page)", durationLabel: "35h–105h" },
      { title: "SEA débutant (structure de compte, campagnes publicitaires)", durationLabel: "35h–105h" },
      { title: "Social media (calendrier éditorial, engagement, social ads)", durationLabel: "35h–105h" },
      { title: "E-mailing et marketing automation", durationLabel: "35h–105h" },
      { title: "Analytics et GA4", durationLabel: "35h–105h" },
      { title: "Conversion et UX", durationLabel: "35h–105h" },
      { title: "Gestion de projet et conformité RGPD", durationLabel: "35h–105h" },
    ],
  },
  modulesVariant: {
    label: "Approfondissement SEO / SEA",
    context:
      "Quand le thème SEO/SEA est coché en priorité, le programme peut s'appuyer sur un module dédié plus poussé : audit technique, netlinking, structure de campagnes SEA et tableaux de bord de performance.",
    modules: [
      { title: "SEO technique (indexation, sitemap, robots.txt, Core Web Vitals, mobile)", durationLabel: "35h–105h" },
      { title: "Netlinking (principes, qualité des liens, ancrages)", durationLabel: "35h–105h" },
      { title: "SEA avancé (ciblage, enchères, tests A/B d'annonces)", durationLabel: "35h–105h" },
      { title: "Suivi et optimisation (UTM, conversions, feuille de route 90 jours)", durationLabel: "35h–105h" },
    ],
  },
  checkableThemes: [
    "Stratégie omnicanale",
    "SEO (référencement naturel)",
    "SEA (référencement payant)",
    "Réseaux sociaux / social ads",
    "E-mailing et marketing automation",
    "Analytics et GA4",
    "Conversion et UX",
    "Gestion de projet marketing",
    "RGPD",
    "Audit et plan d'actions",
  ],
  documentsNote:
    "À partir des thèmes cochés (SEO, SEA, réseaux sociaux, e-mailing, analytics...), de la durée et du public, Qualiopi Pilote génère automatiquement le programme, la convention, les questionnaires de positionnement et les évaluations pratiques (mini-stratégie, audit SEO, campagne SEA en bac à sable, tableau de bord avec soutenance).",
  faqs: [
    {
      question: "Le SEO/SEA est-il une formation à part ou un module de marketing digital ?",
      answer:
        "Les deux existent dans la banque de contenu : un module SEO/SEA intégré au programme marketing digital généraliste, et un approfondissement dédié quand ce thème est la priorité de vos stagiaires.",
    },
    {
      question: "Comment les évaluations restent-elles concrètes plutôt que théoriques ?",
      answer:
        "Les évaluations générées sont des livrables réels : mini-stratégie avec objectifs et KPI, audit SEO avec plan d'actions, campagne SEA en compte de test, tableau de bord analytics avec soutenance de synthèse.",
    },
  ],
};
