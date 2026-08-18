"use client";

import { useActionState, useState } from "react";
import { updateSession, type SessionFormState, type TrainingSession, type Beneficiary } from "@/lib/actions/session";

const initialState: SessionFormState = { error: null };

const STATUS_OPTIONS: { value: TrainingSession["status"]; label: string }[] = [
  { value: "planned", label: "Planifiée" },
  { value: "in_progress", label: "En cours" },
  { value: "done", label: "Terminée" },
  { value: "cancelled", label: "Annulée" },
];

const FUNDING_OPTIONS = [
  { value: "", label: "Non précisé" },
  { value: "autofinancement", label: "Autofinancement (le bénéficiaire paie lui-même)" },
  { value: "entreprise", label: "Prise en charge par l'entreprise" },
  { value: "opco", label: "OPCO" },
  { value: "pole_emploi", label: "France Travail (ex-Pôle Emploi)" },
  { value: "cpf", label: "CPF" },
  { value: "region", label: "Conseil régional" },
  { value: "autre", label: "Autre" },
];

function Field({
  label,
  name,
  required = false,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
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

export function EditSessionForm({
  session,
  beneficiary,
}: {
  session: TrainingSession;
  beneficiary: Beneficiary | null;
}) {
  const [state, formAction, pending] = useActionState(updateSession, initialState);
  const [isFree, setIsFree] = useState(session.price_unit === "gratuit");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <legend className="mb-1 text-sm font-semibold text-gray-900">Session</legend>

        <Field label="Nom du formateur" name="trainer_name" required defaultValue={session.trainer_name ?? ""} />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date de début" name="start_date" type="date" required defaultValue={session.start_date ?? ""} />
          <Field label="Date de fin" name="end_date" type="date" required defaultValue={session.end_date ?? ""} />
        </div>

        <Field label="Lieu (adresse ou 'À distance')" name="location" defaultValue={session.location ?? ""} />

        <Select label="Statut de la session" name="status" defaultValue={session.status} options={STATUS_OPTIONS} />
      </fieldset>

      <fieldset className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <legend className="mb-1 text-sm font-semibold text-gray-900">Bénéficiaire</legend>
        <p className="text-xs text-gray-500">
          Seul le bénéficiaire principal de cette session peut être modifié ici pour l&apos;instant.
        </p>

        <Field
          label="Nom complet du bénéficiaire"
          name="beneficiary_name"
          required
          defaultValue={beneficiary?.full_name ?? ""}
        />
        <Field
          label="Entreprise du bénéficiaire (optionnel)"
          name="beneficiary_company"
          defaultValue={beneficiary?.company ?? ""}
        />
        <Field
          label="Email du bénéficiaire (optionnel)"
          name="beneficiary_email"
          type="email"
          defaultValue={beneficiary?.email ?? ""}
        />
        <Field
          label="Poste occupé / statut actuel du bénéficiaire (optionnel)"
          name="beneficiary_role"
          defaultValue={beneficiary?.role ?? ""}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <legend className="mb-1 text-sm font-semibold text-gray-900">Tarif et financement</legend>

        <div className="flex flex-col gap-2 text-sm">
          <span>Cette formation est-elle...</span>
          <label className="flex items-center gap-2">
            <input type="radio" name="price_mode" checked={!isFree} onChange={() => setIsFree(false)} />
            Payante
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="price_mode" checked={isFree} onChange={() => setIsFree(true)} />
            Gratuite (financée intégralement par ailleurs, action de sensibilisation...)
          </label>
        </div>

        {isFree ? (
          <input type="hidden" name="price_unit" value="gratuit" />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Tarif (montant en €)"
              name="price_amount"
              type="number"
              defaultValue={session.price_amount != null ? String(session.price_amount) : ""}
            />
            <Select
              label="Le tarif s'entend..."
              name="price_unit"
              defaultValue={session.price_unit === "gratuit" ? "total_ttc" : session.price_unit}
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
          defaultValue={session.funding_type ?? ""}
          options={FUNDING_OPTIONS}
        />
        <Field
          label="Précision sur le financeur (optionnel — ex. nom de l'OPCO)"
          name="funding_details"
          defaultValue={session.funding_details ?? ""}
        />
        <Field
          label="Modalités de règlement (optionnel — ex. « 30 % à la signature, solde à réception de facture »)"
          name="payment_terms"
          defaultValue={session.payment_terms ?? ""}
        />
      </fieldset>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="mt-2 rounded-md bg-blue-900 px-4 py-2 text-white disabled:opacity-50">
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
