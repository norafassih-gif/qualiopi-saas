"use client";

import { useActionState, useState } from "react";
import type { AdminFormState } from "@/lib/actions/admin";
import { requestSupportAccess } from "@/lib/actions/admin";

const initialState: AdminFormState = { error: null };

export function OrganizationAccessForm({ organizationId }: { organizationId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(requestSupportAccess, initialState);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-700"
      >
        Demander l&apos;accès
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
      <input type="hidden" name="organization_id" value={organizationId} />
      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Motif (affiché au client dans sa demande)
        <input
          name="reason"
          required
          placeholder="Ex. vous rencontrez une erreur sur votre document, je regarde avec vous"
          className="rounded-md border border-gray-300 px-2 py-1 text-xs"
        />
      </label>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-900 px-3 py-1 text-xs text-white disabled:opacity-50"
        >
          {pending ? "Envoi…" : "Envoyer la demande"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-gray-300 px-3 py-1 text-xs">
          Annuler
        </button>
      </div>
    </form>
  );
}
