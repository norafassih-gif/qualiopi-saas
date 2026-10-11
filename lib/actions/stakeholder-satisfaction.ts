"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstSession } from "@/lib/actions/session";
import {
  STAKEHOLDER_CRITERIA,
  STAKEHOLDER_QUESTIONS,
  isStakeholderKind,
} from "@/lib/engine/stakeholder-satisfaction-criteria";

export type StakeholderResponse = {
  id: string;
  kind: "financeur" | "entreprise";
  respondent_name: string | null;
  respondent_role: string | null;
  answered_on: string;
  scores: Record<string, number>;
  recommande: string | null;
  renouveler: string | null;
  attentes: string | null;
  commentaire_libre: string | null;
};

const PAGE = "/conformite/satisfaction-parties-prenantes";

export async function listStakeholderResponses(): Promise<StakeholderResponse[]> {
  const org = await getMyOrganization();
  if (!org) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stakeholder_satisfaction_responses")
    .select("*")
    .eq("organization_id", org.id)
    .order("answered_on", { ascending: false });
  if (error) {
    console.error("listStakeholderResponses", error);
    return [];
  }
  return (data ?? []) as StakeholderResponse[];
}

export async function addStakeholderResponse(formData: FormData): Promise<void> {
  const org = await getMyOrganization();
  if (!org) redirect("/onboarding/entreprise");

  const kind = String(formData.get("kind") ?? "");
  if (!isStakeholderKind(kind)) redirect(PAGE + "?error=base");

  const session = await getMyFirstSession();
  const text = (key: string) => String(formData.get(key) ?? "").trim() || null;

  const scores: Record<string, number> = {};
  for (const criterion of STAKEHOLDER_CRITERIA[kind]) {
    const raw = Number(formData.get(criterion.key) ?? 0);
    if (raw >= 1 && raw <= 5) scores[criterion.key] = raw;
  }

  const payload: Record<string, unknown> = {
    organization_id: org.id,
    session_id: session?.id ?? null,
    kind,
    respondent_name: text("respondent_name"),
    respondent_role: text("respondent_role"),
    scores,
    commentaire_libre: text("commentaire_libre"),
  };
  for (const question of STAKEHOLDER_QUESTIONS[kind]) {
    const value = String(formData.get(question.field) ?? "").trim();
    payload[question.field] = question.values.includes(value) ? value : null;
  }
  const answeredOn = text("answered_on");
  if (answeredOn) payload.answered_on = answeredOn;

  const supabase = await createClient();
  const { error } = await supabase.from("stakeholder_satisfaction_responses").insert(payload);
  if (error) {
    console.error("addStakeholderResponse", error);
    redirect(PAGE + "?type=" + kind + "&error=base");
  }
  revalidatePath(PAGE);
  redirect(PAGE + "?type=" + kind + "&saved=1");
}

export async function deleteStakeholderResponse(formData: FormData): Promise<void> {
  const org = await getMyOrganization();
  if (!org) redirect("/onboarding/entreprise");
  const id = String(formData.get("id") ?? "").trim();
  const kind = String(formData.get("kind") ?? "");
  if (id) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("stakeholder_satisfaction_responses")
      .delete()
      .eq("id", id)
      .eq("organization_id", org.id);
    if (error) console.error("deleteStakeholderResponse", error);
  }
  revalidatePath(PAGE);
  redirect(PAGE + (isStakeholderKind(kind) ? "?type=" + kind : ""));
}
