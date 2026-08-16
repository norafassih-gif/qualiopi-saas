"use client";

import { useActionState } from "react";
import { updateOrganization, type OrgFormState, type Organization } from "@/lib/actions/organization";

const initialState: OrgFormState = { error: null };

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  help,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  help?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        className="rounded-md border border-gray-300 px-3 py-2"
      />
      {help && <span className="text-xs text-gray-500">{help}</span>}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3 border-t border-gray-200 pt-4">
      <legend className="mb-1 text-sm font-semibold text-gray-900">{title}</legend>
      {children}
    </fieldset>
  );
}

export function QualiteSettingsForm({ org }: { org: Organization }) {
  const [state, formAction, pending] = useActionState(updateOrganization, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="company_name" value={org.company_name} />

      <Section title="Référents complémentaires">
        <Field label="Référent administratif" name="administrative_referent" defaultValue={org.administrative_referent} />
        <Field label="Email référent administratif" name="administrative_referent_email" type="email" defaultValue={org.administrative_referent_email} />
        <Field label="Téléphone référent administratif" name="administrative_referent_phone" defaultValue={org.administrative_referent_phone} />
        <Field label="Email référent pédagogique" name="pedagogical_referent_email" type="email" defaultValue={org.pedagogical_referent_email} />
        <Field label="Téléphone référent pédagogique" name="pedagogical_referent_phone" defaultValue={org.pedagogical_referent_phone} />
        <Field label="Email référent handicap" name="disability_referent_email" type="email" defaultValue={org.disability_referent_email} />
        <Field label="Téléphone référent handicap" name="disability_referent_phone" defaultValue={org.disability_referent_phone} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_sole_practitioner" defaultChecked={org.is_sole_practitioner} />
          Je suis seul(e) à assurer toutes les fonctions (organisme individuel)
        </label>
      </Section>

      <Section title="Contexte de l'organisme">
        <Field label="Ville du siège" name="organization_city" defaultValue={org.organization_city} />
        <Field
          label="Région"
          name="region"
          defaultValue={org.region}
          help="Utilisée pour indiquer où contacter des partenaires locaux (handicap, insertion...) dans vos procédures."
        />
        <Field label="Tribunal compétent en cas de litige" name="jurisdiction" defaultValue={org.jurisdiction} />
        <Field label="Email dédié aux réclamations" name="complaints_email" type="email" defaultValue={org.complaints_email} />
        <Field label="Email du DPO (protection des données)" name="dpo_contact_email" type="email" defaultValue={org.dpo_contact_email} />
      </Section>

      <Section title="Intervenant externe / prestataire technique (si applicable)">
        <Field label="Discipline du formateur externe" name="external_trainer_discipline" defaultValue={org.external_trainer_discipline} />
        <Field label="Nom du formateur externe" name="external_trainer_name" defaultValue={org.external_trainer_name} />
        <Field label="Type de contrat" name="external_trainer_contract_type" defaultValue={org.external_trainer_contract_type} />
        <Field label="Prestataire technique (visio, LMS...)" name="technical_provider_name" defaultValue={org.technical_provider_name} />
        <Field label="Société du prestataire technique" name="technical_provider_company" defaultValue={org.technical_provider_company} />
      </Section>

      <Section title="Métadonnées des procédures">
        <Field label="Version des procédures" name="procedure_version" defaultValue={org.procedure_version} />
        <Field label="Durée d'archivage générale" name="archiving_duration" defaultValue={org.archiving_duration} />
        <Field label="Durée d'archivage dossiers formateurs" name="archiving_duration_trainer_docs" defaultValue={org.archiving_duration_trainer_docs} />
        <Field label="Fréquence de collecte de la veille" name="watch_collect_frequency" defaultValue={org.watch_collect_frequency} />
        <Field label="Fréquence de revue de la veille" name="watch_review_frequency" defaultValue={org.watch_review_frequency} />
        <Field label="Délai de l'enquête d'insertion" name="insertion_survey_delay" defaultValue={org.insertion_survey_delay} />
        <Field label="Budget formation (% masse salariale)" name="training_budget_percent_payroll" defaultValue={org.training_budget_percent_payroll} />
        <Field label="Période du plan de développement des compétences" name="plan_period" defaultValue={org.plan_period} />
      </Section>

      <Section title="Cibles qualité (tableau de bord amélioration continue)">
        <Field label="Objectif satisfaction apprenants" name="satisfaction_rate_target" defaultValue={org.satisfaction_rate_target} />
        <Field label="Objectif satisfaction formateurs" name="trainer_satisfaction_rate_target" defaultValue={org.trainer_satisfaction_rate_target} />
        <Field label="Objectif satisfaction entreprises" name="partner_satisfaction_rate_target" defaultValue={org.partner_satisfaction_rate_target} />
        <Field label="Objectif taux de réussite" name="success_rate_target" defaultValue={org.success_rate_target} />
        <Field label="Objectif taux d'insertion à 6 mois" name="insertion_rate_target_6months" defaultValue={org.insertion_rate_target_6months} />
      </Section>

      <Section title="Délais de relance en cas d'absence">
        <Field label="1ère relance" name="absence_relance_delay_1" defaultValue={org.absence_relance_delay_1} help="Ex. H+30" />
        <Field label="2ème relance" name="absence_relance_delay_2" defaultValue={org.absence_relance_delay_2} help="Ex. H+90" />
        <Field label="3ème relance" name="absence_relance_delay_3" defaultValue={org.absence_relance_delay_3} help="Ex. J+1" />
      </Section>

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
