import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { signOut } from "@/lib/actions/auth";

export default async function DashboardPage() {
  const org = await getMyOrganization();

  // Pas encore d'organisme -> onboarding (parcours prioritaire, point 2 de la conception).
  if (!org) {
    redirect("/onboarding/entreprise");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bonjour</h1>
          <p className="text-gray-600">{org.company_name}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm text-gray-500 underline">
            Se déconnecter
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-600">
          Étape suivante : choisir votre domaine de formation puis créer votre
          première formation (onboarding/activite — à construire ensuite).
        </p>
      </div>
    </div>
  );
}
