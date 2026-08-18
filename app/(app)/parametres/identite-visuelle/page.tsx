import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { BrandingForm } from "./form";

export default async function IdentiteVisuellePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }
  const { saved } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Identité visuelle</h1>
      <p className="mb-6 text-sm text-gray-600">
        Votre logo, vos couleurs et votre police apparaissent automatiquement sur
        tous les documents PDF générés (programme, convention, attestations…) —
        rien à refaire document par document.
      </p>
      {saved === "1" && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Enregistré. Vos prochains documents générés utiliseront cette identité visuelle.
        </div>
      )}
      <BrandingForm org={org} />
      <a href="/dashboard" className="mt-6 inline-block text-sm text-blue-900 underline">
        ← Retour au tableau de bord
      </a>
    </div>
  );
}
