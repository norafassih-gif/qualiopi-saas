"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";

export type TrainingCategory = {
  id: string;
  label: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
};

export type Training = {
  id: string;
  organization_id: string;
  category_id: string;
  name: string;
  duration_hours: number | null;
  modality: "presentiel" | "distanciel" | "hybride" | null;
  target_audience: string[];
  status: "draft" | "in_progress" | "complete";
};

/**
 * Liste des 10 catégories de formation (référentiel, lecture publique) —
 * cf. point 12 de la conception.
 */
export async function listTrainingCategories(): Promise<TrainingCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_categories")
    .select("id, label, description, icon, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    console.error("listTrainingCategories", error);
    return [];
  }
  return data as TrainingCategory[];
}

/**
 * Une seule formation active suffit pour préparer le dossier Qualiopi
 * (le multi-formations n'est utile que pour la Partie 2 — site internet).
 * On prend donc la première formation de l'organisme, s'il y en a une.
 */
export async function getMyFirstTraining(): Promise<Training | null> {
  const org = await getMyOrganization();
  if (!org) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainings")
    .select("*")
    .eq("organization_id", org.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getMyFirstTraining", error);
    return null;
  }
  return data as Training | null;
}

export type TrainingFormState = { error: string | null };

const VALID_MODALITIES = ["presentiel", "distanciel", "hybride"] as const;

export async function createTraining(
  _prevState: TrainingFormState,
  formData: FormData
): Promise<TrainingFormState> {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }

  // Une formation par organisme suffit pour le parcours prioritaire — si elle
  // existe déjà, on ne la recrée pas.
  const existing = await getMyFirstTraining();
  if (existing) {
    redirect("/dashboard");
  }

  const category_id = String(formData.get("category_id") || "");
  const name = String(formData.get("name") || "").trim();
  const durationRaw = String(formData.get("duration_hours") || "");
  const modality = String(formData.get("modality") || "");
  const target_audience = formData.getAll("target_audience").map(String);

  if (!category_id) {
    return { error: "Choisissez un domaine de formation." };
  }
  if (!name) {
    return { error: "Le nom de la formation est requis." };
  }
  if (!VALID_MODALITIES.includes(modality as (typeof VALID_MODALITIES)[number])) {
    return { error: "Choisissez une modalité (présentiel, distanciel ou hybride)." };
  }

  const duration_hours = durationRaw ? Number(durationRaw) : null;
  if (durationRaw && (Number.isNaN(duration_hours) || (duration_hours ?? 0) <= 0)) {
    return { error: "Durée invalide." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("trainings").insert({
    organization_id: org.id,
    category_id,
    name,
    duration_hours,
    modality,
    target_audience,
    status: "draft",
  });

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  // Certaines catégories ont une banque de contenu importée (questions
  // pédagogiques conditionnelles, ex. thématiques Community Management) —
  // on y envoie directement l'utilisateur si c'est le cas, sinon on passe
  // directement au tableau de bord (cf. arbre de questions conditionnelles,
  // point 9 de la conception). Requête directe ici (plutôt qu'un import
  // depuis lib/actions/questions.ts) pour éviter une dépendance circulaire
  // entre les deux modules.
  const { count } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("category_id", category_id)
    .eq("step", "activite")
    .eq("is_active", true);

  if ((count ?? 0) > 0) {
    redirect("/onboarding/themes");
  }

  redirect("/dashboard");
}
