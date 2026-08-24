import { redirect } from "next/navigation";
import { getMyFirstTraining, listTrainingCategories } from "@/lib/actions/training";
import { FormationSettingsForm } from "./form";

/**
 * "Ma formation" n'était éditable qu'une seule fois, à l'onboarding
 * (createTraining) : aucune page ne permettait de corriger ensuite le nom,
 * la durée, la modalité ou le public visé (target_audience) — bug remonté
 * par Nora le 23/08/2026 ("je n'arrive pas à modifier que l'apprenant n'est
 * pas demandeur d'emploi"). Le domaine de formation n'est volontairement
 * pas modifiable ici (cf. lib/actions/training.ts, updateTraining).
 */
export default async function ParametresFormationPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const training = await getMyFirstTraining();
  if (!training) {
    redirect("/onboarding/activite");
  }
  const categories = await listTrainingCategories();
  const category = categories.find((c) => c.id === training.category_id);
  const { saved } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Ma formation</h1>
      <p className="mb-6 text-sm text-gray-600">
        Le nom, la durée, la modalité et le public visé de votre formation —
        repris dans vos documents (programme, convention, convocation...).
        {category && (
          <>
            {" "}
            Domaine : <span className="font-medium">{category.label}</span>{" "}
            (non modifiable ici).
          </>
        )}
      </p>
      {saved === "1" && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Enregistré. Vos prochains documents générés utiliseront ces informations.
        </div>
      )}
      <FormationSettingsForm training={training} />
      <a href="/dashboard" className="mt-6 inline-block text-sm text-blue-900 underline">
        ← Retour au tableau de bord
      </a>
    </div>
  );
}
