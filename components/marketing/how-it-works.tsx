import { Building2, ListTree, FileDown } from "lucide-react";
import { Spotlight } from "./spotlight";

const STEPS = [
  {
    icon: Building2,
    tag: "Étape 1",
    title: "Renseignez votre organisme",
    description:
      "Nom, SIRET, coordonnées, logo : vos informations sont enregistrées une fois pour toutes et réutilisées automatiquement dans chaque document.",
  },
  {
    icon: ListTree,
    tag: "Étape 2",
    title: "Choisissez votre domaine de formation",
    description:
      "Langues, community management, management, vente, RH... le logiciel adapte automatiquement les objectifs, modules et évaluations à votre spécialité.",
  },
  {
    icon: FileDown,
    tag: "Étape 3",
    title: "Téléchargez vos documents",
    description:
      "Programme, convention, feuilles d'émargement, procédures qualité... générés automatiquement et classés, prêts à présenter à votre auditeur.",
  },
];

export function HowItWorks() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 md:pb-20">
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-16">
            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
              <span className="bg-linear-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
                Comment ça marche
              </span>
            </div>
            <h2 className="pb-4 text-3xl font-semibold text-gray-100 md:text-4xl">
              De l&apos;idée au dossier Qualiopi, en 3 étapes
            </h2>
            <p className="text-lg text-indigo-200/65">
              Un parcours guidé, pensé pour les personnes qui créent leur organisme de formation
              — aucune connaissance de Qualiopi requise.
            </p>
          </div>

          <Spotlight className="group mx-auto grid max-w-sm items-start gap-6 lg:max-w-none lg:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.tag}
                className="group/card relative h-full overflow-hidden rounded-2xl bg-gray-800 p-px before:pointer-events-none before:absolute before:-left-40 before:-top-40 before:z-10 before:h-80 before:w-80 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:rounded-full before:bg-indigo-500/80 before:opacity-0 before:blur-3xl before:transition-opacity before:duration-500 group-hover:before:opacity-100"
              >
                <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-gray-950 p-6 after:pointer-events-none after:absolute after:inset-0 after:bg-linear-to-br after:from-gray-900/50 after:via-gray-800/25 after:to-gray-900/50">
                  <div className="relative">
                    <step.icon className="mb-4 h-8 w-8 text-indigo-400" aria-hidden="true" />
                    <div className="mb-2">
                      <span className="rounded-full bg-gray-800/60 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
                        {step.tag}
                      </span>
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-gray-100">{step.title}</h3>
                    <p className="text-indigo-200/65">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </Spotlight>
        </div>
      </div>
    </section>
  );
}
