"use client";

import { useActionState } from "react";
import type { AdminFormState } from "@/lib/actions/admin";

const initialState: AdminFormState = { error: null };

export function NewCategoryForm({
  action,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Identifiant technique (minuscules, underscores — ex. langues)
        <input name="id" required pattern="[a-z0-9_]+" className="rounded-md border border-gray-300 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Libellé affiché
        <input name="label" required className="rounded-md border border-gray-300 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Description (optionnel)
        <textarea name="description" rows={2} className="rounded-md border border-gray-300 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Icône (optionnel)
        <input name="icon" className="rounded-md border border-gray-300 px-3 py-2" />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="mt-1 self-start rounded-md bg-blue-900 px-4 py-2 text-sm text-white disabled:opacity-50">
        {pending ? "Création…" : "Créer la catégorie"}
      </button>
    </form>
  );
}
