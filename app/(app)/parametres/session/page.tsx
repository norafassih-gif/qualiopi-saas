import { redirect } from "next/navigation";
import { getMyFirstSession, getMyFirstBeneficiary } from "@/lib/actions/session";
import { EditSessionForm } from "./form";

export default async function ModifierSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await getMyFirstSession();
  if (!session) {
    redirect("/onboarding/session");
  }
  const beneficiary = await getMyFirstBeneficiary(session.id);
  const { saved } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Ma session</h1>
      <p className="mb-6 text-sm text-gray-600">
        Corrigez les informations de votre session et de votre bénéficiaire —
        les documents déjà générés ne sont pas modifiés rétroactivement, mais
        tout nouveau document généré utilisera ces informations à jour.
      </p>
      {saved === "1" && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Enregistré.
        </div>
      )}
      <EditSessionForm session={session} beneficiary={beneficiary} />
      <a href="/dashboard" className="mt-6 inline-block text-sm text-blue-900 underline">
        ← Retour au tableau de bord
      </a>
    </div>
  );
}
