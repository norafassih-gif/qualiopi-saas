"use client";

import { useActionState } from "react";
import type { AdminFormState, AdminCategory } from "@/lib/actions/admin";

const initialState: AdminFormState = { error: null };

export function NewBlockForm({
  action,
  categories,
  defaultCategory,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  categories: AdminCategory[];
  defaultCategory?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Catégorie
        <select name="category_id" defaultValue={defaultCategory ?? ""} className="rounded-md border border-gray-300 bg-white px-3 py-2">
          <option value="">Transverse (sans catégorie — procédures générales)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Type (ex. pedagogical_objective, method, need_example...)
        <input name="type" required className="rounded-md border border-gray-300 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Code unique (ex. CM_OBJ_010)
        <input name="code" required className="rounded-md border border-gray-300 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Texte
        <textarea name="text" required rows={4} className="rounded-md border border-gray-300 px-3 py-2" />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="mt-1 self-start rounded-md bg-blue-900 px-4 py-2 text-sm text-white disabled:opacity-50">
        {pending ? "Création…" : "Créer le bloc"}
      </button>
    </form>
  );
}
