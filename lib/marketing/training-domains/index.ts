import type { TrainingDomainIndexEntry } from "./types";
import { communityManagementContent } from "./community-management";

export { communityManagementContent };
export type { TrainingDomainContent, TrainingDomainIndexEntry } from "./types";

/**
 * Les 10 catégories réelles de training_categories (cf. migration
 * 0002_seed_referentiel.sql). Seules celles avec un `slug` non-nul ont une
 * page dédiée construite — les autres seront ajoutées domaine par domaine,
 * en suivant le même modèle que community-management.ts. Pas de lien mort :
 * les catégories sans page restent listées mais non cliquables sur
 * /formations, plutôt que de générer 10 pages avant d'avoir validé le
 * format avec Nora.
 */
export const trainingDomainIndex: TrainingDomainIndexEntry[] = [
  { categoryId: "langues", label: "Langues", description: "Anglais, français langue étrangère, autres langues — préparation certifications type TOEIC, DELF/DALF.", slug: null },
  {
    categoryId: "community_management",
    label: "Community Management / Réseaux sociaux",
    description: "Stratégie social media, création de contenu, animation de communauté.",
    slug: communityManagementContent.slug,
  },
  { categoryId: "marketing_digital", label: "Marketing digital", description: "SEO, SEA, emailing, growth, analytics, stratégie de contenu.", slug: null },
  { categoryId: "management", label: "Management", description: "Leadership, délégation, gestion de conflits, animation d'équipe.", slug: null },
  { categoryId: "vente_commerce", label: "Vente / Commerce", description: "Prospection, négociation commerciale, relation client, CRM.", slug: null },
  { categoryId: "bureautique", label: "Bureautique", description: "Excel, Word, PowerPoint, outils collaboratifs.", slug: null },
  { categoryId: "communication", label: "Communication", description: "Communication écrite/orale, prise de parole, communication de crise.", slug: null },
  { categoryId: "web_digital", label: "Web / Création de sites", description: "HTML/CSS, CMS, WordPress, UX/UI de base, no-code.", slug: null },
  { categoryId: "ressources_humaines", label: "Ressources humaines", description: "Recrutement, droit du travail, entretiens annuels, SIRH.", slug: null },
  { categoryId: "entrepreneuriat_gestion", label: "Entrepreneuriat / Gestion", description: "Business plan, gestion financière, statuts juridiques, comptabilité de base.", slug: null },
];
