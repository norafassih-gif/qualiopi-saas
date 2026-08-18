import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstTraining } from "@/lib/actions/training";
import { getMyFirstSession } from "@/lib/actions/session";
import { listCategoryQuestions, getMyAnswers } from "@/lib/actions/questions";
import { signOut } from "@/lib/actions/auth";

export default async function DashboardPage() {
  const org = await getMyOrganization();

  // Pas encore d'organisme -> onboarding (parcours prioritaire, point 2 de la conception).
  if (!org) {
    redirect("/onboarding/entreprise");
  }

  const training = await getMyFirstTraining();
  const session = training ? await getMyFirstSession() : null;

  // Thématiques pédagogiques : seulement pour les catégories dont la banque
  // de contenu a été importée (Community Management pour l'instant) — les
  // autres n'ont simplement aucune question ici, donc rien à afficher.
  const themeQuestions = training
    ? await listCategoryQuestions(training.category_id, "activite")
    : [];
  const themeAnswers = training && themeQuestions.length > 0 ? await getMyAnswers(training.id) : {};
  const themesAnswered =
    themeQuestions.length > 0 && themeQuestions.every((q) => themeAnswers[q.id] !== undefined);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bonjour</h1>
          <p className="text-gray-600">{org.company_name}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm text-gray-500 underline">
            Se déconnecter
          </button>
        </form>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Organisme</p>
          <p className="mt-1 font-medium">{org.company_name}</p>
          <p className="text-sm text-green-700">✅ Créé</p>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Ma formation</p>
          {training ? (
            <>
              <p className="mt-1 font-medium">{training.name}</p>
              <p className="text-sm text-green-700">✅ Créée</p>
              {themeQuestions.length > 0 && (
                <p className="mt-1 text-sm">
                  {themesAnswered ? (
                    <span className="text-green-700">✅ Thématiques choisies</span>
                  ) : (
                    <a href="/onboarding/themes" className="text-blue-900 underline">
                      ⚠️ Choisir mes thématiques →
                    </a>
                  )}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-gray-600">Pas encore créée</p>
              <a href="/onboarding/activite" className="text-sm text-blue-900 underline">
                Créer ma formation →
              </a>
            </>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Ma session</p>
          {session ? (
            <>
              <p className="mt-1 font-medium">
                {session.start_date} → {session.end_date}
              </p>
              <p className="text-sm text-green-700">✅ Créée</p>
            </>
          ) : training ? (
            <>
              <p className="mt-1 text-sm text-gray-600">Pas encore créée</p>
              <a href="/onboarding/session" className="text-sm text-blue-900 underline">
                Créer ma session →
              </a>
            </>
          ) : (
            <p className="mt-1 text-sm text-gray-400">En attente de la formation</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-600">
          {!training
            ? "Étape suivante : choisir votre domaine de formation puis créer votre première formation."
            : themeQuestions.length > 0 && !themesAnswered
            ? "Étape suivante : choisir les thématiques de votre formation pour construire automatiquement votre programme."
            : !session
            ? "Étape suivante : renseigner votre première session (bénéficiaire, dates, formateur)."
            : "Votre programme de formation peut être généré automatiquement à partir de vos réponses."}
        </p>
        {training && (!themeQuestions.length || themesAnswered) && session && (
          <a href="/onboarding/programme" className="mt-2 inline-block text-sm text-blue-900 underline">
            Voir mon programme de formation →
          </a>
        )}
      </div>

      {training && session && (
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a href="/documents" className="text-blue-900 underline">
            📄 Mes documents →
          </a>
          <a href="/parametres/qualite" className="text-blue-900 underline">
            ⚙️ Mes informations qualité →
          </a>
          <a href="/evaluation" className="text-blue-900 underline">
            📝 Évaluation des acquis →
          </a>
          <a href="/parametres/identite-visuelle" className="text-blue-900 underline">
            🎨 Identité visuelle →
          </a>
        </div>
      )}
    </div>
  );
}
