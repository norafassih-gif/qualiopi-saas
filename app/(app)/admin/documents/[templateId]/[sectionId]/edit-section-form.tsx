"use client";

import { useActionState } from "react";
import type { AdminFormState, AdminDocumentSection } from "@/lib/actions/admin";

const initialState: AdminFormState = { error: null };

export function EditSectionForm({
  action,
  section,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  section: AdminDocumentSection;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={section.id} />
      <input type="hidden" name="document_template_id" value={section.document_template_id} />
      <label className="flex flex-col gap-1 text-sm">
        Contenu HTML de la section
        <textarea
          name="html_template"
          rows={16}
          defaultValue={section.html_template ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 font-mono text-xs"
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="mt-1 self-start rounded-md bg-blue-900 px-4 py-2 text-sm text-white disabled:opacity-50">
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
