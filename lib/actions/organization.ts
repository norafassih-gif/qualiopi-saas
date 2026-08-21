"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Organization = {
  id: string;
  owner_user_id: string;
  company_name: string;
  commercial_name: string | null;
  manager_name: string | null;
  siret: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  brand_color_primary: string;
  brand_color_secondary: string;
  font_family: string;
  stamp_url: string | null;
  signature_url: string | null;
  pedagogical_referent: string | null;
  quality_referent: string | null;
  disability_referent: string | null;
  // Champs qualité complémentaires (documents transverses critères 4-7,
  // cf. migration 0008) : référents supplémentaires, contexte, métadonnées
  // procédurales et cibles qualité — tous éditables sur /parametres/qualite.
  administrative_referent: string | null;
  administrative_referent_email: string | null;
  administrative_referent_phone: string | null;
  pedagogical_referent_email: string | null;
  pedagogical_referent_phone: string | null;
  disability_referent_email: string | null;
  disability_referent_phone: string | null;
  organization_city: string | null;
  region: string | null;
  is_sole_practitioner: boolean;
  jurisdiction: string;
  complaints_email: string | null;
  complaint_ack_delay: string;
  complaint_response_delay: string;
  dpo_contact_email: string | null;
  procedure_version: string;
  archiving_duration: string;
  archiving_duration_trainer_docs: string;
  watch_collect_frequency: string;
  watch_review_frequency: string;
  insertion_survey_delay: string;
  training_budget_percent_payroll: string;
  plan_period: string;
  satisfaction_rate_target: string;
  trainer_satisfaction_rate_target: string;
  partner_satisfaction_rate_target: string;
  success_rate_target: string;
  insertion_rate_target_6months: string;
  absence_relance_delay_1: string;
  absence_relance_delay_2: string;
  absence_relance_delay_3: string;
  external_trainer_discipline: string | null;
  external_trainer_name: string | null;
  external_trainer_contract_type: string | null;
  technical_provider_name: string | null;
  technical_provider_company: string | null;
  // Distingue un placeholder créé au moment du paiement (cf. migration 0039
  // et lib/actions/billing.ts startCheckout) du vrai formulaire "Mon
  // entreprise" rempli juste après.
  onboarding_company_completed: boolean;
};

/**
 * Retourne l'organisme de l'utilisateur connecté, ou null s'il n'en a pas
 * encore créé (redirection vers l'onboarding à faire par l'appelant).
 * Un compte ne possède au plus qu'un seul organisme au MVP — cf. addendum 17
 * de la conception (contrainte unique sur organizations.owner_user_id).
 */
export async function getMyOrganization(): Promise<Organization | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("getMyOrganization", error);
    return null;
  }

  return data as Organization | null;
}

export type OrgFormState = { error: string | null };

export async function createOrganization(
  _prevState: OrgFormState,
  formData: FormData
): Promise<OrgFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const company_name = String(formData.get("company_name") || "").trim();
  if (!company_name) {
    return { error: "Le nom de l'entreprise est requis." };
  }

  const manager_name = String(formData.get("manager_name") || "") || null;
  const is_sole_practitioner = formData.get("is_sole_practitioner") === "on";

  // Organisme individuel (auto-entrepreneur, indépendant...) : la même
  // personne assure la direction, la pédagogie, la qualité et le handicap.
  // Plutôt que de faire saisir 4 fois le même nom, on propage automatiquement
  // le dirigeant sur les 3 référents quand ils sont laissés vides — Nora l'a
  // demandé explicitement pour que les entrepreneurs solo n'aient rien à
  // deviner ("il faut dire qu'on est seul·e et que ce soit nous qui faisons
  // tout, partout"). Reste modifiable ensuite sur /parametres/qualite.
  const pedagogical_referent_raw = String(formData.get("pedagogical_referent") || "");
  const quality_referent_raw = String(formData.get("quality_referent") || "");
  const disability_referent_raw = String(formData.get("disability_referent") || "");

  const payload = {
    company_name,
    commercial_name: String(formData.get("commercial_name") || "") || null,
    manager_name,
    siret: String(formData.get("siret") || "") || null,
    address: String(formData.get("address") || "") || null,
    phone: String(formData.get("phone") || "") || null,
    email: String(formData.get("email") || "") || null,
    website: String(formData.get("website") || "") || null,
    pedagogical_referent:
      pedagogical_referent_raw || (is_sole_practitioner ? manager_name : null),
    quality_referent: quality_referent_raw || (is_sole_practitioner ? manager_name : null),
    disability_referent:
      disability_referent_raw || (is_sole_practitioner ? manager_name : null),
    is_sole_practitioner,
    onboarding_company_completed: true,
  };

  // Paiement obligatoire avant de renseigner l'entreprise (décision de Nora,
  // 21/08/2026) : au moment du paiement, startCheckout a déjà créé un
  // organisme "placeholder" pour ce compte (cf. lib/actions/billing.ts et
  // migration 0039). On complète donc ce placeholder par une UPDATE plutôt
  // que par un nouvel INSERT — un INSERT échouerait de toute façon sur la
  // contrainte unique de owner_user_id (addendum 17). Le cas "aucun
  // organisme du tout" est conservé en repli défensif (ne devrait plus se
  // produire dans le parcours normal, mais évite de casser un usage direct
  // de cette action hors du nouveau parcours).
  const existing = await getMyOrganization();

  if (existing) {
    const { error } = await supabase.from("organizations").update(payload).eq("id", existing.id);
    if (error) {
      return { error: "Une erreur est survenue : " + error.message };
    }
    redirect("/onboarding/activite");
  }

  const { error } = await supabase
    .from("organizations")
    .insert({ owner_user_id: user.id, ...payload });

  if (error) {
    // code 23505 = violation de contrainte unique (owner_user_id) : un
    // organisme existe déjà pour ce compte, cf. addendum 17.
    if (error.code === "23505") {
      redirect("/dashboard");
    }
    return { error: "Une erreur est survenue : " + error.message };
  }

  redirect("/onboarding/activite");
}

