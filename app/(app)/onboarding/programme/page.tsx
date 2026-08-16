import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstTraining } from "@/lib/actions/training";
import { buildProgramForMyTraining } from "@/lib/engine/program-builder";

const BLOCK_TYPE_LABELS: Record<string, string> = {
  pedagogical_objective: "Objectifs pédagogiques",
  skill: "Compétences visées",
  positioning_question: "Questions de positionnement",
  evaluation_question: "Questions d'évaluation",
  exercise: "Exercices pratiques",
  method: "Méthodes pédagogiques",
  need_example: "Exemples de besoins",
};

export default async function OnboardingProgrammePage() {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }

  const training = await getMyFirstTraining();
  if (!training) {
    redirect("/onboarding/activite");
  }

  // Construit (ou reconstruit) le programme à chaque visite de cette page —
  // opération idempotente et sans IA (moteur de règles uniquement), donc
  // sans risque à relancer si l'utilisateur revient après avoir changé ses
  // thématiques.
  const result = await buildProgramForMyTraining();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Mon programme de formation</h1>
      <p className="mb-6 text-sm text-gray-600">
        Formation : <span className="font-medium">{training.name}</span>.
        Construit automatiquement à partir de vos réponses, sans intelligence
        artificielle — uniquement notre banque de contenus et nos règles
        conditionnelles.
      </p>

      {"error" in result ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {result.error}
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium uppercase text-gray-500">Durée totale du programme généré</p>
            <p className="mt-1 text-lg font-semibold">{result.totalDurationHours} heures</p>
            <p className="mt-1 text-xs text-gray-500">
              {result.firedRuleCount} règle(s) appliquée(s) · {result.modules.length} module(s) ·{" "}
              {Object.values(result.contentBlockCountByType).reduce((a, b) => a + b, 0)} bloc(s)
              de contenu
            </p>
          </div>

          <p className="text-xs text-gray-500">
            La durée déclarée de votre formation est automatiquement mise à jour pour
            correspondre à ce programme — chaque thématique cochée ajoute son propre
            temps, visible en direct sur l&apos;écran précédent.
          </p>

          <div>
            <h2 className="mb-2 text-sm font-semibold">Modules du programme</h2>
            {result.modules.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aucun module généré — vérifiez que vous avez bien coché des thématiques.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {result.modules.map((m) => (
                  <li
                    key={m.code}
                    className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm"
                  >
                    <span>{m.title}</span>
                    {m.duration_hours != null && (
                      <span className="text-xs text-gray-500">{m.duration_hours}h</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold">Contenu inclus</h2>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(result.contentBlockCountByType).map(([type, count]) => (
                <li
                  key={type}
                  className="rounded-md border border-gray-200 px-3 py-2 text-xs text-gray-600"
                >
                  {BLOCK_TYPE_LABELS[type] ?? type} :{" "}
                  <span className="font-medium text-gray-900">{count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            Prochaine étape : générer les documents PDF (programme, convention,
            émargement…) à partir de ce programme — en construction.
          </div>

          <a href="/dashboard" className="text-sm text-blue-900 underline">
            ← Retour au tableau de bord
          </a>
        </div>
      )}
    </div>
  );
}
