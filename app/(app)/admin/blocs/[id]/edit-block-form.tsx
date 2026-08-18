"use client";

import { useActionState } from "react";
import type { AdminFormState, AdminContentBlock } from "@/lib/actions/admin";

const initialState: AdminFormState = { error: null };

export function EditBlockForm({
  action,
  block,
  redirectCategory,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  block: AdminContentBlock;
  redirectCategory: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={block.id} />
      <input type="hidden" name="redirect_category" value={redirectCategory} />
      <label className="flex flex-col gap-1 text-sm">
        Texte
        <textarea name="text" required rows={5} defaultValue={block.text} className="rounded-md border border-gray-300 px-3 py-2" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={block.is_active} />
        Bloc actif (utilisé par le moteur)
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="mt-1 self-start rounded-md bg-blue-900 px-4 py-2 text-sm text-white disabled:opacity-50">
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
