"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstTraining, type Training } from "@/lib/actions/training";
import { runRulesEngine } from "./rules-engine";
import { resolveTrainingVariables } from "./variable-resolver";
import type { RuleRow } from "./types";

export type BuiltModule = {
  code: string;
  title: string;
  duration_hours: number | null;
};

export type BuiltProgram = {
  modules: BuiltModule[];
  contentBlockCountByType: Record<string, number>;
  totalDurationHours: number;
  firedRuleCount: number;
};

export type BuildProgramResult = BuiltProgram | { error: string };

// Requête directe (plutôt qu'un import depuis lib/actions/questions.ts) pour
// éviter une dépendance circulaire : questions.ts appelle
// buildProgramForMyTraining() juste après avoir enregistré les réponses,
// pour que la durée de la formation soit synchronisée immédiatement.
async function getSavedAnswers(trainingId: string): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_answers")
    .select("question_id, answer_value")
    .eq("training_id", trainingId);

  if (error) {
    console.error("getSavedAnswers", error);
    return {};
  }

  const map: Record<string, unknown> = {};
  for (const row of data ?? []) {
    map[row.question_id] = row.answer_value;
  }
  return map;
}

type ComputedProgram = {
  moduleRows: { id: string; code: string; title: string; default_duration_hours: number | null }[];
  blockRows: { id: string; code: string; type: string }[];
  addedByModule: Map<string, string>;
  addedByBlock: Map<string, string>;
  firedRuleCount: number;
};

/**
 * Cœur du moteur, sans aucune écriture en base : évalue les règles pour la
 * catégorie de la formation à partir d'un jeu de réponses donné (déjà
 * enregistré, ou simple brouillon en cours de saisie côté client), et
 * résout les codes retournés en lignes réelles (titre, durée). Utilisé à la
 * fois par `buildProgramForMyTraining` (persiste le résultat) et par
 * `previewProgramForAnswers` (aperçu en direct pendant que l'utilisateur
 * coche ses thématiques, cf. écran /onboarding/themes).
 */
