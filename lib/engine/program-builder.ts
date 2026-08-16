"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstTraining } from "@/lib/actions/training";
import { getMyAnswers } from "@/lib/actions/questions";
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

/**
 * Construit (ou reconstruit) le programme de la formation à partir des
 * réponses de l'utilisateur et du moteur de règles — QUESTION -> RÉPONSE ->
 * RÈGLE -> VARIABLES -> BLOC DE CONTENU (cf. principe technique, point 7 de
 * la conception). Aucun appel IA : uniquement banque de contenu + règles
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

  const supabase = await createClient();

  const [rulesResponse, answers] = await Promise.all([
    supabase
      .from("rules")
      .select("id, label, conditions, actions, priority")
      .eq("is_active", true)
      .or(`category_id.eq.${training.category_id},category_id.is.null`),
    getMyAnswers(training.id),
  ]);

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

  const moduleRows = moduleResponse.data ?? [];
  const blockRows = blockResponse.data ?? [];

  const addedByModule = new Map(
    result.addedBy.filter((a) => a.kind === "module").map((a) => [a.code, a.ruleId])
  );
  const addedByBlock = new Map(
    result.addedBy.filter((a) => a.kind === "content_block").map((a) => [a.code, a.ruleId])
  );

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

  const moduleInserts = moduleRows.map((m, i) => ({
    training_id: training.id,
    module_id: m.id,
    sort_order: i,
    duration_hours: m.default_duration_hours,
    added_by_rule_id: addedByModule.get(m.code) ?? null,
  }));

  const blockInserts = blockRows.map((b) => ({
    training_id: training.id,
    content_block_id: b.id,
    added_by_rule_id: addedByBlock.get(b.code) ?? null,
  }));

  if (moduleInserts.length > 0) {
    const { error } = await supabase.from("training_modules").insert(moduleInserts);
    if (error) return { error: "Erreur lors de l'enregistrement des modules : " + error.message };
  }
  if (blockInserts.length > 0) {
    const { error } = await supabase.from("training_content_blocks").insert(blockInserts);
    if (error) return { error: "Erreur lors de l'enregistrement des contenus : " + error.message };
  }

  const contentBlockCountByType: Record<string, number> = {};
  for (const b of blockRows) {
    contentBlockCountByType[b.type] = (contentBlockCountByType[b.type] ?? 0) + 1;
  }

  const totalDurationHours = moduleRows.reduce(
    (sum, m) => sum + (m.default_duration_hours ?? 0),
    0
  );

  return {
    modules: moduleRows
      .map((m) => ({ code: m.code, title: m.title, duration_hours: m.default_duration_hours }))
      .sort((a, b) => a.code.localeCompare(b.code)),
    contentBlockCountByType,
    totalDurationHours,
    firedRuleCount: result.firedRuleIds.length,
  };
}
