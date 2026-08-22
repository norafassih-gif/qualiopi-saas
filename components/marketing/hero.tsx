import Link from "next/link";
import { Reveal } from "./reveal";
import { Glow } from "./glow";
import { InteractiveSphereLayer } from "./interactive-sphere-layer";
import { NoiseCtaButton } from "./noise-cta-button";

const PILOTE_LETTERS = "Pilote".split("");

export function MarketingHero() {
  return (
    <section className="relative">
      <Glow />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-16 md:py-24">
          <div className="relative pb-12 text-center md:pb-16">
            <InteractiveSphereLayer />

            <Reveal>
              <span className="inline-flex items-center gap-3 pb-5 text-sm text-gray-600 before:h-px before:w-6 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-6 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
                Sans IA, sans jargon Qualiopi
              </span>
            </Reveal>

            <Reveal delay={120}>
              <h1 className="relative z-10 pb-6 text-5xl leading-none tracking-tight md:text-7xl">
                <span
                  data-sphere-word="qualiopi"
                  className="inline-block animate-gradient bg-[linear-gradient(to_right,var(--color-indigo-600),var(--color-gray-900),var(--color-indigo-500),var(--color-gray-900))] bg-[length:200%_auto] bg-clip-text font-extrabold text-transparent motion-reduce:animate-none"
                >
                  Qualiopi
                </span>{" "}
                <span className="inline-block font-extralight text-gray-500">
                  {PILOTE_LETTERS.map((letter, i) => (
                    <span key={i} data-sphere-letter className="inline-block">
                      {letter}
                    </span>
                  ))}
                </span>
              </h1>
            </Reveal>

            <Reveal delay={240}>
              <p className="mx-auto max-w-2xl text-xl font-medium text-gray-700 md:text-2xl">
                Votre organisme de formation, certifié Qualiopi sans prise de tête.
              </p>
            </Reveal>

            <Reveal delay={360}>
              <div className="mx-auto max-w-2xl">
                <p className="mb-8 mt-4 text-lg text-gray-600">
                  Répondez à des questions simples : le logiciel construit automatiquement votre
                  programme de formation et génère tous les documents de votre dossier, prêts pour
                  l&apos;audit.
                </p>
              </div>
            </Reveal>

            <Reveal delay={480}>
              <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
                <div>
                  <NoiseCtaButton href="/signup" className="mb-4 w-full sm:mb-0 sm:w-auto">
                    Créer mon compte
                  </NoiseCtaButton>
                </div>
                <div>
                  <Link
                    href="/login"
                    className="flex w-full items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-600 transition duration-300 hover:scale-105 hover:border-gray-400 hover:text-gray-900 sm:ml-4 sm:w-auto"
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