// Champs texte simples réutilisés tels quels par updateOrganization — évite
// de répéter 30 fois `String(formData.get(...) || "") || null`.
const OPTIONAL_TEXT_FIELDS = [
  "commercial_name",
  "manager_name",
  "siret",
  "address",
  "phone",
  "email",
  "website",
  "pedagogical_referent",
  "pedagogical_referent_email",
  "pedagogical_referent_phone",
  "quality_referent",
  "disability_referent",
  "disability_referent_email",
  "disability_referent_phone",
  "administrative_referent",
  "administrative_referent_email",
  "administrative_referent_phone",
  "organization_city",
  "region",
  "complaints_email",
  "dpo_contact_email",
  "external_trainer_discipline",
  "external_trainer_name",
  "external_trainer_contract_type",
  "technical_provider_name",
  "technical_provider_company",
] as const;

// Champs texte avec une valeur par défaut côté base (colonnes NOT NULL) :
// on n'écrase avec une chaîne vide que si l'utilisateur a explicitement
// vidé le champ — sinon on repart de sa valeur.
const DEFAULTED_TEXT_FIELDS = [
  "jurisdiction",
  "procedure_version",
  "archiving_duration",
  "archiving_duration_trainer_docs",
  "watch_collect_frequency",
  "watch_review_frequency",
  "insertion_survey_delay",
  "training_budget_percent_payroll",
  "plan_period",
  "satisfaction_rate_target",
  "trainer_satisfaction_rate_target",
  "partner_satisfaction_rate_target",
  "success_rate_target",
  "insertion_rate_target_6months",
  "absence_relance_delay_1",
  "absence_relance_delay_2",
  "absence_relance_delay_3",
  "complaint_ack_delay",
  "complaint_response_delay",
] as const;

/**
 * Met à jour l'organisme existant de l'utilisateur connecté — utilisé par
 * l'écran "Mes informations qualité" (/parametres/qualite) pour compléter
 * les référents, la région et les métadonnées procédurales requises par les
 * 15 documents transverses (critères 4-7).
 */
export async function updateOrganization(
  _prevState: OrgFormState,
  formData: FormData
): Promise<OrgFormState> {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }

  const company_name = String(formData.get("company_name") || "").trim();
  if (!company_name) {
    return { error: "Le nom de l'entreprise est requis." };
  }

  const payload: Record<string, string | boolean | null> = { company_name };

  for (const field of OPTIONAL_TEXT_FIELDS) {
    payload[field] = String(formData.get(field) || "") || null;
  }
  for (const field of defaultedFieldsFromForm(formData)) {
    payload[field.name] = field.value;
  }

  payload.is_sole_practitioner = formData.get("is_sole_practitioner") === "on";

  const supabase = await createClient();
  const { error } = await supabase.from("organizations").update(payload).eq("id", org.id);

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  redirect("/parametres/qualite?saved=1");
}

function defaultedFieldsFromForm(formData: FormData): { name: string; value: string }[] {
  return DEFAULTED_TEXT_FIELDS.map((name) => ({
    name,
    value: String(formData.get(name) || "").trim(),
  })).filter((f) => f.value.length > 0);
}
