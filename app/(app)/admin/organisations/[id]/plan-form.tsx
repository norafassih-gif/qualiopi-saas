"use client";

import { useActionState } from "react";
import type { AdminFormState, AdminOrganizationDetail } from "@/lib/actions/admin";
import { updateOrganizationPlanAdmin } from "@/lib/actions/admin";

const initialState: AdminFormState = { error: null };

const PLAN_OPTIONS = [
  { value: "documents", label: "1 — Documents" },
  { value: "documents_site", label: "2 — Documents + Site" },
  { value: "tout_compris", label: "3 — Tout compris + LMS" },
];

const STATUS_OPTIONS = [
  { value: "trialing", label: "Essai" },
  { value: "active", label: "Actif" },
  { value: "past_due", label: "Paiement en retard" },
  { value: "canceled", label: "Résilié" },
  { value: "incomplete", label: "Incomplet" },
];

/**
 * Formulaire "formule & statut" de la fiche organisme admin — demande de
 * Nora (24/08/2026) : "changer sa formule manuellement". Modifie uniquement
 * organization_billing (jamais Stripe) — cf. commentaire de
 * updateOrganizationPlanAdmin dans lib/actions/admin.ts.
 */
export function PlanForm({ org }: { org: AdminOrganizationDetail }) {
  const [state, formAction, pending] = useActionState(updateOrganizationPlanAdmin, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
      <input type="hidden" name="organization_id" value={org.id} />
      <h2 className="text-sm font-semibold text-gray-900">Formule &amp; statut d&apos;abonnement</h2>
      <p className="text-xs text-gray-500">
        Modifie uniquement notre base — n&apos;affecte aucun abonnement Stripe réel.
      </p>

      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Formule
        <select
          name="plan"
          defaultValue={org.plan}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        >
          {PLAN_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Statut
        <select
          name="subscription_status"
          defaultValue={org.subscription_status}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-blue-900 px-3 py-1.5 text-xs text-white disabled:opacity-50"
      >
        {pending ? "Enregistrement…" : "Enregistrer la formule"}
      </button>
    </form>
  );
}
