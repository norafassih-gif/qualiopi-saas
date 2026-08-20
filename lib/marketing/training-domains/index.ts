import type { TrainingDomainIndexEntry } from "./types";
import { communityManagementContent } from "./community-management";
import { languesContent } from "./langues";
import { marketingDigitalContent } from "./marketing-digital";
import { communicationContent } from "./communication";
import { managementContent } from "./management";
import { bureautiqueContent } from "./bureautique";
import { webDigitalContent } from "./web-digital";

export {
  communityManagementContent,
  languesContent,
  marketingDigitalContent,
  communicationContent,
  managementContent,
  bureautiqueContent,
  webDigitalContent,
};
export type { TrainingDomainContent, TrainingDomainIndexEntry } from "./types";

/**
 * Les 10 catégories réelles de training_categories (cf. migration
 * 0002_seed_referentiel.sql). Seules celles avec un `slug` non-nul ont une
 * page dédiée construite. 7/10 domaines ont désormais un contenu réel,
 * sourcé le 20/08/2026 sur pivotformation.com / evaluation.pivotformation.com
 * (formations réellement dispensées par Nora) — voir claude/roadmap-produit-et-tarifs.md
 * section 5.4. Les 3 restants (vente_commerce, ressources_humaines,
 * entrepreneuriat_gestion) n'ont pas encore de contenu réel identifié :
 * pas de page tant qu'on n'a pas de vraie source, pour ne rien inventer.
 */
export const trainingDomainIndex: TrainingDomainIndexEntry[] = [
  { categoryId: "langues", label: "Langues", description: "Anglais, français langue étrangère, autres langues — préparation certifications type TOEIC, DELF/DALF.", slug: languesContent.slug },
  {
    categoryId: "community_management",
    label: "Community Management / Réseaux sociaux",
    description: "Stratégie social media, création de contenu, animation de communauté.",
    slug: communityManagementContent.slug,
  },
  { categoryId: "marketing_digital", label: "Marketing digital", description: "SEO, SEA, emailing, growth, analytics, stratégie de contenu.", slug: marketingDigitalContent.slug },
  { categoryId: "management", label: "Management", description: "Leadership, délégation, gestion de conflits, animation d'équipe.", slug: managementContent.slug },
  { categoryId: "vente_commerce", label: "Vente / Commerce", description: "Prospection, négociation commerciale, relation client, CRM.", slug: null },
  { categoryId: "bureautique", label: "Bureautique", description: "Excel, Word, PowerPoint, outils collaboratifs.", slug: bureautiqueContent.slug },
  { categoryId: "communication", label: "Communication", description: "Communication écrite/orale, prise de parole, communication de crise.", slug: communicationContent.slug },
  { categoryId: "web_digital", label: "Web / Création de sites", description: "HTML/CSS, CMS, WordPress, UX/UI de base, no-code.", slug: webDigitalContent.slug },
  { categoryId: "ressources_humaines", label: "Ressources humaines", description: "Recrutement, droit du travail, entretiens annuels, SIRH.", slug: null },
  { categoryId: "entrepreneuriat_gestion", label: "Entrepreneuriat / Gestion", description: "Business plan, gestion financière, statuts juridiques, comptabilité de base.", slug: null },
];
