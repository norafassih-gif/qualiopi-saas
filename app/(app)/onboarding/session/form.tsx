"use client";

import { useActionState } from "react";
import { createSession, type SessionFormState } from "@/lib/actions/session";

const initialState: SessionFormState = { error: null };

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

export function OnboardingSessionForm() {
  const [state, formAction, pending] = useActionState(createSession, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Nom du formateur" name="trainer_name" required />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Date de début" name="start_date" type="date" required />
        <Field label="Date de fin" name="end_date" type="date" required />
      </div>

      <Field label="Lieu (adresse ou 'À distance')" name="location" />

      <div className="mt-2 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
        Bénéficiaire de cette session — vous pourrez en ajouter d&apos;autres
        plus tard.
      </div>
      <Field label="Nom complet du bénéficiaire" name="beneficiary_name" required />
      <Field label="Entreprise du bénéficiaire (optionnel)" name="beneficiary_company" />
      <Field label="Email du bénéficiaire (optionnel)" name="beneficiary_email" type="email" />

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
