import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstTraining, listTrainingCategories } from "@/lib/actions/training";
import { OnboardingActiviteForm } from "./form";

export default async function OnboardingActivitePage() {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }

  // Une seule formation suffit pour préparer le dossier Qualiopi (le
  // multi-formations ne sert que pour la Partie 2 — site internet).
  const existingTraining = await getMyFirstTraining();
  if (existingTraining) {
    redirect("/dashboard");
  }

  const categories = await listTrainingCategories();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Mon activité</h1>
      <p className="mb-6 text-sm text-gray-600">
        Choisissez votre domaine de formation : le logiciel adaptera
        automatiquement tous vos documents (objectifs, évaluations,
        exemples) à ce domaine.
      </p>
      <OnboardingActiviteForm categories={categories} />
    </div>
  );
}
