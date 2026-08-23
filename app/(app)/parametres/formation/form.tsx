"use client";

import { useActionState, useState } from "react";
import { updateTraining, type UpdateTrainingFormState, type Training } from "@/lib/actions/training";

const initialState: UpdateTrainingFormState = { error: null };

const DURATION_PRESETS = [7, 14, 21, 28, 35];

const MODALITIES = [
  { value: "presentiel", label: "Présentiel" },
  { value: "distanciel", label: "Distanciel" },
  { value: "hybride", label: "Hybride" },
];

const AUDIENCES = [
  "Salariés",
  "Entrepreneurs",
  "Demandeurs d'emploi",
  "Particuliers",
  "Managers",
  "Commerciaux",
  "Autres profils",
];

export function FormationSettingsForm({ training }: { training: Training }) {
  const [state, formAction, pending] = useActionState(updateTraining, initialState);
  const presetDuration =
    training.duration_hours && DURATION_PRESETS.includes(training.duration_hours)
      ? String(training.duration_hours)
      : training.duration_hours
      ? "autre"
      : "14";
  const [durationChoice, setDurationChoice] = useState<string>(presetDuration);
  const [customDuration, setCustomDuration] = useState<string>(
    presetDuration === "autre" ? String(training.duration_hours ?? "") : ""
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Nom de la formation */}
      <label className="flex flex-col gap-1 text-sm">
        Nom de la formation
        <input
          type="text"
          name="name"
          required
          defaultValue={training.name}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </label>

      {/* Durée */}
      <div>
        <p className="mb-2 text-sm font-medium">Durée</p>
        <div className="flex flex-wrap gap-2">
          {DURATION_PRESETS.map((h) => (
            <label
              key={h}
              className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${
                durationChoice === String(h)
                  ? "border-blue-900 bg-blue-50 font-medium"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="duration_preset"
                value={h}
                checked={durationChoice === String(h)}
                onChange={() => setDurationChoice(String(h))}
                className="sr-only"
              />
              {h} heures
            </label>
          ))}
          <label
            className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${
              durationChoice === "autre"
                ? "border-blue-900 bg-blue-50 font-medium"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="duration_preset"
              value="autre"
              checked={durationChoice === "autre"}
              onChange={() => setDurationChoice("autre")}
              className="sr-only"
            />
            Autre
          </label>
        </div>
        {durationChoice === "autre" && (
          <input
            type="number"
            min={1}
            placeholder="Nombre d'heures"
            value={customDuration}
            onChange={(e) => setCustomDuration(e.target.value)}
            className="mt-2 w-40 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        )}
        <input
          type="hidden"
          name="duration_hours"
          value={durationChoice === "autre" ? customDuration : durationChoice}
        />
      </div>

      {/* Modalité */}
      <div>
        <p className="mb-2 text-sm font-medium">Modalité</p>
        <div className="flex gap-2">
          {MODALITIES.map((m) => (
            <label
              key={m.value}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 has-[:checked]:border-blue-900 has-[:checked]:bg-blue-50 has-[:checked]:font-medium"
            >
              <input
                type="radio"
                name="modality"
                value={m.value}
                required
                defaultChecked={training.modality === m.value}
              />
              {m.label}
            </label>
          ))}
        </div>
      </div>

      {/* Public */}
      <div>
        <p className="mb-2 text-sm font-medium">Public visé</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AUDIENCES.map((a) => (
            <label
              key={a}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 has-[:checked]:border-blue-900 has-[:checked]:bg-blue-50"
            >
              <input
                type="checkbox"
                name="target_audience"
                value={a}
                defaultChecked={training.target_audience?.includes(a)}
              />
              {a}
            </label>
          ))}
        </div>
      </div>

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
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
