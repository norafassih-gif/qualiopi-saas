import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyFirstTraining, saveCustomProgram } from "@/lib/actions/training";
import { getMyFirstSession } from "@/lib/actions/session";
import { getMyOrganization } from "@/lib/actions/organization";
import { CUSTOM_CATEGORY_ID, CUSTOM_LIST_FIELDS, customTotalHours, parseCustomProgram } from "@/lib/engine/custom-program";
import { NSF_BY_CATEGORY } from "@/lib/engine/tracks";

export const dynamic = "force-dynamic";

const MODULE_SLOTS = 12;

// Codes de spécialité (nomenclature NSF) proposés en plus de ceux des
// 10 domaines : les plus fréquents pour les formations sur mesure.
const NSF_SUGGESTIONS = Array.from(
  new Set([
    ...Object.values(NSF_BY_CATEGORY),
    "255 - Électricité, électronique",
    "344 - Sécurité des biens et des personnes, police, surveillance",
    "343 - Nettoyage, assainissement, protection de l'environnement",
    "331 - Santé",
    "332 - Travail social",
    "333 - Enseignement, formation",
    "334 - Accueil, hôtellerie, tourisme",
    "221 - Agro-alimentaire, alimentation, cuisine",
    "311 - Transport, manutention, magasinage",
    "336 - Coiffure, esthétique et autres spécialités des services aux personnes",
    "230 - Spécialités pluritechnologiques génie civil, construction, bois",
    "250 - Spécialités pluritechnologiques mécanique-électricité",
  ])
).sort();

export default async function CustomProgramPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const org = await getMyOrganization();
  if (!org) redirect("/onboarding/parcours");
  const training = await getMyFirstTraining();
  if (!training) redirect("/onboarding/activite");
  if (training.category_id !== CUSTOM_CATEGORY_ID) redirect("/onboarding/programme");

  const session = await getMyFirstSession();
  const cp = parseCustomProgram(training.custom_program);
  const total = customTotalHours(cp);
  const slots = Array.from({ length: Math.max(MODULE_SLOTS, cp.modules.length + 2) }, (_, i) => cp.modules[i] ?? null);
  const nextHref = !session ? "/onboarding/session" : org.current_track === "nda" ? "/nda" : "/documents";
  const nextLabel = !session ? "Continuer : ma première session" : org.current_track === "nda" ? "Retour à ma déclaration" : "Voir mes documents";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Mon programme sur mesure</h1>
      <p className="mt-1 text-sm text-gray-600">
        Formation : <span className="font-medium">{training.name}</span>. Saisissez votre programme une fois :
        il est repris automatiquement dans le programme de formation, la convention, les pièces du dossier
        NDA et les documents Qualiopi. Dans chaque zone, mettez un élément par ligne.
      </p>

      {params.saved ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
          <span>Programme enregistré{total > 0 ? ` (durée totale : ${total} heures)` : ""}.</span>
          <Link href={nextHref} className="font-medium underline">
            {nextLabel}
          </Link>
        </div>
      ) : null}
      {params.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">L&apos;enregistrement a échoué. Réessayez.</p>
      ) : null}

      <form action={saveCustomProgram} className="mt-6 space-y-6">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-medium text-gray-900">Modules du programme</h2>
          <p className="mt-1 text-xs text-gray-500">
            Un module par ligne : titre, durée en heures et contenu détaillé. Les lignes vides sont ignorées.
            La durée de la formation devient la somme des modules.
          </p>
          <div className="mt-4 space-y-3">
            {slots.map((m, i) => (
              <div key={i} className="grid gap-2 rounded-md border border-gray-100 p-3 sm:grid-cols-[1fr_90px]">
                <input
                  name={`module_title_${i}`}
                  defaultValue={m?.title ?? ""}
                  placeholder={`Module ${i + 1} : titre`}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <input
                  name={`module_hours_${i}`}
                  defaultValue={m?.hours ?? ""}
                  placeholder="Heures"
                  inputMode="decimal"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <textarea
                  name={`module_content_${i}`}
                  defaultValue={m?.content ?? ""}
                  placeholder="Contenu détaillé (facultatif)"
                  rows={2}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <label className="block text-sm">
            <span className="font-medium text-gray-900">Prérequis</span>
            <span className="mt-0.5 block text-xs text-gray-500">
              Conditions pour suivre la formation (niveau, habilitation déjà détenue, aptitude médicale...).
            </span>
            <textarea
              name="prerequisites"
              defaultValue={cp.prerequisites}
              rows={3}
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
        </section>

        {CUSTOM_LIST_FIELDS.map((f) => (
          <section key={f.key} className="rounded-lg border border-gray-200 bg-white p-5">
            <label className="block text-sm">
              <span className="font-medium text-gray-900">{f.label}</span>
              <span className="mt-0.5 block text-xs text-gray-500">{f.help} Un élément par ligne.</span>
              <textarea
                name={f.key}
                defaultValue={(cp[f.key] as string[]).join("\n")}
                rows={5}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </section>
        ))}

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <label className="block text-sm">
            <span className="font-medium text-gray-900">Spécialité de formation (code NSF)</span>
            <span className="mt-0.5 block text-xs text-gray-500">
              Demandée par le formulaire de déclaration d&apos;activité. Choisissez dans la liste ou saisissez un
              autre code.
            </span>
            <input
              name="nsf_specialty"
              list="nsf-list"
              defaultValue={training.nsf_specialty ?? ""}
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <datalist id="nsf-list">
              {NSF_SUGGESTIONS.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </label>
        </section>

        <button type="submit" className="rounded-md bg-blue-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800">
          Enregistrer mon programme
        </button>
      </form>
    </div>
  );
}
