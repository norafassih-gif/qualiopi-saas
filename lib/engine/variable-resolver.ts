import type { Training } from "@/lib/actions/training";
import type { EngineVariables } from "./types";

// Le formulaire "Mon activité" collecte un public à choix MULTIPLE
// (target_audience), alors que les règles de variante (banque de contenu)
// raisonnent sur une seule valeur `public_type`. On dérive donc une valeur
// unique par ordre de priorité : présence d'un public professionnel
// (salarié/manager/commercial) > entrepreneur > particulier > généraliste
// par défaut. À affiner si on ajoute un jour une vraie question dédiée
// "public_type" dans la banque de contenu plutôt que de la déduire.
const SALARIE_AUDIENCES = new Set(["Salariés", "Managers", "Commerciaux"]);
const ENTREPRISE_AUDIENCES = new Set(["Entrepreneurs"]);
const PARTICULIER_AUDIENCES = new Set(["Particuliers"]);

function resolvePublicType(targetAudience: string[]): string {
  if (targetAudience.some((a) => SALARIE_AUDIENCES.has(a))) return "salaries";
  if (targetAudience.some((a) => ENTREPRISE_AUDIENCES.has(a))) return "entreprise";
  if (targetAudience.some((a) => PARTICULIER_AUDIENCES.has(a))) return "particuliers";
  return "generaliste";
}

/**
 * Construit le contexte de variables du moteur de règles à partir des
 * données déjà connues (organisme/formation) et des réponses aux questions
 * pédagogiques (ex: `cm_themes`). Chaque réponse est exposée sous la clé de
 * la question elle-même (cf. lib/actions/questions.ts — le variable_key des
 * questions importées correspond à leur id).
 */
export function resolveTrainingVariables(
  training: Training,
  answers: Record<string, unknown>
): EngineVariables {
  return {
    training_category: training.category_id,
    training_duration: training.duration_hours ?? 0,
    training_method: training.modality,
    public_type: resolvePublicType(training.target_audience ?? []),
    ...answers,
  };
}
