import Stripe from "stripe";

// Instance Stripe paresseuse : ne jette une erreur que si on essaie
// réellement de l'utiliser sans clé configurée (plutôt qu'au chargement du
// module, ce qui casserait le build/les autres routes tant que Nora n'a pas
// encore fourni ses clés Stripe).
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY manquant — le paiement n'est pas encore configuré. Voir .env.local.example."
    );
  }

  _stripe = new Stripe(key);
  return _stripe;
}

// Grille tarifaire v2 (décision de Nora, 20/08/2026) : les 3 formules sont
// vendables dès maintenant, y compris "documents_site" et "tout_compris"
// alors que le site internet et le LMS ne sont pas encore construits — choix
// business explicite de Nora (cf. claude/roadmap-produit-et-tarifs.md), pas
// un oubli. "documents_site_accompagnement" a disparu : l'accompagnement
// Qualiopi est désormais une prestation "sur devis" hors Stripe (page
// /tarifs, CTA "Nous contacter"), plus un palier d'abonnement.
export const STRIPE_PRICE_BY_PLAN: Record<string, string | undefined> = {
  documents: process.env.STRIPE_PRICE_DOCUMENTS,
  documents_site: process.env.STRIPE_PRICE_DOCUMENTS_SITE,
  tout_compris: process.env.STRIPE_PRICE_TOUT_COMPRIS,
};

// Formules réellement vendables aujourd'hui (les 3, cf. décision de Nora
// ci-dessus). isPlanPurchasable reste la porte de sécurité : même si une
// variable d'env de prix venait à manquer, startCheckout refusera quand même
// tout plan absent de cette liste.
export const PURCHASABLE_PLANS = ["documents", "documents_site", "tout_compris"] as const;

export function isPlanPurchasable(plan: string): boolean {
  return (PURCHASABLE_PLANS as readonly string[]).includes(plan);
}

// Add-on optionnel "Logo + charte graphique" (+18 €/mois, prestation de
// design sur-mesure réalisée par Nora) — indépendant du plan choisi, ajouté
// comme deuxième ligne dans la session Stripe Checkout quand coché.
export const STRIPE_PRICE_BRANDING_ADDON = process.env.STRIPE_PRICE_BRANDING_ADDON;

// Add-on optionnel "document personnalisé" (+5 €/mois — date automatique,
// émargement en ligne, cachet et signature électronique sur les PDF générés,
// migration 0041) — proposé sur les 3 formules (contrairement à l'add-on
// branding ci-dessus, réservé aux formules avec site), cumulable avec lui.
export const STRIPE_PRICE_PERSONALIZATION_ADDON = process.env.STRIPE_PRICE_PERSONALIZATION_ADDON;
