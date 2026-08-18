import { getMyFirstPartner } from "@/lib/actions/partners";
import { PartnerForm } from "../_components/partner-form";

export default async function PartenairePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const partner = await getMyFirstPartner("partenaire");
  const { saved } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Mon partenaire entreprise</h1>
      <p className="mb-6 text-sm text-gray-600">
        Ces informations complètent automatiquement la Convention de
        partenariat entreprise (indicateur 28) — plus besoin de les
        ressaisir à la main à chaque génération.
      </p>
      {saved === "1" && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Enregistré.
        </div>
      )}
      <PartnerForm partnerType="partenaire" partner={partner} />
      <a href="/documents" className="mt-6 inline-block text-sm text-blue-900 underline">
        ← Retour à mes documents
      </a>
    </div>
  );
}
