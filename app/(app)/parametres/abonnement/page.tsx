import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyBilling, openBillingPortal } from "@/lib/actions/billing";
import { isPlanPurchasable } from "@/lib/stripe/client";
import { planLabel, subscriptionStatusLabel } from "@/lib/billing-labels";
import { SubscribeButton } from "./subscribe-button";

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; error?: string }>;
}) {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }
  const billing = await getMyBilling();
  const { success, canceled, error } = await searchParams;

  const hasActiveSubscription = billing?.subscription_status === "active";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Mon abonnement</h1>
      <p className="mb-6 text-sm text-gray-600">
        Le paiement est géré par Stripe — nous ne stockons jamais vos coordonnées bancaires.
      </p>

      {success === "1" && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Paiement enregistré. Votre abonnement sera actif dans quelques instants.
        </div>
      )}
      {canceled === "1" && (
        <div className="mb-6 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          Paiement annulé — rien n&apos;a été débité.
        </div>
      )}
      {error === "no_customer" && (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Aucun abonnement en cours à gérer pour l&apos;instant.
        </div>
      )}

      <div className="mb-6 rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-medium uppercase text-gray-500">Formule actuelle</p>
        <p className="mt-1 text-lg font-semibold text-gray-900">{planLabel(billing?.plan ?? "documents")}</p>
        <p className="mt-1 text-sm text-gray-600">
          Statut : <span className="font-medium">{subscriptionStatusLabel(billing?.subscription_status ?? "trialing")}</span>
        </p>
        {billing?.is_blocked && (
          <p className="mt-2 text-sm font-medium text-red-700">
            Accès bloqué — {billing.blocked_reason ?? "aucun motif renseigné"}
          </p>
        )}
        {billing?.has_branding_addon && (
          <p className="mt-2 text-sm text-gray-600">
            Option active : <span className="font-medium">Logo + charte graphique</span>
          </p>
        )}
      </div>

      {!hasActiveSubscription && (
        <div className="mb-8 space-y-6">
          {isPlanPurchasable("documents") && (
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="mb-1 font-medium text-gray-900">1 — Documents</p>
              <p className="mb-3 text-sm text-gray-600">
                Dossier de preuve Qualiopi généré automatiquement.
              </p>
              <SubscribeButton plan="documents" label="S'abonner — 29 €/mois" />
            </div>
          )}

          {isPlanPurchasable("documents_site") && (
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="mb-1 font-medium text-gray-900">2 — Documents + Site</p>
              <p className="mb-3 text-sm text-gray-600">
                Dossier de preuve Qualiopi + site internet de votre organisme.{" "}
                <span className="italic text-amber-700">
                  Le générateur de site est en cours de construction — inclus dans votre
                  abonnement dès sa mise en ligne.
                </span>
              </p>
              <SubscribeButton plan="documents_site" label="S'abonner — 75 €/mois" showBrandingAddon />
            </div>
          )}

          {isPlanPurchasable("tout_compris") && (
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="mb-1 font-medium text-gray-900">3 — Tout compris + LMS</p>
              <p className="mb-3 text-sm text-gray-600">
                Documents + Site + plateforme de formation en ligne (espace apprenant, quiz,
                attestations).{" "}
                <span className="italic text-amber-700">
                  Le site et le LMS sont en cours de construction — inclus dans votre abonnement
                  dès leur mise en ligne.
                </span>
              </p>
              <SubscribeButton plan="tout_compris" label="S'abonner — 129 €/mois" showBrandingAddon />
            </div>
          )}
        </div>
      )}

      {billing?.stripe_customer_id && (
        <form action={openBillingPortal}>
          <button type="submit" className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700">
            Gérer mon moyen de paiement / mes factures
          </button>
        </form>
      )}

      <a href="/dashboard" className="mt-8 inline-block text-sm text-blue-900 underline">
        ← Retour au tableau de bord
      </a>
    </div>
  );
}
