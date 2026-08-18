"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";

export type PartnerType = "sous_traitant" | "partenaire";

export type Partner = {
  id: string;
  organization_id: string;
  partner_type: PartnerType;
  full_name: string;
  siret: string | null;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  legal_representative_name: string | null;
  legal_representative_role: string | null;
  tutor_name: string | null;
  tutor_role: string | null;
  tutor_email: string | null;
  tutor_phone: string | null;
  hourly_rate: number | null;
  mission_start_date: string | null;
  mission_end_date: string | null;
  mission_details: string | null;
};

/**
 * Le sous-traitant (ou partenaire) le plus récemment créé pour ce type —
 * même logique que getMyFirstSession() : suffisant pour le parcours
 * prioritaire actuel (un seul contrat de sous-traitance / une seule
 * convention de partenariat à la fois). Si Nora a besoin d'en gérer
 * plusieurs en parallèle un jour, cette fonction devra devenir une vraie
 * liste avec sélection, mais aucun document ne le permet encore.
 */
export async function getMyFirstPartner(partnerType: PartnerType): Promise<Partner | null> {
  const org = await getMyOrganization();
  if (!org) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("organization_id", org.id)
    .eq("partner_type", partnerType)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getMyFirstPartner", error);
    return null;
  }
  return data as Partner | null;
}

export type PartnerFormState = { error: string | null };

function readPartnerFields(formData: FormData) {
  const full_name = String(formData.get("full_name") || "").trim();
  const siret = String(formData.get("siret") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const contact_email = String(formData.get("contact_email") || "").trim();
  const contact_phone = String(formData.get("contact_phone") || "").trim();
  const legal_representative_name = String(formData.get("legal_representative_name") || "").trim();
  const legal_representative_role = String(formData.get("legal_representative_role") || "").trim();
  const tutor_name = String(formData.get("tutor_name") || "").trim();
  const tutor_role = String(formData.get("tutor_role") || "").trim();
  const tutor_email = String(formData.get("tutor_email") || "").trim();
  const tutor_phone = String(formData.get("tutor_phone") || "").trim();
  const hourly_rate_raw = String(formData.get("hourly_rate") || "").trim();
  const hourly_rate = hourly_rate_raw ? Number(hourly_rate_raw.replace(",", ".")) : null;
  const mission_start_date = String(formData.get("mission_start_date") || "").trim();
  const mission_end_date = String(formData.get("mission_end_date") || "").trim();
  const mission_details = String(formData.get("mission_details") || "").trim();

  return {
    full_name,
    siret: siret || null,
    address: address || null,
    contact_email: contact_email || null,
    contact_phone: contact_phone || null,
    legal_representative_name: legal_representative_name || null,
    legal_representative_role: legal_representative_role || null,
    tutor_name: tutor_name || null,
    tutor_role: tutor_role || null,
    tutor_email: tutor_email || null,
    tutor_phone: tutor_phone || null,
    hourly_rate,
    hourly_rate_raw,
    mission_start_date: mission_start_date || null,
    mission_end_date: mission_end_date || null,
    mission_details: mission_details || null,
  };
}

/**
 * Crée OU met à jour (upsert manuel, un seul par type pour l'instant) le
 * sous-traitant/partenaire de l'organisme — un seul écran de formulaire sert
 * à la fois pour la création et la modification, comme pour /parametres/session.
 */
export async function savePartner(
  partnerType: PartnerType,
  _prevState: PartnerFormState,
  formData: FormData
): Promise<PartnerFormState> {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }

  const fields = readPartnerFields(formData);

  if (!fields.full_name) {
    return {
      error:
        partnerType === "sous_traitant"
          ? "Le nom du sous-traitant / formateur est requis."
          : "Le nom de l'entreprise partenaire est requis.",
    };
  }
  if (fields.hourly_rate_raw && Number.isNaN(fields.hourly_rate)) {
    return { error: "Le taux horaire doit être un nombre." };
  }

  const supabase = await createClient();
  const existing = await getMyFirstPartner(partnerType);

  const payload = {
    organization_id: org.id,
    partner_type: partnerType,
    full_name: fields.full_name,
    siret: fields.siret,
    address: fields.address,
    contact_email: fields.contact_email,
    contact_phone: fields.contact_phone,
    legal_representative_name: fields.legal_representative_name,
    legal_representative_role: fields.legal_representative_role,
    tutor_name: fields.tutor_name,
    tutor_role: fields.tutor_role,
    tutor_email: fields.tutor_email,
    tutor_phone: fields.tutor_phone,
    hourly_rate: fields.hourly_rate,
    mission_start_date: fields.mission_start_date,
    mission_end_date: fields.mission_end_date,
    mission_details: fields.mission_details,
  };

  const { error } = existing
    ? await supabase.from("partners").update(payload).eq("id", existing.id)
    : await supabase.from("partners").insert(payload);

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  redirect(`/parametres/${partnerType === "sous_traitant" ? "sous-traitant" : "partenaire"}?saved=1`);
}