async function computeProgram(
  training: Training,
  answers: Record<string, unknown>
): Promise<ComputedProgram | { error: string }> {
  const supabase = await createClient();

  const rulesResponse = await supabase
    .from("rules")
    .select("id, label, conditions, actions, priority")
    .eq("is_active", true)
    .or(`category_id.eq.${training.category_id},category_id.is.null`);

  if (rulesResponse.error) {
    return { error: "Impossible de charger les règles : " + rulesResponse.error.message };
  }

  const rules = (rulesResponse.data ?? []) as unknown as RuleRow[];
  const variables = resolveTrainingVariables(training, answers);
  const result = runRulesEngine(rules, variables);

  const [moduleResponse, blockResponse] = await Promise.all([
    result.moduleCodes.size > 0
      ? supabase
          .from("modules")
          .select("id, code, title, default_duration_hours")
          .in("code", Array.from(result.moduleCodes))
      : Promise.resolve({ data: [], error: null }),
    result.contentBlockCodes.size > 0
      ? supabase
          .from("content_blocks")
          .select("id, code, type")
          .in("code", Array.from(result.contentBlockCodes))
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (moduleResponse.error) {
    return { error: "Erreur lors de la lecture des modules : " + moduleResponse.error.message };
  }
  if (blockResponse.error) {
    return { error: "Erreur lors de la lecture des contenus : " + blockResponse.error.message };
  }

  return {
    moduleRows: moduleResponse.data ?? [],
    blockRows: blockResponse.data ?? [],
    addedByModule: new Map(
      result.addedBy.filter((a) => a.kind === "module").map((a) => [a.code, a.ruleId])
    ),
    addedByBlock: new Map(
      result.addedBy.filter((a) => a.kind === "content_block").map((a) => [a.code, a.ruleId])
    ),
    firedRuleCount: result.firedRuleIds.length,
  };
}

function summarize(computed: ComputedProgram): BuiltProgram {
  const contentBlockCountByType: Record<string, number> = {};
  for (const b of computed.blockRows) {
    contentBlockCountByType[b.type] = (contentBlockCountByType[b.type] ?? 0) + 1;
  }

  const totalDurationHours = computed.moduleRows.reduce(
    (sum, m) => sum + (m.default_duration_hours ?? 0),
    0
  );

  return {
    modules: computed.moduleRows
      .map((m) => ({ code: m.code, title: m.title, duration_hours: m.default_duration_hours }))
      .sort((a, b) => a.code.localeCompare(b.code)),
    contentBlockCountByType,
    totalDurationHours,
    firedRuleCount: computed.firedRuleCount,
  };
}

/**
 * Aperçu en direct, SANS écriture en base : recalcule le programme pour un
 * jeu de réponses candidat (ex: cases cochées en cours de saisie, pas
 * encore soumises) — permet d'afficher la durée totale en temps réel sur
 * l'écran des thématiques, avant validation.
 */
export async function previewProgramForAnswers(
  candidateAnswers: Record<string, unknown>
): Promise<BuildProgramResult> {
  const org = await getMyOrganization();
  if (!org) redirect("/onboarding/entreprise");

  const training = await getMyFirstTraining();
  if (!training) redirect("/onboarding/activite");

  const computed = await computeProgram(training, candidateAnswers);
  if ("error" in computed) return computed;
  return summarize(computed);
}

/**
 * Construit (ou reconstruit) le programme de la formation à partir des
 * réponses ENREGISTRÉES de l'utilisateur — QUESTION -> RÉPONSE -> RÈGLE ->
 * VARIABLES -> BLOC DE CONTENU (cf. principe technique, point 7 de la
 * conception). Aucun appel IA : uniquement banque de contenu + règles
 * conditionnelles stockées en base. Idempotent : peut être rappelée après
 * modification des thématiques, elle remplace le programme précédemment
 * calculé (training_modules / training_content_blocks) plutôt que
 * d'accumuler des doublons.
 */
export async function buildProgramForMyTraining(): Promise<BuildProgramResult> {
  const org = await getMyOrganization();
  if (!org) redirect("/onboarding/entreprise");

  const training = await getMyFirstTraining();
  if (!training) redirect("/onboarding/activite");

  const answers = await getSavedAnswers(training.id);
  const computed = await computeProgram(training, answers);
  if ("error" in computed) return computed;

  const supabase = await createClient();

  // Regénération idempotente : on remplace le programme précédemment
  // calculé plutôt que d'accumuler des doublons à chaque nouvel essai.
  const { error: deleteModulesError } = await supabase
    .from("training_modules")
    .delete()
    .eq("training_id", training.id);
  if (deleteModulesError) {
    return { error: "Erreur lors du nettoyage des modules : " + deleteModulesError.message };
  }

  const { error: deleteBlocksError } = await supabase
    .from("training_content_blocks")
    .delete()
    .eq("training_id", training.id);
  if (deleteBlocksError) {
    return { error: "Erreur lors du nettoyage des contenus : " + deleteBlocksError.message };
  }

  const moduleInserts = computed.moduleRows.map((m, i) => ({
    training_id: training.id,
    module_id: m.id,
    sort_order: i,
    duration_hours: m.default_duration_hours,
    added_by_rule_id: computed.addedByModule.get(m.code) ?? null,
  }));

  const blockInserts = computed.blockRows.map((b) => ({
    training_id: training.id,
    content_block_id: b.id,
    added_by_rule_id: computed.addedByBlock.get(b.code) ?? null,
  }));

  if (moduleInserts.length > 0) {
    const { error } = await supabase.from("training_modules").insert(moduleInserts);
    if (error) return { error: "Erreur lors de l'enregistrement des modules : " + error.message };
  }
  if (blockInserts.length > 0) {
    const { error } = await supabase.from("training_content_blocks").insert(blockInserts);
    if (error) return { error: "Erreur lors de l'enregistrement des contenus : " + error.message };
  }

  const summary = summarize(computed);

  // La durée déclarée de la formation suit désormais automatiquement le
  // programme réellement généré — plus besoin de la faire deviner à
  // l'utilisateur en amont ni de lui signaler un écart après coup (cf.
  // retour de Nora : chaque thématique doit "compter" toute seule).
  if (summary.totalDurationHours > 0 && summary.totalDurationHours !== training.duration_hours) {
    await supabase
      .from("trainings")
      .update({ duration_hours: summary.totalDurationHours })
      .eq("id", training.id);
  }

  return summary;
}
