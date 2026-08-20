import {
  requireAdmin,
  listOrganizationsForAdmin,
  unblockOrganization,
  revokeSupportAccess,
} from "@/lib/actions/admin";
import { planLabel, subscriptionStatusLabel } from "@/lib/billing-labels";
import { OrganizationBlockForm } from "./organization-block-form";
import { OrganizationAccessForm } from "./organization-access-form";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
}

const ACCESS_STATUS_LABELS: Record<string, string> = {
  pending: "En attente de réponse du client",
  approved: "Accès accordé",
  denied: "Refusé par le client",
  revoked: "Révoqué",
};

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ requested?: string; blocked?: string }>;
}) {
  await requireAdmin();
  const organizations = await listOrganizationsForAdmin();
  const { requested, blocked } = await searchParams;

  const activeCount = organizations.filter((o) => !o.is_blocked).length;
  const blockedCount = organizations.filter((o) => o.is_blocked).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Organisations clientes</h1>
      <p className="mb-6 text-sm text-gray-600">
        Tous les organismes inscrits sur la plateforme, leur formule et leur statut d&apos;abonnement. Le
        blocage d&apos;un compte empêche l&apos;accès à son tableau de bord ; l&apos;accès à ses données
        (formations, sessions, documents) nécessite en plus son autorisation explicite.
      </p>

      {requested === "1" && (
        <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          Demande envoyée. Le client la verra sur son tableau de bord et pourra l&apos;approuver ou la refuser.
        </div>
      )}
      {blocked === "1" && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Organisme bloqué.
        </div>
      )}

      <div className="mb-6 flex gap-4 text-sm">
        <div className="rounded-lg border border-gray-200 px-4 py-2">
          <p className="text-xs text-gray-500">Total clients</p>
          <p className="text-lg font-semibold text-gray-900">{organizations.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 px-4 py-2">
          <p className="text-xs text-gray-500">Actifs</p>
          <p className="text-lg font-semibold text-gray-900">{activeCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 px-4 py-2">
          <p className="text-xs text-gray-500">Bloqués</p>
          <p className="text-lg font-semibold text-gray-900">{blockedCount}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {organizations.length === 0 && <p className="text-sm text-gray-500">Aucun organisme pour l&apos;instant.</p>}
        {organizations.map((org) => (
          <div key={org.id} className="rounded-lg border border-gray-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {org.company_name}
                  {org.commercial_name && <span className="text-gray-500"> ({org.commercial_name})</span>}
                </p>
                <p className="text-xs text-gray-500">
                  {org.email ?? "email non renseigné"} — inscrit le {formatDate(org.created_at)}
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Formule : <span className="font-medium">{planLabel(org.plan)}</span> — Statut :{" "}
                  <span className="font-medium">{subscriptionStatusLabel(org.subscription_status)}</span>
                </p>
                {org.is_blocked && (
                  <p className="mt-1 text-xs font-medium text-red-700">
                    Bloqué — {org.blocked_reason ?? "aucun motif renseigné"}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                {org.is_blocked ? (
                  <form action={unblockOrganization.bind(null, org.id)}>
                    <button type="submit" className="rounded-md bg-blue-900 px-3 py-1 text-xs text-white">
                      Débloquer
                    </button>
                  </form>
                ) : (
                  <OrganizationBlockForm organizationId={org.id} />
                )}
              </div>
            </div>

            <div className="mt-3 border-t border-gray-100 pt-3">
              {org.latest_access_grant ? (
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
                  <p>
                    Accès support : <span className="font-medium">{ACCESS_STATUS_LABELS[org.latest_access_grant.status] ?? org.latest_access_grant.status}</span>
                    {org.latest_access_grant.status === "approved" &&
                      ` — expire le ${formatDate(org.latest_access_grant.expires_at)}`}
                  </p>
                  <div className="flex gap-2">
                    {org.latest_access_grant.status === "approved" && (
                      <form action={revokeSupportAccess.bind(null, org.latest_access_grant.id)}>
                        <button type="submit" className="rounded-md border border-gray-300 px-3 py-1 text-xs">
                          Révoquer l&apos;accès
                        </button>
                      </form>
                    )}
                    {(org.latest_access_grant.status === "denied" || org.latest_access_grant.status === "revoked") && (
                      <OrganizationAccessForm organizationId={org.id} />
                    )}
                  </div>
                </div>
              ) : (
                <OrganizationAccessForm organizationId={org.id} />
              )}
            </div>
          </div>
        ))}
      </div>

      <a href="/admin" className="mt-8 inline-block text-sm text-blue-900 underline">
        ← Retour au back-office
      </a>
    </div>
  );
}
