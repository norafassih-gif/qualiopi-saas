/**
 * Modèle de données pour les pages publiques "domaine de formation"
 * (/formations/[slug]). Un seul composant de rendu (voir
 * components/marketing/training-domain-page.tsx) est réutilisé pour les
 * 10 catégories définies dans training_categories — seule cette structure
 * de données change d'un domaine à l'autre.
 *
 * Le contenu vient intégralement de la vraie banque de contenu de chaque
 * domaine (cf. claude/banque-contenu-*.md dans le projet) : rien n'est
 * inventé ni copié d'un concurrent, conformément au principe déjà appliqué
 * sur le reste du site public (pas de témoignages/chiffres fabriqués).
 */

export type TrainingDomainModule = {
  title: string;
  durationLabel: string;
};

export type TrainingDomainObjectiveGroup = {
  title: string;
  objectives: string[];
};

export type TrainingDomainFaq = {
  question: string;
  answer: string;
};

export type TrainingDomainContent = {
  /** Doit correspondre à l'id dans training_categories (ex. "community_management"). */
  categoryId: string;
  /** Segment d'URL sous /formations/ (ex. "community-management"). */
  slug: string;
  label: string;
  shortDescription: string;
  heroIntro: string;
  objectiveGroups: TrainingDomainObjectiveGroup[];
  modulesStandard: {
    label: string;
    modules: TrainingDomainModule[];
  };
  modulesVariant?: {
    label: string;
    context: string;
    modules: TrainingDomainModule[];
  };
  checkableThemes: string[];
  documentsNote: string;
  faqs: TrainingDomainFaq[];
};

/** Entrée d'index pour /formations — un domaine peut ne pas encore avoir de page dédiée. */
export type TrainingDomainIndexEntry = {
  categoryId: string;
  label: string;
  description: string;
  slug: string | null;
};
