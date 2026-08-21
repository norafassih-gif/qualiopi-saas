import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyBilling } from "@/lib/actions/billing";
import { PlanPicker } from "@/components/billing/plan-picker";

/**
 * Paywall obligatoire avant de renseigner l'entreprise — décision de Nora du
 * 21/08/2026 : plus personne ne doit pouvoir utiliser le logiciel sans avoir
 * payé. C'est la toute première étape après la création du compte (voir
 * lib/actions/auth.ts, qui envoie désormais tout le monde vers /dashboard,
 * lequel renvoie ici via requireActiveSubscription tant qu'aucun abonnement
 * actif n'existe). Le paiement crée automatiquement un organisme
 * "placeholder" (cf. lib/actions/billing.ts startCheckout) que l'étape
 * suivante (/onboarding/entreprise) complète avec les vraies informations.
 */
export default async function OnboardingAbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const { canceled } = await searchParams;

  const org = await getMyOrganization();
  const billing = org ? await getMyBilling() : null;

  if (billing?.subscription_status === "active") {
    redirect(org?.onboarding_company_completed ? "/dashboard" : "/onboarding/entreprise");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Choisissez votre formule</h1>
      <p className="mb-6 text-sm text-gray-600">
        Avant de renseigner votre organisme, choisissez la formule qui vous convient. Le
        paiement est géré par Stripe — nous ne stockons jamais vos coordonnées bancaires.
      </p>

      {canceled === "1" && (
        <div className="mb-6 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          Paiement annulé — rien n&apos;a été débité. Choisissez une formule pour continuer.
        </div>
      )}

      <PlanPicker />
    </div>
  );
}
