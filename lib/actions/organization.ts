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
  pedagogical_referent: string | null;
  quality_referent: string | null;
  disability_referent: string | null;
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

  // Garde-fou applicatif en plus de la contrainte unique en base (point 17) :
  // on vérifie explicitement avant l'insert pour renvoyer un message clair
  // plutôt qu'une erreur de contrainte SQL brute.
  const existing = await getMyOrganization();
  if (existing) {
    redirect("/dashboard");
  }

  const company_name = String(formData.get("company_name") || "").trim();
  if (!company_name) {
    return { error: "Le nom de l'entreprise est requis." };
  }

  const payload = {
    owner_user_id: user.id,
    company_name,
    commercial_name: String(formData.get("commercial_name") || "") || null,
    manager_name: String(formData.get("manager_name") || "") || null,
    siret: String(formData.get("siret") || "") || null,
    address: String(formData.get("address") || "") || null,
    phone: String(formData.get("phone") || "") || null,
    email: String(formData.get("email") || "") || null,
    website: String(formData.get("website") || "") || null,
    pedagogical_referent: String(formData.get("pedagogical_referent") || "") || null,
    quality_referent: String(formData.get("quality_referent") || "") || null,
    disability_referent: String(formData.get("disability_referent") || "") || null,
  };

  const { error } = await supabase.from("organizations").insert(payload);

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
