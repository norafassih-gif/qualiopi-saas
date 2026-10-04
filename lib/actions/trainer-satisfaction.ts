"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstSession } from "@/lib/actions/session";
import { TRAINER_SATISFACTION_CRITERIA } from "@/lib/engine/trainer-satisfaction-criteria";

export type TrainerSatisfactionResponse = {
  id: string;
  answered_on: string;
  trainer_name: string | null;
  difficultes: string | null;
  suggestions: string | null;
  commentaire_libre: string | null;
} & Record<string, string | number | null>;

const PAGE = "/conformite/satisfaction-formateur";

export async function listTrainerSatisfactionResponses(): Promise<TrainerSatisfactionResponse[]> {
  const org = await getMyOrganization();
  if (!org) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainer_satisfaction_responses")
    .select("*")
    .eq("organization_id", org.id)
    .order("answered_on", { ascending: false });
  if (error) {
    console.error("listTrainerSatisfactionResponses", error);
    return [];
  }
  return (data ?? []) as TrainerSatisfactionResponse[];
}

export async function addTrainerSatisfactionResponse(formData: FormData): Promise<void> {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }

  const session = await getMyFirstSession();

  const note = (key: string) => {
    const raw = Number(formData.get(key) ?? 0);
    return raw >= 1 && raw <= 5 ? raw : null;
  };
  const choice = (key: string, allowed: string[]) => {
    const value = String(formData.get(key) ?? "").trim();
    return allowed.includes(value) ? value : null;
  };
  const text = (key: string) => {
    const value = String(formData.get(key) ?? "").trim();
    return value || null;
  };

  const answeredOn = String(formData.get("answered_on") ?? "").trim();

  const payload: Record<string, unknown> = {
    organization_id: org.id,
    session_id: session?.id ?? null,
    trainer_name: text("trainer_name") ?? session?.trainer_name ?? null,
    objectifs_atteints: choice("objectifs_atteints", ["oui", "non", "partiellement"]),
    reintervenir: choice("reintervenir", ["oui", "non"]),
    difficultes: text("difficultes"),
    suggestions: text("suggestions"),
    commentaire_libre: text("commentaire_libre"),
  };
  if (answeredOn) payload.answered_on = answeredOn;
  for (const criterion of TRAINER_SATISFACTION_CRITERIA) {
    payload[criterion.key] = note(criterion.key);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("trainer_satisfaction_responses").insert(payload);
  if (error) {
    console.error("addTrainerSatisfactionResponse", error);
    redirect(PAGE + "?error=base");
  }

  revalidatePath(PAGE);
  redirect(PAGE + "?saved=1");
}

export async function deleteTrainerSatisfactionResponse(formData: FormData): Promise<void> {
  const org = await getMyOrganization();
  if (!org) redirect("/onboarding/entreprise");
  const id = String(formData.get("id") ?? "").trim();
  if (id) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("trainer_satisfaction_responses")
      .delete()
      .eq("id", id)
      .eq("organization_id", org.id);
    if (error) console.error("deleteTrainerSatisfactionResponse", error);
  }
  revalidatePath(PAGE);
  redirect(PAGE);
}
