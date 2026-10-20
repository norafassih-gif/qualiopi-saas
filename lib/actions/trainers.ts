"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";

export type OrgTrainer = {
  id: string;
  organization_id: string;
  full_name: string;
  role: string | null;
  is_manager: boolean;
  is_subcontracted: boolean;
  link_type: string | null;
  email: string | null;
  phone: string | null;
  domains: string | null;
  diplomas: string | null;
  experience: string | null;
  skills: string | null;
  animation_experience: string | null;
  continuing_training: string | null;
  sort_order: number;
};

/** Formateurs de l'organisme, dans l'ordre de saisie. */
export async function getMyTrainers(): Promise<OrgTrainer[]> {
  const org = await getMyOrganization();
  if (!org) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_trainers")
    .select("*")
    .eq("organization_id", org.id)
    .order("sort_order")
    .order("created_at");
  if (error) {
    console.error("getMyTrainers", error);
    return [];
  }
  return (data ?? []) as OrgTrainer[];
}

function text(formData: FormData, name: string): string | null {
  const value = String(formData.get(name) ?? "").trim();
  return value || null;
}

/** Crée ou met à jour un formateur (id présent = mise à jour). */
export async function saveTrainer(formData: FormData): Promise<void> {
  const org = await getMyOrganization();
  if (!org) redirect("/onboarding/entreprise");

  const id = text(formData, "id");
  const full_name = text(formData, "full_name");
  if (!full_name) redirect("/parametres/formateurs?error=nom");

  const fields = {
    full_name,
    role: text(formData, "role"),
    is_manager: formData.get("is_manager") === "on",
    is_subcontracted: formData.get("is_subcontracted") === "on",
    link_type: text(formData, "link_type"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    domains: text(formData, "domains"),
    diplomas: text(formData, "diplomas"),
    experience: text(formData, "experience"),
    skills: text(formData, "skills"),
    animation_experience: text(formData, "animation_experience"),
    continuing_training: text(formData, "continuing_training"),
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("organization_trainers").update(fields).eq("id", id).eq("organization_id", org.id)
    : await supabase.from("organization_trainers").insert({ ...fields, organization_id: org.id });
  if (error) {
    console.error("saveTrainer", error);
    redirect("/parametres/formateurs?error=save");
  }
  revalidatePath("/parametres/formateurs");
  revalidatePath("/nda");
  redirect("/parametres/formateurs?saved=1");
}

export async function deleteTrainer(formData: FormData): Promise<void> {
  const org = await getMyOrganization();
  if (!org) redirect("/onboarding/entreprise");
  const id = text(formData, "id");
  if (id) {
    const supabase = await createClient();
    await supabase.from("organization_trainers").delete().eq("id", id).eq("organization_id", org.id);
  }
  revalidatePath("/parametres/formateurs");
  revalidatePath("/nda");
  redirect("/parametres/formateurs?saved=1");
}
