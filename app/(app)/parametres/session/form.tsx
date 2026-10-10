"use client";

import { useActionState, useState } from "react";
import { updateSession, type SessionFormState, type TrainingSession, type Beneficiary } from "@/lib/actions/session";
import { BeneficiarySignature } from "./beneficiary-signature";

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
  help,
  onChange,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
  help?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="rounded-md border border-gray-300 px-3 py-2"
      />
      {help && <span className="text-xs text-gray-500">{help}</span>}
    </label>
  );
}

function Textarea({
  label,
  name,
  defaultValue,
  help,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  help?: string;
}) {
  // Tous les champs du recueil des besoins sont obligatoires : les documents
  // en ont besoin et un document incomplet ne peut pas être généré.
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      {help && <span className="text-xs text-gray-500">{help}</span>}
      <textarea
        name={name}
        required
        defaultValue={defaultValue}
        rows={2}
        className="rounded-md border border-gray-300 px-3 py-2"
      />
    </label>
  );
}

function RadioGroup({
  label,
  name,
  options,
  defaultValue,
  onChange,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-1.5">
            <input
              type="radio"
              name={name}
              value={o.value}
              required
              defaultChecked={defaultValue === o.value}
              onChange={onChange ? () => onChange(o.value) : undefined}
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
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
  const [trainerIsManager, setTrainerIsManager] = useState(Boolean(session.trainer_is_manager));
  const [hasCompany, setHasCompany] = useState(Boolean(beneficiary?.company));
  const [hasDisability, setHasDisability] = useState(beneficiary?.has_disability === true);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <legend className="mb-1 text-sm font-semibold text-gray-900">Session</legend>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="trainer_is_manager"
            checked={trainerIsManager}
            onChange={(e) => setTrainerIsManager(e.target.checked)}
          />
          Le dirigeant est aussi le formateur
        </label>
        {trainerIsManager ? (
          <p className="text-xs text-gray-500">
            Le nom et la signature du dirigeant (enregistrée dans Identité visuelle) sont repris automatiquement
            partout où la signature du formateur est demandée.
          </p>
        ) : (
          <Field label="Nom du formateur" name="trainer_name" required defaultValue={session.trainer_name ?? ""} />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date de début" name="start_date" type="date" required defaultValue={session.start_date ?? ""} />
          <Field label="Date de fin" name="end_date" type="date" required defaultValue={session.end_date ?? ""} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Horaire de début (ex. 9h00)" name="start_time" required defaultValue={session.start_time ?? ""} />
          <Field label="Horaire de fin (ex. 17h00)" name="end_time" required defaultValue={session.end_time ?? ""} />
        </div>

        <Field
          label="Lieu (adresse ou 'À distance')"
          name="location"
          required
          defaultValue={session.location ?? ""}
        />

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
          label="Entreprise du bénéficiaire (laisser vide pour un particulier)"
          name="beneficiary_company"
          defaultValue={beneficiary?.company ?? ""}
          onChange={(value) => setHasCompany(value.trim().length > 0)}
          help="À renseigner si la formation est prise en charge par une entreprise ou un OPCO : ce nom apparaît comme cocontractant sur la convention de formation."
        />
        <Field
          label="Représentant de l'entreprise (signataire de la convention)"
          name="beneficiary_company_representative"
          required={hasCompany}
          defaultValue={(beneficiary as { company_representative?: string | null } | null)?.company_representative ?? ""}
          help="Obligatoire dès qu'une entreprise est renseignée : nom et fonction de la personne qui signe pour l'entreprise cliente. Apparaît dans la convention après « représenté par »."
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

        <BeneficiarySignature beneficiary={beneficiary} />
      </fieldset>

      <fieldset className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <legend className="mb-1 text-sm font-semibold text-gray-900">Dossier d&apos;admission du bénéficiaire</legend>
        <p className="text-xs text-gray-500">
          Ces informations apparaissent dans le dossier d&apos;admission. Tous les champs sont obligatoires : un
          document ne peut pas être généré s&apos;il manque une information.
        </p>
        <Textarea
          label="Diplômes et qualifications"
          name="diplomas_qualifications"
          defaultValue={beneficiary?.diplomas_qualifications ?? ""}
          help="Écrivez « Aucun diplôme » si c'est le cas."
        />
        <Textarea
          label="Expérience professionnelle en lien avec la formation"
          name="related_experience"
          defaultValue={beneficiary?.related_experience ?? ""}
          help="Écrivez « Aucune expérience » si c'est le cas."
        />
      </fieldset>

      <fieldset className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <legend className="mb-1 text-sm font-semibold text-gray-900">Recueil des besoins du bénéficiaire</legend>
        <p className="text-xs text-gray-500">
          Ces informations remplacent les lignes à remplir à la main dans le questionnaire de recueil des besoins.
          Tous les champs sont obligatoires : un document ne peut pas être généré s&apos;il manque une information.
        </p>

        <RadioGroup
          label="Expérience dans le domaine de la formation"
          name="experience_level"
          defaultValue={beneficiary?.experience_level ?? ""}
          options={[
            { value: "Aucune", label: "Aucune" },
            { value: "Débutant", label: "Débutant" },
            { value: "Intermédiaire", label: "Intermédiaire" },
            { value: "Avancé", label: "Avancé" },
          ]}
        />
        <Textarea
          label="Difficultés rencontrées actuellement en lien avec ce domaine"
          help="Obligatoire. Écrivez « Sans objet » si cela ne s'applique pas."
          name="current_difficulties"
          defaultValue={beneficiary?.current_difficulties ?? ""}
        />
        <Textarea
          label="Qu'attend le bénéficiaire personnellement de cette formation ?"
          help="Obligatoire. Écrivez « Sans objet » si cela ne s'applique pas."
          name="personal_expectations"
          defaultValue={beneficiary?.personal_expectations ?? ""}
        />
        <Textarea
          label="Compétences à acquérir ou renforcer en priorité"
          help="Obligatoire. Écrivez « Sans objet » si cela ne s'applique pas."
          name="priority_skills"
          defaultValue={beneficiary?.priority_skills ?? ""}
        />
        <Textarea
          label="Contexte professionnel ayant motivé cette formation"
          help="Obligatoire. Écrivez « Sans objet » si cela ne s'applique pas."
          name="professional_context"
          defaultValue={beneficiary?.professional_context ?? ""}
        />
        <Textarea
          label="Résultats attendus par l'employeur ou le financeur"
          help="Obligatoire. Écrivez « Sans objet » si cela ne s'applique pas."
          name="expected_results"
          defaultValue={beneficiary?.expected_results ?? ""}
        />
        <RadioGroup
          label="Modalité préférée"
          name="preferred_modality"
          defaultValue={beneficiary?.preferred_modality ?? ""}
          options={[
            { value: "Présentiel", label: "Présentiel" },
            { value: "Distanciel", label: "Distanciel" },
            { value: "Hybride", label: "Hybride" },
          ]}
        />
        <RadioGroup
          label="Rythme souhaité"
          name="preferred_rhythm"
          defaultValue={beneficiary?.preferred_rhythm ?? ""}
          options={[
            { value: "Journées complètes", label: "Journées complètes" },
            { value: "Demi-journées", label: "Demi-journées" },
            { value: "Sur plusieurs semaines", label: "Sur plusieurs semaines" },
          ]}
        />
        <Textarea
          label="Contraintes d'emploi du temps à prendre en compte"
          help="Obligatoire. Écrivez « Sans objet » si cela ne s'applique pas."
          name="schedule_constraints"
          defaultValue={beneficiary?.schedule_constraints ?? ""}
        />
        <RadioGroup
          label="Situation de handicap ou besoin d'aménagement particulier"
          name="has_disability"
          defaultValue={
            beneficiary?.has_disability === true ? "oui" : beneficiary?.has_disability === false ? "non" : ""
          }
          onChange={(value) => setHasDisability(value === "oui")}
          options={[
            { value: "non", label: "Non" },
            { value: "oui", label: "Oui" },
          ]}
        />
        {hasDisability && (
          <Textarea
            label="Nature des aménagements souhaités"
            name="accommodation_details"
            defaultValue={beneficiary?.accommodation_details ?? ""}
          />
        )}
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
