import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { requireActiveSubscription } from "@/lib/actions/billing";
import { QualiteSettingsForm } from "./form";

export default async function ParametresQualitePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  // Paiement obligatoire avant d'utiliser le logiciel (décision de Nora, 21/08/2026).
  await requireActiveSubscription();

  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }
  const { saved } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Mes informations qualité</h1>
      <p className="mb-6 text-sm text-gray-600">
        Ces informations complètent votre profil pour les documents de
        fonctionnement de votre organisme (procédures, veille, réclamations,
        amélioration continue…). Les champs laissés vides apparaîtront comme{" "}
        <span className="font-medium">« [à compléter] »</span> dans les
        documents générés — à corriger avant de présenter votre dossier à
        l&apos;audit.
      </p>
      {saved === "1" && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Enregistré. Vos prochains documents générés utiliseront ces informations.
        </div>
      )}
      <QualiteSettingsForm org={org} />
      <a href="/dashboard" className="mt-6 inline-block text-sm text-blue-900 underline">
        ← Retour au tableau de bord
      </a>
    </div>
  );
}
