import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { createServiceRoleClient } from "@/lib/supabase/service";

// Reçoit les événements Stripe (paiement réussi, abonnement modifié/résilié)
// et met à jour organization_billing en conséquence. C'est la SEULE façon
// dont subscription_status/is_blocked doivent changer suite à un paiement —
// jamais depuis le navigateur du client (cf. commentaire de sécurité,
// migration 0036).
//
// Utilise le service_role (contourne RLS) car Stripe appelle cette route
// sans session utilisateur — seule la signature du corps de requête, vérifiée
// ci-dessous avec STRIPE_WEBHOOK_SECRET, garantit que la requête vient bien
// de Stripe.
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!webhookSecret || !signature) {
    console.error("stripe webhook: STRIPE_WEBHOOK_SECRET ou signature manquant");
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 500 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("stripe webhook: signature invalide", err);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const organizationId = session.client_reference_id || session.metadata?.organization_id;
      const plan = session.metadata?.plan;
      if (!organizationId) break;

      const { error } = await supabase
        .from("organization_billing")
        .update({
          stripe_customer_id:
            typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null),
          stripe_subscription_id:
            typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null),
          subscription_status: "active",
          is_blocked: false,
          blocked_at: null,
          blocked_reason: null,
          ...(plan ? { plan } : {}),
        })
        .eq("organization_id", organizationId);
      if (error) console.error("stripe webhook: checkout.session.completed", error);
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const organizationId = subscription.metadata?.organization_id;
      if (!organizationId) break;

      const status = mapStripeStatus(subscription.status);
      // Blocage automatique uniquement pour les états sans ambiguïté
      // (résilié / définitivement impayé) — "past_due" reste visible dans le
      // statut sans bloquer immédiatement, le temps que Stripe relance
      // automatiquement le paiement.
      const shouldAutoBlock =
        subscription.status === "canceled" ||
        subscription.status === "unpaid" ||
        subscription.status === "incomplete_expired";

      const { error } = await supabase
        .from("organization_billing")
        .update({
          subscription_status: status,
          ...(shouldAutoBlock
            ? {
                is_blocked: true,
                blocked_at: new Date().toISOString(),
                blocked_reason: "Abonnement résilié ou paiement en échec (Stripe).",
              }
            : {}),
        })
        .eq("organization_id", organizationId);
      if (error) console.error("stripe webhook: customer.subscription.updated/deleted", error);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

function mapStripeStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    default:
      // unpaid, incomplete, incomplete_expired, paused... — pas de
      // correspondance exacte dans notre check contraint (migration 0036),
      // "incomplete" reste le plus honnête de ces états transitoires/échec.
      return "incomplete";
  }
}
