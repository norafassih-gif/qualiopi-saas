import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrganizationForAdmin, toggleOrganizationAddonAdmin } from "@/lib/actions/admin";
import { planLabel, subscriptionStatusLabel } from "@/lib/billing-labels";
import { ContactForm } from "./contact-form";
import { PlanForm } from "./plan-form";

/**
 * Fiche organisme détaillée (back-office admin) — demande de Nora
 * (24/08/2026) : pouvoir modifier manuellement la formule, les add-ons et
 * les coordonnées d'un client, sans passer par Stripe ni par le client
 * lui-même. Complète /admin/organisations (liste + blocage + accès support)
 * plutôt que de dupliquer ces contrôles ici.
 */
export default async function AdminOrganizationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const org = await getOrganizationForAdmin(id);
  if (!org) {
    notFound();
  }
  const { saved } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/admin/organisations" className="mb-4 inline-block text-sm text-blue-900 underline">
        ← Retour à la liste des organisations
      </Link>
      <h1 className="mb-1 text-2xl font-bold">{org.company_name}</h1>
      <p className="mb-6 text-sm text-gray-600">
        Formule actuelle : <span className="font-medium">{planLabel(org.plan)}</span> — Statut :{" "}
        <span className="font-medium">{subscriptionStatusLabel(org.subscription_status)}</span>
        {org.is_blocked && <span className="ml-2 font-medium text-red-700">— Bloqué</span>}
      </p>

      {saved === "1" && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Enregistré.
        </div>
      )}

      <div className="flex flex-col gap-6">
        <ContactForm org={org} />
        <PlanForm org={org} />

        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="mb-1 text-sm font-semibold text-gray-900">Add-ons</h2>
          <p className="mb-3 text-xs text-gray-500">
            Activation/désactivation manuelle — n&apos;affecte aucun abonnement Stripe réel.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2">
              <div>
                <p className="text-sm text-gray-900">Document personnalisé (+5 €/mois)</p>
                <p className="text-xs text-gray-500">
                  {org.has_personalization_addon ? "Activé" : "Désactivé"}
                </p>
              </div>
              <form
                action={toggleOrganizationAddonAdmin.bind(
                  null,
                  org.id,
                  "has_personalization_addon",
                  !org.has_personalization_addon
                )}
              >
                <button
                  type="submit"
                  className={
                    org.has_personalization_addon
                      ? "rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-700"
                      : "rounded-md bg-blue-900 px-3 py-1 text-xs text-white"
                  }
                >
                  {org.has_personalization_addon ? "Désactiver" : "Activer"}
                </button>
              </form>
            </div>

            <div className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2">
              <div>
                <p className="text-sm text-gray-900">Logo + charte graphique (+18 €/mois)</p>
                <p className="text-xs text-gray-500">{org.has_branding_addon ? "Activé" : "Désactivé"}</p>
              </div>
              <form
                action={toggleOrganizationAddonAdmin.bind(
                  null,
                  org.id,
                  "has_branding_addon",
                  !org.has_branding_addon
                )}
              >
                <button
                  type="submit"
                  className={
                    org.has_branding_addon
                      ? "rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-700"
                      : "rounded-md bg-blue-900 px-3 py-1 text-xs text-white"
                  }
                >
                  {org.has_branding_addon ? "Désactiver" : "Activer"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
