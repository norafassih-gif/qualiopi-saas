import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { OnboardingEntrepriseForm } from "./form";

export default async function OnboardingEntreprisePage() {
  // Un compte = un organisme (addendum 17) : si l'utilisateur en a déjà un,
  // cet écran n'est plus atteignable, on le renvoie directement au dashboard.
  const existing = await getMyOrganization();
  if (existing) {
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
