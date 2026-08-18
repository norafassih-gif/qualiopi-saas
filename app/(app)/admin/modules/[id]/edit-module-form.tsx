"use client";

import { useActionState } from "react";
import type { AdminFormState, AdminModule } from "@/lib/actions/admin";

const initialState: AdminFormState = { error: null };

export function EditModuleForm({
  action,
  moduleItem,
  redirectCategory,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  moduleItem: AdminModule;
  redirectCategory: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={moduleItem.id} />
      <input type="hidden" name="redirect_category" value={redirectCategory} />
      <label className="flex flex-col gap-1 text-sm">
        Titre du module
        <input name="title" required defaultValue={moduleItem.title} className="rounded-md border border-gray-300 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Durée par défaut (heures)
        <input
          name="default_duration_hours"
          type="number"
          step="0.5"
          defaultValue={moduleItem.default_duration_hours ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={moduleItem.is_active} />
        Module actif
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="mt-1 self-start rounded-md bg-blue-900 px-4 py-2 text-sm text-white disabled:opacity-50">
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
