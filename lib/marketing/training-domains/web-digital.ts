import type { TrainingDomainContent } from "./types";

/**
 * Source : pivotformation.com/creation-de-site-internet-via-wordpress
 * (contenu réel Pivot Formation, cf. demande de Nora du 20/08/2026).
 */
export const webDigitalContent: TrainingDomainContent = {
  categoryId: "web_digital",
  slug: "web-digital",
  label: "Web / Création de sites",
  shortDescription:
    "De la maquette à la mise en ligne avec WordPress : un dossier Qualiopi qui va jusqu'à la publication réelle d'un site, pas une simple initiation.",
  heroIntro:
    "Pour une formation en création de site internet, le programme doit couvrir tout le parcours : installation, design, contenus, sécurité, performance, SEO de base et mise en production. Qualiopi Pilote construit vos documents à partir de cette logique de projet fil rouge, avec un vrai site publié à la clé.",
  objectiveGroups: [
    {
      title: "Installation et architecture",
      objectives: [
        "Installer et configurer WordPress (hébergement, domaine, HTTPS, réglages de base).",
        "Concevoir l'architecture et les pages clés avec navigation et maquettes simples.",
      ],
    },
    {
      title: "Construction et contenus",
      objectives: [
        "Construire des pages avec Gutenberg ou Elementor, gérer médias et formulaires.",
        "Maîtriser les bonnes pratiques RGPD (mentions légales, cookies).",
      ],
    },
    {
      title: "Sécurité, performance et mise en ligne",
      objectives: [
        "Mettre en place sécurité, sauvegardes et mises à jour.",
        "Optimiser les performances et le SEO de base avant publication.",
        "Réaliser la mise en production (DNS, SSL, tests et checklists).",
      ],
    },
  ],
  modulesStandard: {
    label: "Six modules, déclinables sur trois durées (35h / 70h / 105h)",
    modules: [
      { title: "Découvrir WordPress (hébergement, installation, HTTPS/SSL, réglages généraux)", durationLabel: "35h–105h" },
      { title: "Thèmes et design (thème enfant, Gutenberg/Elementor, responsive)", durationLabel: "35h–105h" },
      { title: "Contenus et navigation (pages clés, menus, médias, formulaires, pages légales)", durationLabel: "35h–105h" },
      { title: "Extensions essentielles (SEO, cache/performance, sécurité, sauvegarde, RGPD)", durationLabel: "35h–105h" },
      { title: "Sécurité et maintenance (comptes/permissions, mises à jour, sauvegardes automatiques)", durationLabel: "35h–105h" },
      { title: "Performance et SEO de base (images, cache, indexation, structure Hn, maillage interne)", durationLabel: "35h–105h" },
    ],
  },
  modulesVariant: {
    label: "Parcours Avancé — 105 heures",
    context:
      "Le parcours le plus long va au-delà du site vitrine simple : personnalisation poussée, mini-catalogue produit, landing pages et outillage pour une équipe.",
    modules: [
      { title: "Personnalisation poussée du thème et des gabarits", durationLabel: "105h" },
      { title: "Mini-catalogue et landing pages", durationLabel: "105h" },
      { title: "Outillage et procédures pour une équipe", durationLabel: "105h" },
    ],
  },
  checkableThemes: [
    "Installation et hébergement WordPress",
    "Thèmes et constructeurs (Gutenberg, Elementor)",
    "Pages clés et navigation",
    "Formulaires et médias",
    "Sécurité et sauvegardes",
    "Performance et SEO de base",
    "RGPD et pages légales",
    "Mise en production",
  ],
  documentsNote:
    "À partir des thèmes cochés et de la durée choisie, Qualiopi Pilote génère automatiquement le programme, la convention et les évaluations : création d'un site vitrine minimal viable, checklist sécurité/maintenance, tableau d'optimisation SEO/performance, et mise en ligne réelle ou en pré-production avec soutenance de synthèse.",
  faqs: [
    {
      question: "Les stagiaires publient-ils un vrai site à la fin de la formation ?",
      answer:
        "Oui, le projet fil rouge consiste à créer un site vitrine complet, de la structure à la mise en ligne (ou publication en pré-production selon le contexte), évalué par une soutenance de synthèse.",
    },
    {
      question: "Le SEO est-il vraiment couvert, ou juste évoqué en fin de formation ?",
      answer:
        "Le SEO de base (structure des titres, maillage interne, indexation, robots.txt) fait partie d'un module dédié, avec un livrable d'évaluation spécifique (tableau d'optimisation et corrections appliquées).",
    },
  ],
};
