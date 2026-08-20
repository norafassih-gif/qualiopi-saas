"use client";

import { useActionState, useState } from "react";
import type { AdminFormState } from "@/lib/actions/admin";
import { blockOrganization } from "@/lib/actions/admin";

const initialState: AdminFormState = { error: null };

export function OrganizationBlockForm({ organizationId }: { organizationId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(blockOrganization, initialState);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-700"
      >
        Bloquer
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-md border border-red-200 bg-red-50 p-3">
      <input type="hidden" name="organization_id" value={organizationId} />
      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Motif (affiché au client)
        <input
          name="reason"
          required
          placeholder="Ex. abonnement impayé depuis le 12/09"
          className="rounded-md border border-gray-300 px-2 py-1 text-xs"
        />
      </label>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-red-700 px-3 py-1 text-xs text-white disabled:opacity-50"
        >
          {pending ? "Blocage…" : "Confirmer le blocage"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-gray-300 px-3 py-1 text-xs">
          Annuler
        </button>
      </div>
    </form>
  );
}
