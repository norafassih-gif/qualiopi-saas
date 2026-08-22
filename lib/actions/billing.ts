"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization, type Organization } from "@/lib/actions/organization";
import { isPlatformAdmin } from "@/lib/actions/admin";
import {
  getStripe,
  STRIPE_PRICE_BY_PLAN,
  STRIPE_PRICE_BRANDING_ADDON,
  STRIPE_PRICE_PERSONALIZATION_ADDON,
  isPlanPurchasable,
} from "@/lib/stripe/client";

export type BillingFormState = { error: string | null };

export type MyBilling = {
  plan: string;
  subscription_status: string;
  is_blocked: boolean;
  blocked_reason: string | null;
  stripe_customer_id: string | null;
  has_branding_addon: boolean;
  has_personalization_addon: boolean;
};

/** Statut de facturation de l'organisme du client connecté. */
export async function getMyBilling(): Promise<MyBilling | null> {
  const org = await getMyOrganization();
  if (!org) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_billing")
    .select(
      "plan, subscription_status, is_blocked, blocked_reason, stripe_customer_id, has_branding_addon, has_personalization_addon",
    )
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
 * Bloque le tableau de bord et la suite de l'onboarding (formation, thèmes,
 * session, programme) tant que l'abonnement n'est pas actif — décision de
 * Nora du 21/08/2026 : plus personne ne doit pouvoir utiliser le logiciel
 * sans avoir payé. Redirige vers /onboarding/abonnement si l'organisme
 * n'existe pas encore ou si l'abonnement n'est pas "active".
 *
 * Volontairement PAS utilisé sur /onboarding/entreprise : cet écran précis
 * ne doit pas attendre la confirmation du webhook Stripe (qui peut mettre
 * quelques secondes), sous peine de renvoyer l'utilisateur vers le paywall
 * juste après qu'il ait payé. Un organisme n'y existe de toute façon que si
 * un paiement a été initié (cf. startCheckout), donc rien n'est contournable.
 */
export async function requireActiveSubscription(): Promise<void> {
  // Un administrateur plateforme n'est jamais bloqué par le paywall (même
  // logique que redirectIfBlocked dans app/(app)/layout.tsx) — indispensable
  // pour que Nora puisse continuer à tester/utiliser le logiciel sur ses
  // propres organismes sans avoir à se payer elle-même à chaque fois.
  if (await isPlatformAdmin()) return;

  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/abonnement");
  }

  const supabase = await createClient();
  const { data: billing } = await supabase
    .from("organization_billing")
    .select("subscription_status")
    .eq("organization_id", org.id)
    .maybeSingle();

  if (billing?.subscription_status !== "active") {
    redirect("/onboarding/abonnement");
  }
}

/**
 * Variante sans redirection, pour les routes API de génération de documents
 * (app/api/documents/*) qui doivent renvoyer une erreur JSON plutôt que
 * rediriger un téléchargement de fichier — même règle que
 * requireActiveSubscription : paiement obligatoire (décision de Nora,
 * 21/08/2026).
 */
export async function isSubscriptionActiveForOrg(organizationId: string): Promise<boolean> {
  // Même exemption que requireActiveSubscription pour les administrateurs
  // plateforme, cf. commentaire ci-dessus.
  if (await isPlatformAdmin()) return true;

  const supabase = await createClient();
  const { data: billing } = await supabase
    .from("organization_billing")
    .select("subscription_status")
    .eq("organization_id", organizationId)
    .maybeSingle();
  return billing?.subscription_status === "active";
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

  // Add-on optionnel "Logo + charte graphique" (+18 €/mois) — coché depuis
  // le formulaire, ajouté comme deuxième ligne Stripe indépendamment du plan.
  const wantsBrandingAddon = formData.get("branding_addon") === "on";
  if (wantsBrandingAddon && !STRIPE_PRICE_BRANDING_ADDON) {
    return {
      error:
        "L'option Logo + charte graphique n'est pas encore configurée côté serveur. Contactez l'équipe technique.",
    };
  }

  // Add-on optionnel "document personnalisé" (+5 €/mois, migration 0041) —
  // choisi via les deux cartes (standard / personnalisé) du formulaire,
  // ajouté comme ligne Stripe supplémentaire, cumulable avec l'add-on
  // branding ci-dessus.
  const wantsPersonalizationAddon = formData.get("personalization_addon") === "on";
  if (wantsPersonalizationAddon && !STRIPE_PRICE_PERSONALIZATION_ADDON) {
    return {
      error:
        "L'option document personnalisé n'est pas encore configurée côté serveur. Contactez l'équipe technique.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  let org = await getMyOrganization();
  let isFirstTimeCheckout = false;

  // Paiement obligatoire avant de renseigner l'entreprise (décision de Nora,
  // 21/08/2026) : un compte tout juste créé n'a donc pas encore d'organisme
  // à ce stade. On en crée un minimal ("placeholder") pour pouvoir rattacher
  // le paiement Stripe à quelque chose — le client complète ses vraies
  // informations juste après, sur /onboarding/entreprise, qui bascule alors
  // en UPDATE de cette même ligne plutôt qu'un nouvel INSERT (cf.
  // lib/actions/organization.ts et migration 0039).
  if (!org) {
    const { data: created, error: createError } = await supabase
      .from("organizations")
      .insert({ owner_user_id: user.id, company_name: "Organisme à compléter" })
      .select("*")
      .single();
    if (createError || !created) {
      return {
        error: "Impossible de démarrer le paiement : " + (createError?.message ?? "erreur inconnue"),
      };
    }
    org = created as Organization;
    isFirstTimeCheckout = true;
  }

  const { data: billing } = await supabase
    .from("organization_billing")
    .select("stripe_customer_id")
    .eq("organization_id", org.id)
    .maybeSingle();

  let sessionUrl: string | null;
  try {
    const stripe = getStripe();
    const lineItems = [{ price: priceId, quantity: 1 }];
    if (wantsBrandingAddon && STRIPE_PRICE_BRANDING_ADDON) {
      lineItems.push({ price: STRIPE_PRICE_BRANDING_ADDON, quantity: 1 });
    }
    if (wantsPersonalizationAddon && STRIPE_PRICE_PERSONALIZATION_ADDON) {
      lineItems.push({ price: STRIPE_PRICE_PERSONALIZATION_ADDON, quantity: 1 });
    }
    const metadata = {
      organization_id: org.id,
      plan,
      branding_addon: wantsBrandingAddon ? "1" : "0",
      personalization_addon: wantsPersonalizationAddon ? "1" : "0",
    };
    const successPath = isFirstTimeCheckout
      ? "/onboarding/entreprise?welcome=1"
      : "/parametres/abonnement?success=1";
    const cancelPath = isFirstTimeCheckout
      ? "/onboarding/abonnement?canceled=1"
      : "/parametres/abonnement?canceled=1";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: billing?.stripe_customer_id || undefined,
      customer_email: billing?.stripe_customer_id ? undefined : org.email || user.email || undefined,
      client_reference_id: org.id,
      line_items: lineItems,
      subscription_data: { metadata },
      metadata,
      success_url: `${appUrl()}${successPath}`,
      cancel_url: `${appUrl()}${cancelPath}`,
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
