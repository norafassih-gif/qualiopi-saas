"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstTraining } from "@/lib/actions/training";
import { getMyFirstSession } from "@/lib/actions/session";

// Seuil de réussite du QCM — identique à ce qu'annonce déjà le contenu
// existant (bloc CM_EVAL_001 : "seuil de réussite : 70 %").
const PASS_THRESHOLD_PERCENT = 70;

export type EvaluationAnswerOption = {
  id: string;
  label: string;
  sort_order: number;
};

export type EvaluationQuestion = {
  id: string;
  topic: string;
  question_text: string;
  sort_order: number;
  options: EvaluationAnswerOption[];
};

export type EvaluationBank = {
  categoryLabel: string;
  questions: EvaluationQuestion[];
};

/**
 * Banque de questions QCM pour la catégorie de la formation courante — pas
 * d'IA, uniquement `evaluation_questions`/`evaluation_answer_options`
 * (migration 0024/0025). Une catégorie sans banque importée renvoie
 * simplement une liste vide (même logique que listCategoryQuestions) : la
 * page affiche alors "pas encore disponible pour cette catégorie" plutôt
 * que d'échouer.
 */
export async function getEvaluationBankForMyTraining(): Promise<EvaluationBank | { error: string }> {
  const training = await getMyFirstTraining();
  if (!training) return { error: "Créez d'abord votre formation." };

  const supabase = await createClient();

  const [{ data: category }, { data: questions, error: qError }] = await Promise.all([
    supabase.from("training_categories").select("label").eq("id", training.category_id).maybeSingle(),
    supabase
      .from("evaluation_questions")
      .select("id, topic, question_text, sort_order")
      .eq("category_id", training.category_id)
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  if (qError) {
    return { error: "Erreur lors du chargement des questions : " + qError.message };
  }
  if (!questions || questions.length === 0) {
    return { categoryLabel: category?.label ?? training.category_id, questions: [] };
  }

  const { data: options, error: oError } = await supabase
    .from("evaluation_answer_options")
    .select("id, question_id, label, sort_order")
    .in(
      "question_id",
      questions.map((q) => q.id)
    )
    .order("sort_order");

  if (oError) {
    return { error: "Erreur lors du chargement des réponses : " + oError.message };
  }

  const optionsByQuestion = new Map<string, EvaluationAnswerOption[]>();
  for (const o of options ?? []) {
    const list = optionsByQuestion.get(o.question_id) ?? [];
    list.push({ id: o.id, label: o.label, sort_order: o.sort_order });
    optionsByQuestion.set(o.question_id, list);
  }

  return {
    categoryLabel: category?.label ?? training.category_id,
    questions: questions.map((q) => ({
      id: q.id,
      topic: q.topic,
      question_text: q.question_text,
      sort_order: q.sort_order,
      options: optionsByQuestion.get(q.id) ?? [],
    })),
  };
}

export type EvaluationResultDetail = {
  question_id: string;
  question_text: string;
  topic: string;
  selected_label: string | null;
  correct_label: string;
  is_correct: boolean;
};

export type EvaluationResult = {
  attemptId: string;
  scoreRaw: number;
  scoreMax: number;
  scoreOn20: number;
  scorePercent: number;
  passed: boolean;
  details: EvaluationResultDetail[];
};

/**
 * Corrige et enregistre une tentative de QCM. Correction 100 % locale, par
 * comparaison directe des `id` d'option cochée à `is_correct` en base
 * (aucun appel IA — cf. contrainte du projet). `answers` associe chaque
 * question_id à l'id de l'option choisie par le bénéficiaire.
 */
export async function submitEvaluationAttempt(answers: Record<string, string>): Promise<EvaluationResult | { error: string }> {
  const org = await getMyOrganization();
  if (!org) return { error: "Organisme introuvable." };

  const training = await getMyFirstTraining();
  if (!training) return { error: "Créez d'abord votre formation." };

  const session = await getMyFirstSession();

  const supabase = await createClient();

  const { data: questions, error: qError } = await supabase
    .from("evaluation_questions")
    .select("id, topic, question_text")
    .eq("category_id", training.category_id)
    .eq("is_active", true);

  if (qError || !questions || questions.length === 0) {
    return { error: "Aucune question d'évaluation disponible pour cette catégorie." };
  }

  const { data: options, error: oError } = await supabase
    .from("evaluation_answer_options")
    .select("id, question_id, label, is_correct")
    .in(
      "question_id",
      questions.map((q) => q.id)
    );

  if (oError || !options) {
    return { error: "Erreur lors du chargement du corrigé." };
  }

  const optionsByQuestion = new Map<string, { id: string; label: string; is_correct: boolean }[]>();
  for (const o of options) {
    const list = optionsByQuestion.get(o.question_id) ?? [];
    list.push(o);
    optionsByQuestion.set(o.question_id, list);
  }

  let beneficiaryId: string | null = null;
  if (session) {
    const { data: beneficiary } = await supabase
      .from("beneficiaries")
      .select("id")
      .eq("session_id", session.id)
      .order("id")
      .limit(1)
      .maybeSingle();
    beneficiaryId = beneficiary?.id ?? null;
  }

  const details: EvaluationResultDetail[] = [];
  let scoreRaw = 0;

  for (const q of questions) {
    const questionOptions = optionsByQuestion.get(q.id) ?? [];
    const correctOption = questionOptions.find((o) => o.is_correct);
    const selectedOptionId = answers[q.id] ?? null;
    const selectedOption = questionOptions.find((o) => o.id === selectedOptionId) ?? null;
    const isCorrect = !!selectedOption && !!correctOption && selectedOption.id === correctOption.id;
    if (isCorrect) scoreRaw += 1;

    details.push({
      question_id: q.id,
      question_text: q.question_text,
      topic: q.topic,
      selected_label: selectedOption?.label ?? null,
      correct_label: correctOption?.label ?? "",
      is_correct: isCorrect,
    });
  }

  const scoreMax = questions.length;
  const scorePercent = scoreMax > 0 ? Math.round((scoreRaw / scoreMax) * 1000) / 10 : 0;
  const scoreOn20 = scoreMax > 0 ? Math.round((scoreRaw / scoreMax) * 20 * 10) / 10 : 0;
  const passed = scorePercent >= PASS_THRESHOLD_PERCENT;

  const { data: attempt, error: attemptError } = await supabase
    .from("evaluation_attempts")
    .insert({
      organization_id: org.id,
      training_id: training.id,
      session_id: session?.id ?? null,
      beneficiary_id: beneficiaryId,
      category_id: training.category_id,
      completed_at: new Date().toISOString(),
      score_raw: scoreRaw,
      score_max: scoreMax,
      score_percent: scorePercent,
      passed,
    })
    .select("id")
    .single();

  if (attemptError || !attempt) {
    return { error: "Une erreur est survenue : " + (attemptError?.message ?? "tentative non enregistrée") };
  }

  const answerRows = details.map((d) => ({
    attempt_id: attempt.id,
    question_id: d.question_id,
    selected_option_id: answers[d.question_id] ?? null,
    is_correct: d.is_correct,
  }));

  const { error: answersError } = await supabase.from("evaluation_attempt_answers").insert(answerRows);
  if (answersError) {
    console.error("evaluation_attempt_answers insert failed (non bloquant)", answersError);
  }

  return {
    attemptId: attempt.id,
    scoreRaw,
    scoreMax,
    scoreOn20,
    scorePercent,
    passed,
    details,
  };
}

export type EvaluationAttemptFormState = { error: string | null; result: EvaluationResult | null };

/**
 * Wrapper `useActionState` autour de submitEvaluationAttempt : reconstruit
 * la map question -> option cochée à partir du FormData (des groupes de
 * radios nommés par l'id de question), puis délègue la correction.
 */
export async function submitEvaluationForm(
  _prevState: EvaluationAttemptFormState,
  formData: FormData
): Promise<EvaluationAttemptFormState> {
  const answers: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && value) {
      answers[key] = value;
    }
  }

  const result = await submitEvaluationAttempt(answers);
  if ("error" in result) {
    return { error: result.error, result: null };
  }
  redirect(`/evaluation/resultat/${result.attemptId}`);
}

