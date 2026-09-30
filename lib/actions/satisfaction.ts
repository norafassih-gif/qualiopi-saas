"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstSession, getMyFirstBeneficiary } from "@/lib/actions/session";

/** Les huit criteres notes de 1 a 5 du questionnaire de satisfaction. */
export const SATISFACTION_CRITERIA = [
  { key: "q_attentes", label: "La formation a répondu à mes attentes" },
  { key: "q_objectifs", label: "Les objectifs pédagogiques étaient clairs" },
  { key: "q_contenu", label: "Le contenu était adapté à mon niveau" },
  { key: "q_formateur", label: "Le formateur a su s'adapter et répondre à mes questions" },
  { key: "q_supports", label: "Les supports remis sont utiles et exploitables" },
  { key: "q_organisation", label: "L'organisation matérielle était satisfaisante" },
  { key: "q_accessibilite", label: "Les conditions d'accueil et d'accessibilité étaient adaptées" },
  { key: "q_recommandation", label: "Je recommanderais cette formation" },
] as const;

export type SatisfactionResponse = {
  id: string;
  answered_on: string;
  beneficiary_id: string | null;
  points_forts: string | null;
  points_ameliorer: string | null;
  commentaire_libre: string | null;
} & Record<string, string | number | null>;

export async function listSatisfactionResponses(): Promise<SatisfactionResponse[]> {
  const org = await getMyOrganization();
  if (!org) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("satisfaction_responses")
    .select("*")
    .eq("organization_id", org.id)
    .order("answered_on", { ascending: false });
  if (error) {
    console.error("listSatisfactionResponses", error);
    return [];
  }
  return (data ?? []) as SatisfactionResponse[];
}

export async function addSatisfactionResponse(formData: FormData): Promise<void> {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }

  const session = await getMyFirstSession();
  const beneficiary = await getMyFirstBeneficiary();

  const note = (key: string) => {
    const raw = Number(formData.get(key) ?? 0);
    return raw >= 1 && raw <= 5 ? raw : null;
  };
  const text = (key: string) => {
    const value = String(formData.get(key) ?? "").trim();
    return value || null;
  };

  const answeredOn = String(formData.get("answered_on") ?? "").trim();

  const payload: Record<string, unknown> = {
    organization_id: org.id,
    beneficiary_id: beneficiary?.id ?? null,
    session_id: session?.id ?? null,
    points_forts: text("points_forts"),
    points_ameliorer: text("points_ameliorer"),
    commentaire_libre: text("commentaire_libre"),
  };
  if (answeredOn) payload.answered_on = answeredOn;
  for (const criterion of SATISFACTION_CRITERIA) {
    payload[criterion.key] = note(criterion.key);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("satisfaction_responses").insert(payload);
  if (error) {
    console.error("addSatisfactionResponse", error);
    redirect("/conformite/satisfaction?error=base");
  }

  revalidatePath("/conformite/satisfaction");
  redirect("/conformite/satisfaction?saved=1");
}

export async function deleteSatisfactionResponse(formData: FormData): Promise<void> {
  const org = await getMyOrganization();
  if (!org) redirect("/onboarding/entreprise");
  const id = String(formData.get("id") ?? "").trim();
  if (id) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("satisfaction_responses")
      .delete()
      .eq("id", id)
      .eq("organization_id", org.id);
    if (error) console.error("deleteSatisfactionResponse", error);
  }
  revalidatePath("/conformite/satisfaction");
  redirect("/conformite/satisfaction");
}
