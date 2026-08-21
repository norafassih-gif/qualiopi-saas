import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { requireActiveSubscription } from "@/lib/actions/billing";
import { getMyFirstTraining } from "@/lib/actions/training";
import { listCategoryQuestions, getMyAnswers } from "@/lib/actions/questions";
import { OnboardingThemesForm } from "./form";

export default async function OnboardingThemesPage() {
  // Paiement obligatoire avant d'utiliser le logiciel (décision de Nora, 21/08/2026).
  await requireActiveSubscription();

  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }

  const training = await getMyFirstTraining();
  if (!training) {
    redirect("/onboarding/activite");
  }

  const questions = await listCategoryQuestions(training.category_id, "activite");

  // Catégorie sans banque de contenu importée pour l'instant : rien à
  // cocher, on ne bloque pas l'utilisateur (cf. arbre de questions
  // conditionnelles, point 9 de la conception).
  if (questions.length === 0) {
    redirect("/dashboard");
  }

  const answers = await getMyAnswers(training.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Contenu de ma formation</h1>
      <p className="mb-6 text-sm text-gray-600">
        Formation : <span className="font-medium">{training.name}</span>.
        Cochez les sujets concernés : le logiciel construira automatiquement
        votre programme, vos objectifs pédagogiques et vos documents à partir
        de ces choix — sans aucune IA, uniquement à partir de notre banque de
        contenus.
      </p>
      <OnboardingThemesForm questions={questions} answers={answers} />
    </div>
  );
}
