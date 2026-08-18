"use client";

import { useActionState } from "react";
import { savePartner, type Partner, type PartnerFormState, type PartnerType } from "@/lib/actions/partners";

const initialState: PartnerFormState = { error: null };

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

/**
 * Formulaire partagé sous-traitant / partenaire — les deux "tiers" partagent
 * la même table (migration 0032) et l'essentiel des mêmes champs d'identité ;
 * seuls quelques champs diffèrent selon le type (taux horaire côté
 * sous-traitant, tuteur référent côté partenaire), affichés conditionnellement
 * ci-dessous plutôt que de dupliquer tout le formulaire.
 */
export function PartnerForm({ partnerType, partner }: { partnerType: PartnerType; partner: Partner | null }) {
  const action = savePartner.bind(null, partnerType);
  const [state, formAction, pending] = useActionState(action, initialState);
  const isSousTraitant = partnerType === "sous_traitant";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <legend className="mb-1 text-sm font-semibold text-gray-900">Identité</legend>

        <Field
          label={isSousTraitant ? "Nom et prénom du formateur" : "Nom de l'entreprise partenaire"}
          name="full_name"
          required
          defaultValue={partner?.full_name ?? ""}
        />
        <Field label="SIRET" name="siret" defaultValue={partner?.siret ?? ""} />
        <Field
          label={isSousTraitant ? "Adresse (domicile)" : "Adresse du site d'accueil"}
          name="address"
          defaultValue={partner?.address ?? ""}
        />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email de contact" name="contact_email" type="email" defaultValue={partner?.contact_email ?? ""} />
          <Field label="Téléphone de contact" name="contact_phone" defaultValue={partner?.contact_phone ?? ""} />
        </div>
      </fieldset>

      {!isSousTraitant && (
        <fieldset className="flex flex-col gap-3 border-t border-gray-200 pt-4">
          <legend className="mb-1 text-sm font-semibold text-gray-900">Représentant légal</legend>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Nom du représentant légal"
              name="legal_representative_name"
              defaultValue={partner?.legal_representative_name ?? ""}
            />
            <Field
              label="Fonction"
              name="legal_representative_role"
              defaultValue={partner?.legal_representative_role ?? ""}
            />
          </div>

          <legend className="mb-1 mt-2 text-sm font-semibold text-gray-900">Tuteur référent</legend>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nom du tuteur" name="tutor_name" defaultValue={partner?.tutor_name ?? ""} />
            <Field label="Fonction du tuteur" name="tutor_role" defaultValue={partner?.tutor_role ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email du tuteur" name="tutor_email" type="email" defaultValue={partner?.tutor_email ?? ""} />
            <Field label="Téléphone du tuteur" name="tutor_phone" defaultValue={partner?.tutor_phone ?? ""} />
          </div>
        </fieldset>
      )}

      <fieldset className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <legend className="mb-1 text-sm font-semibold text-gray-900">Mission</legend>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date de début" name="mission_start_date" type="date" defaultValue={partner?.mission_start_date ?? ""} />
          <Field label="Date de fin" name="mission_end_date" type="date" defaultValue={partner?.mission_end_date ?? ""} />
        </div>

        {isSousTraitant ? (
          <>
            <Field
              label="Taux horaire (€ HT/heure)"
              name="hourly_rate"
              type="number"
              defaultValue={partner?.hourly_rate != null ? String(partner.hourly_rate) : ""}
            />
            <Field
              label="Public / groupe concerné par la mission"
              name="mission_details"
              defaultValue={partner?.mission_details ?? ""}
            />
          </>
        ) : (
          <Field
            label="Détail de la mission (optionnel)"
            name="mission_details"
            defaultValue={partner?.mission_details ?? ""}
          />
        )}
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
