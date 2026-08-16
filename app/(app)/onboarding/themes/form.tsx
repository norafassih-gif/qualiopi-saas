"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  saveTrainingAnswers,
  type AnswersFormState,
  type QuestionWithOptions,
} from "@/lib/actions/questions";
import {
  previewProgramForAnswers,
  type BuildProgramResult,
} from "@/lib/engine/program-builder";

const initialState: AnswersFormState = { error: null };

function toMultiChoiceArray(answer: unknown): string[] {
  return Array.isArray(answer) ? (answer as string[]) : [];
}

export function OnboardingThemesForm({
  questions,
  answers,
}: {
  questions: QuestionWithOptions[];
  answers: Record<string, unknown>;
}) {
  const [state, formAction, pending] = useActionState(saveTrainingAnswers, initialState);

  // État local piloté par les cases cochées — sert uniquement à calculer
  // l'aperçu de durée en direct ; la sauvegarde réelle se fait toujours via
  // saveTrainingAnswers au clic sur "Continuer" (mêmes noms de champs, donc
  // le FormData du <form> reste la source de vérité pour l'enregistrement).
  const [draftAnswers, setDraftAnswers] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const q of questions) {
      if (q.type === "multi_choice") initial[q.id] = toMultiChoiceArray(answers[q.id]);
      else if (typeof answers[q.id] !== "undefined") initial[q.id] = answers[q.id];
    }
    return initial;
  });

  const [preview, setPreview] = useState<BuildProgramResult | null>(null);
  const [isPreviewPending, startPreviewTransition] = useTransition();

  // Aperçu recalculé en direct à chaque coche/décoche — avec un léger
  // debounce pour ne pas déclencher un aller-retour serveur à chaque clic
  // très rapproché. C'est le moteur de règles réel (mêmes règles que celles
  // appliquées à l'enregistrement), donc ce que vous voyez ici est fiable :
  // chaque thématique "pèse" tout de suite dans le total affiché.
  useEffect(() => {
    const timer = setTimeout(() => {
      startPreviewTransition(async () => {
        const result = await previewProgramForAnswers(draftAnswers);
        setPreview(result);
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(draftAnswers)]);

  function toggleMultiChoice(questionId: string, value: string, checked: boolean) {
    setDraftAnswers((prev) => {
      const current = toMultiChoiceArray(prev[questionId]);
      const next = checked ? [...current, value] : current.filter((v) => v !== value);
      return { ...prev, [questionId]: next };
    });
  }

  function setSingleChoice(questionId: string, value: string) {
    setDraftAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="sticky top-2 z-10 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
        {preview && !("error" in preview) ? (
          <>
            <span className="font-semibold text-blue-900">
              Durée estimée : {preview.totalDurationHours} heure
              {preview.totalDurationHours > 1 ? "s" : ""}
            </span>
            <span className="ml-2 text-xs text-blue-800">
              ({preview.modules.length} module{preview.modules.length > 1 ? "s" : ""}, mis à
              jour à chaque case cochée)
            </span>
          </>
        ) : (
          <span className="text-blue-800">
            {isPreviewPending ? "Calcul de la durée…" : "Cochez des thématiques pour voir la durée s'additionner."}
          </span>
        )}
      </div>

      {questions.map((q) => (
        <div key={q.id}>
          <p className="mb-1 text-sm font-medium">{q.label}</p>
          {q.help_text && <p className="mb-2 text-xs text-gray-500">{q.help_text}</p>}

          {q.type === "multi_choice" && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {q.options.map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 has-[:checked]:border-blue-900 has-[:checked]:bg-blue-50 has-[:checked]:font-medium"
                >
                  <input
                    type="checkbox"
                    name={q.id}
                    value={opt.value}
                    defaultChecked={isChecked(answers[q.id], opt.value)}
                    onChange={(e) => toggleMultiChoice(q.id, opt.value, e.target.checked)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          )}

          {q.type === "single_choice" && (
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 has-[:checked]:border-blue-900 has-[:checked]:bg-blue-50 has-[:checked]:font-medium"
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.value}
                    defaultChecked={answers[q.id] === opt.value}
                    onChange={() => setSingleChoice(q.id, opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          )}

          {(q.type === "text" || q.type === "number") && (
            <input
              type={q.type === "number" ? "number" : "text"}
              name={q.id}
              defaultValue={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          )}
        </div>
      ))}

      {preview && !("error" in preview) && preview.modules.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold">Modules déclenchés par vos choix</h2>
          <ul className="flex flex-col gap-1">
            {preview.modules.map((m) => (
              <li
                key={m.code}
                className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600"
              >
                <span>{m.title}</span>
                {m.duration_hours != null && <span className="font-medium">{m.duration_hours}h</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-blue-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Enregistrement…" : "Continuer"}
      </button>
    </form>
  );
}

function isChecked(answer: unknown, value: string): boolean {
  return Array.isArray(answer) && answer.includes(value);
}
