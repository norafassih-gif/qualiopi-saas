"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyFirstTraining } from "@/lib/actions/training";

export type TrainingSession = {
  id: string;
  training_id: string;
  trainer_name: string | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  status: "planned" | "in_progress" | "done" | "cancelled";
};

export type Beneficiary = {
  id: string;
  session_id: string;
  full_name: string;
  company: string | null;
  email: string | null;
  role: string | null;
};

/**
 * La première session de la première formation — suffisant pour préparer le
 * dossier Qualiopi (parcours prioritaire).
 */
export async function getMyFirstSession(): Promise<TrainingSession | null> {
  const training = await getMyFirstTraining();
  if (!training) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("training_id", training.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getMyFirstSession", error);
    return null;
  }
  return data as TrainingSession | null;
}

export type SessionFormState = { error: string | null };

export async function createSession(
  _prevState: SessionFormState,
  formData: FormData
): Promise<SessionFormState> {
  const training = await getMyFirstTraining();
  if (!training) {
    redirect("/onboarding/activite");
  }

  const existing = await getMyFirstSession();
  if (existing) {
    redirect("/dashboard");
  }

  const trainer_name = String(formData.get("trainer_name") || "").trim();
  const start_date = String(formData.get("start_date") || "");
  const end_date = String(formData.get("end_date") || "");
  const location = String(formData.get("location") || "").trim();
  const beneficiary_name = String(formData.get("beneficiary_name") || "").trim();
  const beneficiary_company = String(formData.get("beneficiary_company") || "").trim();
  const beneficiary_email = String(formData.get("beneficiary_email") || "").trim();

  if (!trainer_name) {
    return { error: "Le nom du formateur est requis." };
  }
  if (!start_date || !end_date) {
    return { error: "Les dates de début et de fin sont requises." };
  }
  if (!beneficiary_name) {
    return { error: "Le nom du bénéficiaire est requis." };
  }

  const supabase = await createClient();

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      training_id: training.id,
      trainer_name,
      start_date,
      end_date,
      location: location || null,
      status: "planned",
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    return { error: "Une erreur est survenue : " + (sessionError?.message ?? "session non créée") };
  }

  const { error: beneficiaryError } = await supabase.from("beneficiaries").insert({
    session_id: session.id,
    full_name: beneficiary_name,
    company: beneficiary_company || null,
    email: beneficiary_email || null,
  });

  if (beneficiaryError) {
    return { error: "Une erreur est survenue : " + beneficiaryError.message };
  }

  redirect("/dashboard");
}
