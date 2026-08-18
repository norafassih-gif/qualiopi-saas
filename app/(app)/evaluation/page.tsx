import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstTraining } from "@/lib/actions/training";
import { getEvaluationBankForMyTraining } from "@/lib/actions/evaluation";
import { EvaluationForm } from "./form";

export default async function EvaluationPage() {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }
  const training = await getMyFirstTraining();
  if (!training) {
    redirect("/onboarding/activite");
  }

  const bank = await getEvaluationBankForMyTraining();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Évaluation des acquis</h1>
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
          {bank.categoryLabel} ». Pour l&apos;instant, seule la catégorie Community
          Management dispose d&apos;un QCM complet (30 questions).
        </p>
      ) : (
        <EvaluationForm bank={bank} />
      )}

      <a href="/dashboard" className="mt-8 inline-block text-sm text-blue-900 underline">
        ← Retour au tableau de bord
      </a>
    </div>
  );
}
