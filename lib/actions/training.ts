"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CUSTOM_CATEGORY_ID } from "@/lib/engine/custom-program";
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
  // Programme saisi par le client (catégorie sur_mesure, migration 0051).
  custom_program?: unknown;
  nsf_specialty?: string | null;
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
  const access_delay = String(formData.get("access_delay") ?? "").trim();
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
    access_delay: access_delay || null,
    status: "draft",
  });

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  // Formation sur mesure : le client saisit lui-même son programme.
  if (category_id === CUSTOM_CATEGORY_ID) {
    revalidatePath("/", "layout");
    redirect("/parametres/programme");
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

export type UpdateTrainingFormState = { error: string | null };

/**
 * "Ma formation" n'était éditable qu'une seule fois, à l'onboarding
 * (createTraining) : aucune page ne permettait ensuite de corriger le nom,
 * la durée, la modalité ou le public visé — bug remonté par Nora le
 * 23/08/2026 ("je n'arrive pas à modifier que l'apprenant n'est pas
 * demandeur d'emploi"). Le domaine de formation (category_id) n'est
 * volontairement PAS modifiable ici : il conditionne les thématiques et le
 * programme déjà construits (/onboarding/themes, /onboarding/programme) —
 * le changer après coup désynchroniserait le programme existant.
 */
export async function updateTraining(
  _prevState: UpdateTrainingFormState,
  formData: FormData
): Promise<UpdateTrainingFormState> {
  const training = await getMyFirstTraining();
  if (!training) {
    redirect("/onboarding/activite");
  }

  const name = String(formData.get("name") || "").trim();
  if (!name) {
    return { error: "Le nom de la formation est requis." };
  }

  const modality = String(formData.get("modality") || "");
  if (!VALID_MODALITIES.includes(modality as (typeof VALID_MODALITIES)[number])) {
    return { error: "Choisissez une modalité (présentiel, distanciel ou hybride)." };
  }

  const durationRaw = String(formData.get("duration_hours") || "");
  const duration_hours = durationRaw ? Number(durationRaw) : null;
  if (durationRaw && (Number.isNaN(duration_hours) || (duration_hours ?? 0) <= 0)) {
    return { error: "Durée invalide." };
  }

  const access_delay = String(formData.get("access_delay") ?? "").trim();
  const target_audience = formData.getAll("target_audience").map(String);

  const supabase = await createClient();
  const { error } = await supabase
    .from("trainings")
    .update({ access_delay: access_delay || null, name, duration_hours, modality, target_audience })
    .eq("id", training.id);

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  redirect("/parametres/formation?saved=1");
}


/**
 * Enregistre le programme d'une formation sur mesure (catégorie sur_mesure) :
 * objectifs, compétences, prérequis, méthodes, évaluations, modules. La durée
 * de la formation suit la somme des durées des modules quand elles sont
 * renseignées.
 */
export async function saveCustomProgram(formData: FormData): Promise<void> {
  const training = await getMyFirstTraining();
  if (!training) redirect("/onboarding/activite");

  const lines = (key: string) =>
    String(formData.get(key) ?? "")
      .split("\n")
      .map((l) => l.replace(/^[-•*\s]+/, "").trim())
      .filter(Boolean);

  const modules: { title: string; hours: number | null; content: string }[] = [];
  for (let i = 0; i < 20; i++) {
    const title = String(formData.get(`module_title_${i}`) ?? "").trim();
    if (!title) continue;
    const hours = Number(String(formData.get(`module_hours_${i}`) ?? "").replace(",", "."));
    modules.push({
      title,
      hours: Number.isFinite(hours) && hours > 0 ? hours : null,
      content: String(formData.get(`module_content_${i}`) ?? "").trim(),
    });
  }

  const custom_program = {
    objectives: lines("objectives"),
    skills: lines("skills"),
    prerequisites: String(formData.get("prerequisites") ?? "").trim(),
    methods: lines("methods"),
    evaluations: lines("evaluations"),
    exercises: lines("exercises"),
    positioning: lines("positioning"),
    needs: lines("needs"),
    modules,
  };
  const nsf_specialty = String(formData.get("nsf_specialty") ?? "").trim() || null;
  const total = modules.reduce((sum, m) => sum + (m.hours ?? 0), 0);

  const supabase = await createClient();
  const update: Record<string, unknown> = { custom_program, nsf_specialty };
  if (total > 0) update.duration_hours = total;
  const { error } = await supabase.from("trainings").update(update).eq("id", training.id);
  if (error) {
    console.error("saveCustomProgram", error);
    redirect("/parametres/programme?error=1");
  }
  revalidatePath("/", "layout");
  redirect("/parametres/programme?saved=1");
}
