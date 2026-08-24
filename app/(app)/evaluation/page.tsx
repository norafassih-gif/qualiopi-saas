import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstTraining } from "@/lib/actions/training";
import { getEvaluationBankForMyTraining } from "@/lib/actions/evaluation";
import {
  EVALUATION_PHASES,
  EVALUATION_PHASE_LABELS,
  EVALUATION_PHASE_DESCRIPTIONS,
  isEvaluationPhase,
  type EvaluationPhase,
} from "@/lib/engine/evaluation-phases";
import { EvaluationForm } from "./form";

export default async function EvaluationPage({
  searchParams,
}: {
  searchParams: Promise<{ phase?: string }>;
}) {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }
  const training = await getMyFirstTraining();
  if (!training) {
    redirect("/onboarding/activite");
  }

  const { phase: phaseParam } = await searchParams;
  const phase: EvaluationPhase | null = isEvaluationPhase(phaseParam) ? phaseParam : null;

  // Étape 1 : pas encore de moment choisi — le référentiel Qualiopi attend
  // une évaluation à 3 moments distincts (positionnement à l'entrée,
  // pendant, et en fin de formation — indicateurs 8 et 11). On demande donc
  // lequel avant d'afficher le questionnaire, plutôt que de sous-entendre
  // qu'il s'agit toujours d'une évaluation finale.
  if (!phase) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-1 text-2xl font-bold">Évaluation des acquis</h1>
        <p className="mb-6 text-sm text-gray-600">
          Le référentiel Qualiopi attend une évaluation à trois moments distincts.
          Choisissez lequel vous souhaitez faire passer maintenant — la même banque
          de questions sert aux trois, seul le document généré change.
        </p>

        <div className="flex flex-col gap-3">
          {EVALUATION_PHASES.map((p) => (
            <a
              key={p}
              href={`/evaluation?phase=${p}`}
              className="rounded-lg border border-gray-200 px-4 py-4 hover:border-blue-900"
            >
              <p className="text-sm font-semibold text-gray-900">{EVALUATION_PHASE_LABELS[p]}</p>
              <p className="mt-1 text-xs text-gray-600">{EVALUATION_PHASE_DESCRIPTIONS[p]}</p>
            </a>
          ))}
        </div>

        <a href="/dashboard" className="mt-8 inline-block text-sm text-blue-900 underline">
          ← Retour au tableau de bord
        </a>
      </div>
    );
  }

  const bank = await getEvaluationBankForMyTraining();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">{EVALUATION_PHASE_LABELS[phase]}</h1>
      <p className="mb-6 text-sm text-gray-600">
        Questionnaire à choix multiples, corrigé automatiquement par notre banque de
        questions — sans intelligence artificielle. Résultat immédiat, seuil de
        réussite : 70 %.
      </p>

      {"error" in bank ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{bank.error}</p>
      ) : bank.questions.length === 0 ? (
        <p className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          Aucun questionnaire n&apos;est encore disponible pour la catégorie «{" "}
          {bank.categoryLabel} ».
        </p>
      ) : (
        <EvaluationForm bank={bank} phase={phase} />
      )}

      <a href="/evaluation" className="mt-8 mr-4 inline-block text-sm text-blue-900 underline">
        ← Changer de moment d&apos;évaluation
      </a>
      <a href="/dashboard" className="mt-8 inline-block text-sm text-blue-900 underline">
        ← Retour au tableau de bord
      </a>
    </div>
  );
}
