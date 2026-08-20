"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";
import { getStripe, STRIPE_PRICE_BY_PLAN, isPlanPurchasable } from "@/lib/stripe/client";

export type BillingFormState = { error: string | null };

export type MyBilling = {
  plan: string;
  subscription_status: string;
  is_blocked: boolean;
  blocked_reason: string | null;
  stripe_customer_id: string | null;
};

/** Statut de facturation de l'organisme du client connecté. */
export async function getMyBilling(): Promise<MyBilling | null> {
  const org = await getMyOrganization();
  if (!org) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_billing")
    .select("plan, subscription_status, is_blocked, blocked_reason, stripe_customer_id")
    .eq("organization_id", org.id)
    .maybeSingle();

  if (error) {
    console.error("getMyBilling", error);
    return null;
  }
  return data;
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Démarre un abonnement Stripe pour la formule demandée — redirige vers la
 * page de paiement hébergée par Stripe (Checkout), on ne manipule jamais de
 * numéro de carte nous-mêmes. Le statut réel (actif/en échec/résilié) n'est
 * mis à jour qu'à réception du webhook Stripe (voir
 * app/api/stripe/webhook/route.ts), jamais directement ici.
 */
export async function startCheckout(_prevState: BillingFormState, formData: FormData): Promise<BillingFormState> {
  const plan = String(formData.get("plan") || "").trim();
  if (!isPlanPurchasable(plan)) {
    return { error: "Cette formule n'est pas encore disponible à l'achat." };
  }
  const priceId = STRIPE_PRICE_BY_PLAN[plan];
  if (!priceId) {
    return {
      error:
        "Le paiement n'est pas encore configuré (clé de prix Stripe manquante côté serveur). Contactez l'équipe technique.",
    };
  }

  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: billing } = await supabase
    .from("organization_billing")
    .select("stripe_customer_id")
    .eq("organization_id", org.id)
    .maybeSingle();

  let sessionUrl: string | null;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: billing?.stripe_customer_id || undefined,
      customer_email: billing?.stripe_customer_id ? undefined : org.email || user.email || undefined,
      client_reference_id: org.id,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { metadata: { organization_id: org.id, plan } },
      metadata: { organization_id: org.id, plan },
      success_url: `${appUrl()}/parametres/abonnement?success=1`,
      cancel_url: `${appUrl()}/parametres/abonnement?canceled=1`,
    });
    sessionUrl = session.url;
  } catch (err) {
    return { error: "Erreur Stripe : " + (err instanceof Error ? err.message : String(err)) };
  }

  if (!sessionUrl) {
    return { error: "Impossible de créer la session de paiement." };
  }
  redirect(sessionUrl);
}

/**
 * Ouvre le portail client Stripe (facture, moyen de paiement, résiliation)
 * pour un client qui a déjà un stripe_customer_id — évite de reconstruire
 * ces écrans nous-mêmes.
 */
export async function openBillingPortal(): Promise<void> {
  const org = await getMyOrganization();
  if (!org) redirect("/onboarding/entreprise");

  const supabase = await createClient();
  const { data: billing } = await supabase
    .from("organization_billing")
    .select("stripe_customer_id")
    .eq("organization_id", org.id)
    .maybeSingle();

  if (!billing?.stripe_customer_id) {
    redirect("/parametres/abonnement?error=no_customer");
  }

  const stripe = getStripe();
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: billing.stripe_customer_id,
    return_url: `${appUrl()}/parametres/abonnement`,
  });
  redirect(portalSession.url);
}
