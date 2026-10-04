import Link from "next/link";
import { TRAINER_SATISFACTION_CRITERIA } from "@/lib/engine/trainer-satisfaction-criteria";
import {
  listTrainerSatisfactionResponses,
  addTrainerSatisfactionResponse,
  deleteTrainerSatisfactionResponse,
} from "@/lib/actions/trainer-satisfaction";
import { getMyFirstSession } from "@/lib/actions/session";

export const dynamic = "force-dynamic";

const SCALE = [
  { value: 1, label: "1 — Pas du tout" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5 — Tout à fait" },
];

function average(values: Array<number | null>) {
  const kept = values.filter((v): v is number => typeof v === "number");
  if (kept.length === 0) return null;
  return Math.round((kept.reduce((a, b) => a + b, 0) / kept.length) * 10) / 10;
}

function RadioRow({ name, values }: { name: string; values: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-700">
      {values.map((value) => (
        <label key={value} className="flex items-center gap-1.5">
          <input type="radio" name={name} value={value} />
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </label>
      ))}
    </div>
  );
}

export default async function TrainerSatisfactionPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [responses, session] = await Promise.all([
    listTrainerSatisfactionResponses(),
    getMyFirstSession(),
  ]);

  const globalAverage = average(
    responses.flatMap((r) =>
      TRAINER_SATISFACTION_CRITERIA.map((c) => (typeof r[c.key] === "number" ? (r[c.key] as number) : null))
    )
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Satisfaction du formateur</h1>
      <p className="mt-1 text-sm text-gray-600">
        Après chaque session, recueillez l&apos;avis du formateur ou de l&apos;intervenant sur les conditions
        de la formation. Qualiopi l&apos;exige (indicateur 30 : appréciation des équipes pédagogiques).
        Ses réponses alimentent le document « Questionnaire de satisfaction formateur ».
      </p>
      <p className="mt-2 text-sm">
        <Link href="/conformite/satisfaction" className="text-blue-700 hover:underline">
          Voir les questionnaires des bénéficiaires →
        </Link>
      </p>

      {params.saved ? (
        <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">Réponses enregistrées.</p>
      ) : null}
      {params.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          L&apos;enregistrement a échoué. Réessayez.
        </p>
      ) : null}

      {globalAverage !== null ? (
        <p className="mt-4 rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-800">
          Satisfaction moyenne des formateurs : <strong>{globalAverage} / 5</strong> sur {responses.length}{" "}
          questionnaire{responses.length > 1 ? "s" : ""}.
        </p>
      ) : null}

      <form action={addTrainerSatisfactionResponse} className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-medium text-gray-900">Nouveau questionnaire</h2>

        <div className="mt-4 flex flex-wrap gap-6">
          <label className="block text-sm">
            <span className="text-gray-700">Nom du formateur</span>
            <input
              type="text"
              name="trainer_name"
              defaultValue={session?.trainer_name ?? ""}
              className="mt-1 w-64 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-gray-700">Date de réponse</span>
            <input
              type="date"
              name="answered_on"
              className="mt-1 w-48 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-5 space-y-4">
          {TRAINER_SATISFACTION_CRITERIA.map((criterion) => (
            <fieldset key={criterion.key} className="border-t border-gray-100 pt-3">
              <legend className="text-sm text-gray-800">{criterion.label}</legend>
              <div className="mt-2 flex flex-wrap gap-4">
                {SCALE.map((option) => (
                  <label key={option.value} className="flex items-center gap-1.5 text-sm text-gray-700">
                    <input type="radio" name={criterion.key} value={option.value} />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-6 space-y-4 border-t border-gray-100 pt-4">
          <fieldset>
            <legend className="text-sm text-gray-800">Les objectifs pédagogiques ont-ils été atteints ?</legend>
            <RadioRow name="objectifs_atteints" values={["oui", "non", "partiellement"]} />
          </fieldset>
          <fieldset>
            <legend className="text-sm text-gray-800">Souhaitez-vous intervenir à nouveau pour notre organisme ?</legend>
            <RadioRow name="reintervenir" values={["oui", "non"]} />
          </fieldset>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="text-gray-700">Difficultés rencontrées</span>
            <textarea name="difficultes" rows={3} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-gray-700">Suggestions d&apos;amélioration</span>
            <textarea name="suggestions" rows={3} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-gray-700">Commentaire libre</span>
            <textarea name="commentaire_libre" rows={3} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </label>
        </div>

        <button type="submit" className="mt-5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Enregistrer les réponses
        </button>
      </form>

      <div className="mt-8 space-y-3">
        {responses.map((response) => {
          const moyenne = average(
            TRAINER_SATISFACTION_CRITERIA.map((c) =>
              typeof response[c.key] === "number" ? (response[c.key] as number) : null
            )
          );
          return (
            <div key={response.id} className="flex items-start justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
              <div className="text-sm text-gray-800">
                <p>
                  <span className="font-medium">{response.answered_on}</span>
                  {response.trainer_name ? <> — {response.trainer_name}</> : null}
                  {moyenne !== null ? <> — moyenne {moyenne} / 5</> : null}
                </p>
                {response.difficultes ? (
                  <p className="mt-1 text-xs text-gray-600">Difficultés : {response.difficultes}</p>
                ) : null}
                {response.suggestions ? (
                  <p className="text-xs text-gray-600">Suggestions : {response.suggestions}</p>
                ) : null}
              </div>
              <form action={deleteTrainerSatisfactionResponse}>
                <input type="hidden" name="id" value={response.id} />
                <button type="submit" className="text-xs text-gray-400 hover:text-red-600">Supprimer</button>
              </form>
            </div>
          );
        })}

        {responses.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
            Aucun questionnaire formateur enregistré pour l&apos;instant.
          </p>
        ) : null}
      </div>
    </div>
  );
}
