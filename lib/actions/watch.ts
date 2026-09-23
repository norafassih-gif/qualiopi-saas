"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";

export type WatchAxis = {
  id: string;
  label: string;
  indicator_number: number;
  description: string | null;
  sort_order: number;
};

export type WatchEntry = {
  id: string;
  axis_id: string;
  source_name: string;
  source_url: string | null;
  title: string;
  consulted_on: string;
  summary: string;
  impact: string | null;
  action_taken: string | null;
  action_status: "to_do" | "done" | "not_applicable";
  action_date: string | null;
  responsible: string | null;
  created_at: string;
};

/**
 * Les 4 axes de veille (migration 0046) : legal (indicateur 23), metiers
 * (24), pedagogique (25), accessibilite (26). Referentiel en lecture seule,
 * comme qualiopi_indicators.
 */
export async function listWatchAxes(): Promise<WatchAxis[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("watch_axes")
    .select("id, label, indicator_number, description, sort_order")
    .order("sort_order");

  if (error) {
    console.error("listWatchAxes", error);
    return [];
  }
  return (data ?? []) as WatchAxis[];
}

/**
 * Les entrees de veille de l'organisme courant, du plus recent au plus
 * ancien. Le filtrage par organisme est double : ici ET par RLS en base.
 */
export async function listWatchEntries(axisId?: string): Promise<WatchEntry[]> {
  const org = await getMyOrganization();
  if (!org) return [];

  const supabase = await createClient();
  let query = supabase.from("watch_entries").select("*").eq("organization_id", org.id);
  if (axisId) query = query.eq("axis_id", axisId);

  const { data, error } = await query.order("consulted_on", { ascending: false });
  if (error) {
    console.error("listWatchEntries", error);
    return [];
  }
  return (data ?? []) as WatchEntry[];
}

/**
 * Ajoute une entree de veille. created_at est pose par le serveur et n'est
 * jamais modifiable depuis l'interface : c'est lui qui prouve la regularite
 * de la veille en audit. consulted_on, en revanche, est declaree par
 * l'organisme et peut etre anterieure.
 */
export async function addWatchEntry(formData: FormData): Promise<void> {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }

  const axisId = String(formData.get("axis_id") || "legal").trim();
  const sourceName = String(formData.get("source_name") || "").trim();
  const sourceUrl = String(formData.get("source_url") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const consultedOn = String(formData.get("consulted_on") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const actionTaken = String(formData.get("action_taken") || "").trim();

  if (!sourceName || !title || !summary) {
    redirect("/conformite/veille?axe=" + axisId + "&error=champs");
  }

  const today = new Date().toISOString().slice(0, 10);
  const supabase = await createClient();

  const { error } = await supabase.from("watch_entries").insert({
    organization_id: org.id,
    axis_id: axisId,
    source_name: sourceName,
    source_url: sourceUrl || null,
    title: title,
    consulted_on: consultedOn || today,
    summary: summary,
    action_taken: actionTaken || null,
    action_status: actionTaken ? "done" : "to_do",
    action_date: actionTaken ? today : null,
    responsible: org.quality_referent || org.manager_name || null,
  });

  if (error) {
    console.error("addWatchEntry", error);
    redirect("/conformite/veille?axe=" + axisId + "&error=base");
  }

  revalidatePath("/conformite/veille");
  redirect("/conformite/veille?axe=" + axisId + "&saved=1");
}

/**
 * Supprime une entree de veille de l'organisme courant. La RLS empeche de
 * toute facon de supprimer celle d'un autre organisme.
 */
export async function deleteWatchEntry(formData: FormData): Promise<void> {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }

  const id = String(formData.get("id") || "").trim();
  const axisId = String(formData.get("axis_id") || "legal").trim();
  if (!id) {
    redirect("/conformite/veille?axe=" + axisId);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("watch_entries")
    .delete()
    .eq("id", id)
    .eq("organization_id", org.id);

  if (error) {
    console.error("deleteWatchEntry", error);
  }

  revalidatePath("/conformite/veille");
  redirect("/conformite/veille?axe=" + axisId);
}
