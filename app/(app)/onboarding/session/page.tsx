import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstTraining } from "@/lib/actions/training";
import { getMyFirstSession } from "@/lib/actions/session";
import { OnboardingSessionForm } from "./form";

export default async function OnboardingSessionPage() {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }

  const training = await getMyFirstTraining();
  if (!training) {
    redirect("/onboarding/activite");
  }

  const existingSession = await getMyFirstSession();
  if (existingSession) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Ma première session</h1>
      <p className="mb-6 text-sm text-gray-600">
        Formation : <span className="font-medium">{training.name}</span>.
        Ces informations seront utilisées automatiquement dans tous les
        documents liés à cette session (convocation, émargement,
        attestation…).
      </p>
      <OnboardingSessionForm />
    </div>
  );
}
