"use client";

import { useActionState } from "react";
import type { AdminFormState, AdminCategory } from "@/lib/actions/admin";

const initialState: AdminFormState = { error: null };

export function EditCategoryForm({
  action,
  category,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  category: AdminCategory;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={category.id} />
      <label className="flex flex-col gap-1 text-sm">
        Libellé affiché
        <input name="label" required defaultValue={category.label} className="rounded-md border border-gray-300 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Description
        <textarea name="description" rows={2} defaultValue={category.description ?? ""} className="rounded-md border border-gray-300 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Icône
        <input name="icon" defaultValue={category.icon ?? ""} className="rounded-md border border-gray-300 px-3 py-2" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={category.is_active} />
        Catégorie active (visible à l&apos;onboarding)
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="mt-1 self-start rounded-md bg-blue-900 px-4 py-2 text-sm text-white disabled:opacity-50">
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
