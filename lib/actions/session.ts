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
  price_amount: number | null;
  price_unit: "gratuit" | "total_ttc" | "total_ht" | "per_participant_ht" | "per_hour_ht";
  funding_type: "autofinancement" | "opco" | "pole_emploi" | "entreprise" | "region" | "cpf" | "autre" | null;
  funding_details: string | null;
  payment_terms: string | null;
  quote_reference: string | null;
  convention_reference: string | null;
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

  const price_unit = String(formData.get("price_unit") || "total_ttc").trim();
  const price_amount_raw = String(formData.get("price_amount") || "").trim();
  // Une formation "gratuite" n'a pas de montant à saisir — on ignore le champ
  // montant dans ce cas plutôt que d'exiger un 0 explicite.
  const price_amount = price_unit === "gratuit" || !price_amount_raw ? null : Number(price_amount_raw.replace(",", "."));
  const funding_type = String(formData.get("funding_type") || "").trim();
  const funding_details = String(formData.get("funding_details") || "").trim();
  const payment_terms = String(formData.get("payment_terms") || "").trim();

  if (!trainer_name) {
    return { error: "Le nom du formateur est requis." };
  }
  if (!start_date || !end_date) {
    return { error: "Les dates de début et de fin sont requises." };
  }
  if (!beneficiary_name) {
    return { error: "Le nom du bénéficiaire est requis." };
  }
  if (price_unit !== "gratuit" && price_amount_raw && Number.isNaN(price_amount)) {
    return { error: "Le tarif doit être un nombre." };
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
      price_amount,
      price_unit,
      funding_type: funding_type || null,
      funding_details: funding_details || null,
      payment_terms: payment_terms || null,
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
