"use client";

import { useActionState } from "react";
import type { AdminFormState, AdminOrganizationDetail } from "@/lib/actions/admin";
import { updateOrganizationContactAdmin } from "@/lib/actions/admin";

const initialState: AdminFormState = { error: null };

/**
 * Formulaire "coordonnées" de la fiche organisme admin — demande de Nora
 * (24/08/2026) : "modifier ses coordonnées (email, nom d'organisme...)".
 */
export function ContactForm({ org }: { org: AdminOrganizationDetail }) {
  const [state, formAction, pending] = useActionState(updateOrganizationContactAdmin, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
      <input type="hidden" name="organization_id" value={org.id} />
      <h2 className="text-sm font-semibold text-gray-900">Coordonnées</h2>

      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Nom de l&apos;organisme
        <input
          name="company_name"
          defaultValue={org.company_name}
          required
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Nom commercial
        <input
          name="commercial_name"
          defaultValue={org.commercial_name ?? ""}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Email
        <input
          type="email"
          name="email"
          defaultValue={org.email ?? ""}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-gray-700">
        SIRET
        <input
          name="siret"
          defaultValue={org.siret ?? ""}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Téléphone
        <input
          name="phone"
          defaultValue={org.phone ?? ""}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </label>

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-blue-900 px-3 py-1.5 text-xs text-white disabled:opacity-50"
      >
        {pending ? "Enregistrement…" : "Enregistrer les coordonnées"}
      </button>
    </form>
  );
}
