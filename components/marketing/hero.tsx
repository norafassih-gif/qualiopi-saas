import Link from "next/link";
import { Reveal } from "./reveal";
import { Glow } from "./glow";
import { ParticleSphere } from "./particle-sphere";

export function MarketingHero() {
  return (
    <section className="relative">
      <Glow />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-16 md:py-24">
          <div className="pb-12 text-center md:pb-16">
            <Reveal>
              <span className="inline-flex items-center gap-3 pb-5 text-sm text-indigo-200/65 before:h-px before:w-6 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-6 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
                Sans IA, sans jargon Qualiopi
              </span>
            </Reveal>

            <Reveal delay={120}>
              <h1 className="pb-6 text-5xl leading-none tracking-tight md:text-7xl">
                <span className="animate-gradient bg-[linear-gradient(to_right,var(--color-indigo-300),var(--color-gray-50),var(--color-indigo-400),var(--color-gray-50))] bg-[length:200%_auto] bg-clip-text font-extrabold text-transparent">
                  Qualiopi
                </span>{" "}
                <span className="relative inline-block">
                  <ParticleSphere size={200} />
                  <span className="relative z-10 font-extralight text-gray-400">Pilote</span>
                </span>
              </h1>
            </Reveal>

            <Reveal delay={240}>
              <p className="mx-auto max-w-2xl text-xl font-medium text-gray-200 md:text-2xl">
                Votre organisme de formation, certifié Qualiopi sans prise de tête.
              </p>
            </Reveal>

            <Reveal delay={360}>
              <div className="mx-auto max-w-2xl">
                <p className="mb-8 mt-4 text-lg text-indigo-200/65">
                  Répondez à des questions simples : le logiciel construit automatiquement votre
                  programme de formation et génère tous les documents de votre dossier, prêts pour
                  l&apos;audit.
                </p>
              </div>
            </Reveal>

            <Reveal delay={480}>
              <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
                <div>
                  <Link
                    href="/signup"
                    className="mb-4 flex w-full items-center justify-center rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-105 hover:bg-indigo-400 sm:mb-0 sm:w-auto"
                  >
                    Créer mon compte
                  </Link>
                </div>
                <div>
                  <Link
                    href="/login"
                    className="flex w-full items-center justify-center rounded-lg border border-gray-700 px-6 py-3 text-sm font-semibold text-gray-300 transition duration-300 hover:scale-105 hover:border-gray-500 hover:text-white sm:ml-4 sm:w-auto"
                  >
                    Se connecter
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