/**
 * Relit une tentative déjà enregistrée (page de résultat) — aucune
 * recorrection, on relit simplement ce qui a été calculé et stocké au
 * moment de la soumission.
 */
export async function getEvaluationAttemptResult(attemptId: string): Promise<EvaluationResult | { error: string }> {
  const supabase = await createClient();

  const { data: attempt, error: attemptError } = await supabase
    .from("evaluation_attempts")
    .select("id, score_raw, score_max, score_percent, passed")
    .eq("id", attemptId)
    .maybeSingle();

  if (attemptError || !attempt || attempt.score_raw == null || attempt.score_max == null) {
    return { error: "Résultat introuvable." };
  }

  const { data: answers, error: answersError } = await supabase
    .from("evaluation_attempt_answers")
    .select("question_id, selected_option_id, is_correct")
    .eq("attempt_id", attemptId);

  if (answersError) {
    return { error: "Erreur lors du chargement du détail : " + answersError.message };
  }

  const questionIds = (answers ?? []).map((a) => a.question_id);
  const [{ data: questions }, { data: options }] = await Promise.all([
    supabase.from("evaluation_questions").select("id, topic, question_text").in("id", questionIds),
    supabase.from("evaluation_answer_options").select("id, question_id, label, is_correct").in("question_id", questionIds),
  ]);

  const questionById = new Map((questions ?? []).map((q) => [q.id, q]));
  const optionById = new Map((options ?? []).map((o) => [o.id, o]));
  const correctByQuestion = new Map((options ?? []).filter((o) => o.is_correct).map((o) => [o.question_id, o.label]));

  const details: EvaluationResultDetail[] = (answers ?? []).map((a) => {
    const q = questionById.get(a.question_id);
    const selected = a.selected_option_id ? optionById.get(a.selected_option_id) : null;
    return {
      question_id: a.question_id,
      question_text: q?.question_text ?? "",
      topic: q?.topic ?? "",
      selected_label: selected?.label ?? null,
      correct_label: correctByQuestion.get(a.question_id) ?? "",
      is_correct: a.is_correct,
    };
  });

  const scoreOn20 = Math.round((attempt.score_raw / attempt.score_max) * 20 * 10) / 10;

  return {
    attemptId: attempt.id,
    scoreRaw: attempt.score_raw,
    scoreMax: attempt.score_max,
    scoreOn20,
    scorePercent: attempt.score_percent ?? 0,
    passed: attempt.passed ?? false,
    details,
  };
}
