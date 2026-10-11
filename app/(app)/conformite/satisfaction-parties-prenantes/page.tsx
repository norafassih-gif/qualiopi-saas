import Link from "next/link";
import {
  STAKEHOLDER_CRITERIA,
  STAKEHOLDER_LABELS,
  STAKEHOLDER_QUESTIONS,
  isStakeholderKind,
  type StakeholderKind,
} from "@/lib/engine/stakeholder-satisfaction-criteria";
import {
  listStakeholderResponses,
  addStakeholderResponse,
  deleteStakeholderResponse,
} from "@/lib/actions/stakeholder-satisfaction";

export const dynamic = "force-dynamic";

const SCALE = [
  { value: 1, label: "1 — Pas du tout" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5 — Tout à fait" },
];

function average(values: number[]) {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export default async function StakeholderSatisfactionPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const kind: StakeholderKind = isStakeholderKind(params.type) ? params.type : "financeur";
  const labels = STAKEHOLDER_LABELS[kind];
  const criteria = STAKEHOLDER_CRITERIA[kind];
  const questions = STAKEHOLDER_QUESTIONS[kind];
  const all = await listStakeholderResponses();
  const responses = all.filter((r) => r.kind === kind);

  const globalAverage = average(
    responses.flatMap((r) => criteria.map((c) => r.scores?.[c.key]).filter((v): v is number => typeof v === "number"))
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Satisfaction des financeurs et des entreprises</h1>
      <p className="mt-1 text-sm text-gray-600">
        Qualiopi (indicateur 30) demande de recueillir l&apos;appréciation de toutes les parties prenantes.
        Saisissez ici l&apos;avis du financeur ou de l&apos;entreprise : ses réponses alimentent le document
        « Questionnaire de satisfaction {kind} ».
      </p>

      <div className="mt-4 flex gap-2 text-sm">
        {(["financeur", "entreprise"] as const).map((k) => (
          <Link
            key={k}
            href={"/conformite/satisfaction-parties-prenantes?type=" + k}
            className={
              "rounded-md border px-3 py-1.5 " +
              (k === kind ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50")
            }
          >
            {STAKEHOLDER_LABELS[k].title}
          </Link>
        ))}
      </div>

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
          Satisfaction moyenne ({labels.title.toLowerCase()}) : <strong>{globalAverage} / 5</strong> sur{" "}
          {responses.length} questionnaire{responses.length > 1 ? "s" : ""}.
        </p>
      ) : null}

      <form action={addStakeholderResponse} className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <input type="hidden" name="kind" value={kind} />
        <h2 className="text-lg font-medium text-gray-900">Nouveau questionnaire {labels.title.toLowerCase()}</h2>

        <div className="mt-4 flex flex-wrap gap-6">
          <label className="block text-sm">
            <span className="text-gray-700">{labels.respondent}</span>
            <input type="text" name="respondent_name" className="mt-1 w-64 rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-gray-700">Nom et fonction du répondant</span>
            <input type="text" name="respondent_role" className="mt-1 w-64 rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-gray-700">Date de réponse</span>
            <input type="date" name="answered_on" className="mt-1 w-48 rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </label>
        </div>

        <div className="mt-5 space-y-4">
          {criteria.map((criterion) => (
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
          {questions.map((question) => (
            <fieldset key={question.field}>
              <legend className="text-sm text-gray-800">{question.label}</legend>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-700">
                {question.values.map((value) => (
                  <label key={value} className="flex items-center gap-1.5">
                    <input type="radio" name={question.field} value={value} />
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <label className="mt-6 block text-sm">
          <span className="text-gray-700">Libre expression (remarques, suggestions, points à améliorer)</span>
          <textarea name="commentaire_libre" rows={4} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </label>

        <button type="submit" className="mt-5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Enregistrer les réponses
        </button>
      </form>

      <div className="mt-8 space-y-3">
        {responses.map((response) => {
          const moyenne = average(
            criteria.map((c) => response.scores?.[c.key]).filter((v): v is number => typeof v === "number")
          );
          return (
            <div key={response.id} className="flex items-start justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
              <div className="text-sm text-gray-800">
                <p>
                  <span className="font-medium">{response.answered_on}</span>
                  {response.respondent_name ? <> — {response.respondent_name}</> : null}
                  {moyenne !== null ? <> — moyenne {moyenne} / 5</> : null}
                </p>
                {response.commentaire_libre ? (
                  <p className="mt-1 text-xs text-gray-600">{response.commentaire_libre}</p>
                ) : null}
              </div>
              <form action={deleteStakeholderResponse}>
                <input type="hidden" name="id" value={response.id} />
                <input type="hidden" name="kind" value={kind} />
                <button type="submit" className="text-xs text-gray-400 hover:text-red-600">Supprimer</button>
              </form>
            </div>
          );
        })}
        {responses.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
            Aucun questionnaire {labels.title.toLowerCase()} enregistré pour l&apos;instant.
          </p>
        ) : null}
      </div>
    </div>
  );
}
