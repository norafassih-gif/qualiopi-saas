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

// Un seul plan vendable aujourd'hui (cf. /tarifs — "seul le Plan 1 a un
// bouton d'action réel", les formules 2 à 4 ne sont pas encore construites).
// Les clés des autres plans sont prévues ici pour éviter de re-designer le
// mapping quand ils seront prêts, mais restent vides tant qu'ils ne le sont
// pas — voir isPlanPurchasable ci-dessous, qui empêche explicitement de
// vendre un plan pas encore livré même si sa variable d'env est absente.
export const STRIPE_PRICE_BY_PLAN: Record<string, string | undefined> = {
  documents: process.env.STRIPE_PRICE_DOCUMENTS,
  documents_site: process.env.STRIPE_PRICE_DOCUMENTS_SITE,
  documents_site_accompagnement: process.env.STRIPE_PRICE_DOCUMENTS_SITE_ACCOMPAGNEMENT,
  tout_compris: process.env.STRIPE_PRICE_TOUT_COMPRIS,
};

// Formules réellement livrées et vendables aujourd'hui, cf. section 3.6 du
// roadmap produit ("seul le Plan 1 a un bouton d'action réel"). À élargir
// au fur et à mesure que les formules 2/3/4 seront construites.
export const PURCHASABLE_PLANS = ["documents"] as const;

export function isPlanPurchasable(plan: string): boolean {
  return (PURCHASABLE_PLANS as readonly string[]).includes(plan);
}
