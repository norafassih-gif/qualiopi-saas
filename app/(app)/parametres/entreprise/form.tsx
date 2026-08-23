"use client";

import { useActionState } from "react";
import { updateOrganization, type OrgFormState, type Organization } from "@/lib/actions/organization";

const initialState: OrgFormState = { error: null };

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="rounded-md border border-gray-300 px-3 py-2"
      />
    </label>
  );
}

export function EntrepriseSettingsForm({ org }: { org: Organization }) {
  const [state, formAction, pending] = useActionState(updateOrganization, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Nom de l'entreprise" name="company_name" required defaultValue={org.company_name} />
      <Field label="Nom commercial" name="commercial_name" defaultValue={org.commercial_name} />
      <Field label="Nom du dirigeant" name="manager_name" defaultValue={org.manager_name} />
      <Field label="SIRET" name="siret" defaultValue={org.siret} />
      <Field label="Adresse" name="address" defaultValue={org.address} />
      <Field label="Téléphone" name="phone" defaultValue={org.phone} />
      <Field label="Email" name="email" type="email" defaultValue={org.email} />
      <Field label="Site web (optionnel)" name="website" defaultValue={org.website} />

      <div className="mt-2 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            name="is_sole_practitioner"
            defaultChecked={org.is_sole_practitioner}
            className="mt-0.5"
          />
          <span>
            <strong>Je suis seul(e) à diriger mon organisme</strong> (auto-entrepreneur,
            indépendant·e...).
          </span>
        </label>
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-blue-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
