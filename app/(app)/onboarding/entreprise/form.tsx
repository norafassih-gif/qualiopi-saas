"use client";

import { useActionState } from "react";
import { createOrganization, type OrgFormState } from "@/lib/actions/organization";

const initialState: OrgFormState = { error: null };

function Field({
  label,
  name,
  required = false,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input
        type={type}
        name={name}
        required={required}
        className="rounded-md border border-gray-300 px-3 py-2"
      />
    </label>
  );
}

export function OnboardingEntrepriseForm() {
  const [state, formAction, pending] = useActionState(createOrganization, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Nom de l'entreprise" name="company_name" required />
      <Field label="Nom commercial" name="commercial_name" />
      <Field label="Nom du dirigeant" name="manager_name" />
      <Field label="SIRET" name="siret" />
      <Field label="Adresse" name="address" />
      <Field label="Téléphone" name="phone" />
      <Field label="Email" name="email" type="email" />
      <Field label="Site web (optionnel)" name="website" />

      <div className="mt-2 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
        Ces trois référents sont exigés par les indicateurs Qualiopi 1 et 26 —
        vous pourrez les modifier plus tard.
      </div>
      <Field label="Référent pédagogique" name="pedagogical_referent" />
      <Field label="Référent qualité" name="quality_referent" />
      <Field label="Référent handicap" name="disability_referent" />

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
        {pending ? "Enregistrement…" : "Continuer"}
      </button>
    </form>
  );
}
