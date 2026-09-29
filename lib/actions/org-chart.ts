"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";

export type OrgChartEntry = {
  id: string;
  person_name: string;
  function_label: string;
  level: number;
  sort_order: number;
};

/**
 * Organigramme fonctionnel saisi par le client : une ligne = une personne et
 * une fonction. Le schema du PDF est genere a partir de ces lignes.
 * Niveau 1 = direction, niveau 2 = fonctions rattachees, niveau 3 = appuis.
 */
export async function listOrgChartEntries(): Promise<OrgChartEntry[]> {
  const org = await getMyOrganization();
  if (!org) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("org_chart_entries")
    .select("id, person_name, function_label, level, sort_order")
    .eq("organization_id", org.id)
    .order("level")
    .order("sort_order");
  if (error) {
    console.error("listOrgChartEntries", error);
    return [];
  }
  return (data ?? []) as OrgChartEntry[];
}

export async function addOrgChartEntry(formData: FormData): Promise<void> {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }

  const personName = String(formData.get("person_name") ?? "").trim();
  const functionLabel = String(formData.get("function_label") ?? "").trim();
  const levelRaw = Number(formData.get("level") ?? 2);
  const level = levelRaw === 1 || levelRaw === 3 ? levelRaw : 2;

  if (!personName || !functionLabel) {
    redirect("/parametres/organigramme?error=champs");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("org_chart_entries").insert({
    organization_id: org.id,
    person_name: personName,
    function_label: functionLabel,
    level,
    sort_order: Math.floor(Date.now() / 1000) % 100000,
  });

  if (error) {
    console.error("addOrgChartEntry", error);
    redirect("/parametres/organigramme?error=base");
  }

  revalidatePath("/parametres/organigramme");
  redirect("/parametres/organigramme?saved=1");
}

export async function deleteOrgChartEntry(formData: FormData): Promise<void> {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }
  const id = String(formData.get("id") ?? "").trim();
  if (id) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("org_chart_entries")
      .delete()
      .eq("id", id)
      .eq("organization_id", org.id);
    if (error) console.error("deleteOrgChartEntry", error);
  }
  revalidatePath("/parametres/organigramme");
  redirect("/parametres/organigramme");
}
