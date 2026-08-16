"use client";

import { useActionState } from "react";
import {
  saveTrainingAnswers,
  type AnswersFormState,
  type QuestionWithOptions,
} from "@/lib/actions/questions";

const initialState: AnswersFormState = { error: null };

function isChecked(answer: unknown, value: string): boolean {
  return Array.isArray(answer) && answer.includes(value);
}

export function OnboardingThemesForm({
  questions,
  answers,
}: {
  questions: QuestionWithOptions[];
  answers: Record<string, unknown>;
}) {
  const [state, formAction, pending] = useActionState(saveTrainingAnswers, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
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
