"use client";

import { useActionState, useState } from "react";
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

function Select({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="rounded-md border border-gray-300 bg-white px-3 py-2"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function OnboardingSessionForm() {
  const [state, formAction, pending] = useActionState(createSession, initialState);
  const [isFree, setIsFree] = useState(false);

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
      <Field
        label="Poste occupé / statut actuel du bénéficiaire (optionnel)"
        name="beneficiary_role"
      />

      <div className="mt-2 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
        Tarif et financement — utilisés pour générer le devis et la convention /
        le contrat de formation. Vous pourrez affiner ces informations plus tard.
      </div>
      <fieldset className="flex flex-col gap-2 text-sm">
        <legend className="mb-1">Cette formation est-elle...</legend>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="price_mode"
            checked={!isFree}
            onChange={() => setIsFree(false)}
          />
          Payante
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="price_mode"
            checked={isFree}
            onChange={() => setIsFree(true)}
          />
          Gratuite (financée intégralement par ailleurs, action de sensibilisation...)
        </label>
      </fieldset>
      {isFree ? (
        <input type="hidden" name="price_unit" value="gratuit" />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tarif (montant en €)" name="price_amount" type="number" />
          <Select
            label="Le tarif s'entend..."
            name="price_unit"
            defaultValue="total_ttc"
            options={[
              { value: "total_ttc", label: "Total TTC" },
              { value: "total_ht", label: "Total HT" },
              { value: "per_participant_ht", label: "Par participant, HT" },
              { value: "per_hour_ht", label: "Par heure, HT" },
            ]}
          />
        </div>
      )}
      <Select
        label="Mode de financement"
        name="funding_type"
        defaultValue=""
        options={[
          { value: "", label: "Non précisé" },
          { value: "autofinancement", label: "Autofinancement (le bénéficiaire paie lui-même)" },
          { value: "entreprise", label: "Prise en charge par l'entreprise" },
          { value: "opco", label: "OPCO" },
          { value: "pole_emploi", label: "France Travail (ex-Pôle Emploi)" },
          { value: "cpf", label: "CPF" },
          { value: "region", label: "Conseil régional" },
          { value: "autre", label: "Autre" },
        ]}
      />
      <Field label="Précision sur le financeur (optionnel — ex. nom de l'OPCO)" name="funding_details" />
      <Field
        label="Modalités de règlement (optionnel — ex. « 30 % à la signature, solde à réception de facture »)"
        name="payment_terms"
      />

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
