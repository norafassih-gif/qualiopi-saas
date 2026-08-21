import { redirect } from "next/navigation";
import { requireActiveSubscription } from "@/lib/actions/billing";
import { getEvaluationAttemptResult } from "@/lib/actions/evaluation";
import { EVALUATION_PHASE_LABELS, EVALUATION_PHASE_DOCUMENT_TEMPLATE } from "@/lib/engine/evaluation-phases";

export default async function EvaluationResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  // Paiement obligatoire avant d'utiliser le logiciel (décision de Nora, 21/08/2026).
  await requireActiveSubscription();

  const { attemptId } = await params;
  const result = await getEvaluationAttemptResult(attemptId);

  if ("error" in result) {
    redirect("/evaluation");
  }

  const documentTemplateId = EVALUATION_PHASE_DOCUMENT_TEMPLATE[result.phase];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Résultat — {EVALUATION_PHASE_LABELS[result.phase]}</h1>
      <p className="mb-6 text-sm text-gray-600">Résultat immédiat, auto-correction — seuil de réussite : 70 %.</p>

      <div
        className={`rounded-lg border p-5 ${
          result.passed ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
        }`}
      >
        <p className="text-3xl font-bold">
          {result.scoreRaw} / {result.scoreMax}
        </p>
        <p className="mt-1 text-sm text-gray-700">
          Soit {result.scoreOn20} / 20 — {result.scorePercent} %
        </p>
        <p className={`mt-2 text-sm font-medium ${result.passed ? "text-green-700" : "text-amber-700"}`}>
          {result.passed ? "✅ Acquis (≥ 70 %)" : "⚠️ Non acquis (< 70 %) — à retravailler"}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {result.details.map((d, i) => (
          <div
            key={d.question_id}
            className={`rounded-md border px-4 py-3 text-sm ${
              d.is_correct ? "border-gray-200" : "border-red-200 bg-red-50"
            }`}
          >
            <p className="font-medium text-gray-900">
              {i + 1}. {d.question_text}
            </p>
            <p className="mt-1 text-gray-600">
              Votre réponse : {d.selected_label ?? "(aucune)"} {d.is_correct ? "✅" : "❌"}
            </p>
            {!d.is_correct && <p className="text-gray-600">Bonne réponse : {d.correct_label}</p>}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        {/* Lien de téléchargement de fichier (pas une page interne) : <a> natif est volontaire ici, pas next/link — même convention que app/(app)/documents/page.tsx. Le modèle de document dépend du moment (positionnement/en_cours/finale, migration 0027) ; href dynamique, donc pas flagué par no-html-link-for-pages (même heuristique que documents/page.tsx). */}
        <a
          href={`/api/documents/${documentTemplateId}`}
          className="rounded-md bg-blue-900 px-4 py-2 text-sm text-white"
        >
          Télécharger le résultat en PDF
        </a>
        <a href="/evaluation" className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700">
          Repasser le QCM
        </a>
        <a href="/dashboard" className="px-4 py-2 text-sm text-blue-900 underline">
          ← Retour au tableau de bord
        </a>
      </div>
    </div>
  );
}
