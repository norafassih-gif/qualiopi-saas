import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { OnboardingEntrepriseForm } from "./form";

export default async function OnboardingEntreprisePage() {
  // Paiement obligatoire avant de renseigner l'entreprise (décision de Nora,
  // 21/08/2026) : un organisme n'existe que si un paiement Stripe a été
  // initié (créé automatiquement par startCheckout, cf.
  // lib/actions/billing.ts). Volontairement PAS de vérification du statut
  // "active" ici (contrairement au tableau de bord et à la suite de
  // l'onboarding) : le webhook Stripe qui confirme le paiement peut mettre
  // quelques secondes à arriver, et bloquer cet écran précis renverrait
  // l'utilisateur vers le paywall juste après qu'il ait payé. Rien n'est
  // pour autant contournable : sans organisme, impossible d'arriver ici.
  const existing = await getMyOrganization();
  if (!existing) {
    redirect("/onboarding/abonnement");
  }
  // Un compte = un organisme (addendum 17) : une fois le vrai formulaire
  // rempli, cet écran n'est plus atteignable, on renvoie au dashboard.
  if (existing.onboarding_company_completed) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Mon entreprise</h1>
      <p className="mb-6 text-sm text-gray-600">
        Ces informations seront réutilisées automatiquement dans tous vos
        documents Qualiopi.
      </p>
      <OnboardingEntrepriseForm />
    </div>
  );
}
