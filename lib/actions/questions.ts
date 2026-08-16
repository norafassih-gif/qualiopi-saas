"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstTraining, type Training } from "@/lib/actions/training";

export type AnswerOption = {
  id: string;
  question_id: string;
  value: string;
  label: string;
  sort_order: number;
};

export type Question = {
  id: string;
  category_id: string | null;
  step: string;
  label: string;
  help_text: string | null;
  type: "text" | "boolean" | "single_choice" | "multi_choice" | "number" | "date" | "file";
  variable_key: string | null;
  sort_order: number;
};

export type QuestionWithOptions = Question & { options: AnswerOption[] };

/**
 * Questions "pédagogiques" propres à une catégorie de formation, pour une
 * étape donnée (ex: les thématiques cochables de Community Management à
 * l'étape "activite"). Une catégorie sans banque de contenu importée n'a
 * simplement aucune question ici — l'écran est alors sauté (cf. point 9 de
 * la conception : arbre de questions conditionnelles).
 */
export async function listCategoryQuestions(
  categoryId: string,
  step: string
): Promise<QuestionWithOptions[]> {
  const supabase = await createClient();

  const { data: questions, error } = await supabase
    .from("questions")
    .select("id, category_id, step, label, help_text, type, variable_key, sort_order")
    .eq("category_id", categoryId)
    .eq("step", step)
    .eq("is_active", true)
    .order("sort_order");

  if (error || !questions || questions.length === 0) {
    if (error) console.error("listCategoryQuestions", error);
    return [];
  }

  const { data: options, error: optError } = await supabase
    .from("answer_options")
    .select("id, question_id, value, label, sort_order")
    .in(
      "question_id",
      questions.map((q) => q.id)
    )
    .order("sort_order");

  if (optError) {
    console.error("listCategoryQuestions (options)", optError);
  }

  return questions.map((q) => ({
    ...q,
    options: (options ?? []).filter((o) => o.question_id === q.id),
  })) as QuestionWithOptions[];
}

/**
 * Réponses déjà enregistrées pour la formation courante, indexées par
 * question_id — sert à préremplir l'écran si l'utilisateur y revient.
 */
export async function getMyAnswers(trainingId: string): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_answers")
    .select("question_id, answer_value")
    .eq("training_id", trainingId);

  if (error) {
    console.error("getMyAnswers", error);
    return {};
  }

  const map: Record<string, unknown> = {};
  for (const row of data ?? []) {
    map[row.question_id] = row.answer_value;
  }
  return map;
}

/**
 * Vrai s'il existe au moins une question pédagogique pour cette catégorie à
 * l'étape "activite" — permet de savoir si l'écran "thématiques" doit être
 * proposé à l'utilisateur ou sauté (catégorie sans banque de contenu encore
 * importée).
 */
export async function hasActiviteQuestions(categoryId: string): Promise<boolean> {
  const questions = await listCategoryQuestions(categoryId, "activite");
  return questions.length > 0;
}

export type AnswersFormState = { error: string | null };

async function requireTrainingForAnswers(): Promise<Training> {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }
  const training = await getMyFirstTraining();
  if (!training) {
    redirect("/onboarding/activite");
  }
  return training;
}

/**
 * Enregistre les réponses aux questions pédagogiques de l'étape "activite"
 * (ex: thématiques cochées pour Community Management). Une ligne par
 * question dans user_answers, upsertée sur (organization_id, training_id,
 * question_id) — cf. contrainte unique en base.
 */
export async function saveTrainingAnswers(
  _prevState: AnswersFormState,
  formData: FormData
): Promise<AnswersFormState> {
  const training = await requireTrainingForAnswers();
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }

  const questions = await listCategoryQuestions(training.category_id, "activite");
  if (questions.length === 0) {
    redirect("/dashboard");
  }

  const rows: {
    organization_id: string;
    training_id: string;
    question_id: string;
    answer_value: unknown;
  }[] = [];

  for (const q of questions) {
    if (q.type === "multi_choice") {
      const values = formData.getAll(q.id).map(String);
      if (values.length === 0) {
        return { error: `Cochez au moins une réponse pour : « ${q.label} ».` };
      }
      rows.push({
        organization_id: org.id,
        training_id: training.id,
        question_id: q.id,
        answer_value: values,
      });
    } else if (q.type === "single_choice") {
      const value = String(formData.get(q.id) || "");
      if (!value) {
        return { error: `Choisissez une réponse pour : « ${q.label} ».` };
      }
      rows.push({
        organization_id: org.id,
        training_id: training.id,
        question_id: q.id,
        answer_value: value,
      });
    } else {
      const value = String(formData.get(q.id) || "").trim();
      if (value) {
        rows.push({
          organization_id: org.id,
          training_id: training.id,
          question_id: q.id,
          answer_value: value,
        });
      }
    }
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_answers")
    .upsert(rows, { onConflict: "organization_id,training_id,question_id" });

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  redirect("/dashboard");
}
