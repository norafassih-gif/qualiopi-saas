import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { EntrepriseSettingsForm } from "./form";

/**
 * "Mon entreprise" — jusqu'ici, les coordonnées légales de l'organisme
 * (SIRET, adresse, téléphone, email, dirigeant) n'étaient saisissables
 * qu'une seule fois, à l'onboarding (createOrganization) : aucune page ne
 * permettait de les corriger ensuite. Pire, "Mes informations qualité"
 * (updateOrganization) écrasait silencieusement ces champs à chaque
 * enregistrement puisqu'ils n'étaient pas présents dans SON formulaire —
 * bug remonté par Nora le 23/08/2026 ("je me souviens très bien avoir
 * renseigné le SIRET" — il avait été vidé par un enregistrement ultérieur
 * de la page qualité). Corrigé en même temps dans lib/actions/organization.ts
 * (updateOrganization ne touche plus que les champs réellement présents
 * dans le formulaire soumis) et ici, en ajoutant enfin une page dédiée.
 */
export default async function ParametresEntreprisePage({
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
      <h1 className="mb-1 text-2xl font-bold">Mon entreprise</h1>
      <p className="mb-6 text-sm text-gray-600">
        Les coordonnées légales de votre organisme — reprises sur tous vos
        documents (devis, convention, contrat...). Les champs laissés vides
        apparaîtront comme <span className="font-medium">« [à compléter] »</span>{" "}
        dans les documents générés — à corriger avant de présenter votre
        dossier à l&apos;audit.
      </p>
      {saved === "1" && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Enregistré. Vos prochains documents générés utiliseront ces informations.
        </div>
      )}
      <EntrepriseSettingsForm org={org} />
      <a href="/dashboard" className="mt-6 inline-block text-sm text-blue-900 underline">
        ← Retour au tableau de bord
      </a>
    </div>
  );
}
