"use client";

import { useActionState, useMemo } from "react";
import {
  submitEvaluationForm,
  type EvaluationAttemptFormState,
  type EvaluationBank,
} from "@/lib/actions/evaluation";
import type { EvaluationPhase } from "@/lib/engine/evaluation-phases";

const initialState: EvaluationAttemptFormState = { error: null, result: null };

/**
 * Regroupe les questions par thème (Stratégie, Instagram, LinkedIn...) pour
 * l'affichage — même thématisation que le quiz réel de Nora, sans incidence
 * sur la correction (qui se fait question par question, cf.
 * submitEvaluationAttempt).
 */
function groupByTopic(questions: EvaluationBank["questions"]) {
  const groups: { topic: string; questions: EvaluationBank["questions"] }[] = [];
  for (const q of questions) {
    const last = groups[groups.length - 1];
    if (last && last.topic === q.topic) {
      last.questions.push(q);
    } else {
      groups.push({ topic: q.topic, questions: [q] });
    }
  }
  return groups;
}

export function EvaluationForm({ bank, phase }: { bank: EvaluationBank; phase: EvaluationPhase }) {
  const [state, formAction, pending] = useActionState(submitEvaluationForm, initialState);
  const groups = useMemo(() => groupByTopic(bank.questions), [bank.questions]);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {/* Moment d'évaluation choisi sur l'écran précédent (positionnement /
          en_cours / finale) — pas une réponse à une question, isolé côté
          serveur dans submitEvaluationForm avant reconstruction des réponses. */}
      <input type="hidden" name="phase" value={phase} />
      <p className="text-xs text-gray-500">
        {bank.questions.length} questions — {bank.categoryLabel}
      </p>

      {groups.map((group) => (
        <fieldset key={group.topic} className="flex flex-col gap-5 border-t border-gray-200 pt-4">
          <legend className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {group.topic}
          </legend>
          {group.questions.map((q) => (
            <div key={q.id} className="flex flex-col gap-2">
              <p className="text-sm font-medium text-gray-900">
                {bank.questions.indexOf(q) + 1}. {q.question_text}
              </p>
              <div className="flex flex-col gap-1.5 pl-1">
                {q.options.map((o) => (
                  <label key={o.id} className="flex items-center gap-2 text-sm">
                    <input type="radio" name={q.id} value={o.id} required />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </fieldset>
      ))}

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Correction en cours…" : "Voir mon résultat"}
      </button>
    </form>
  );
}
