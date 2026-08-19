import Link from "next/link";
import { Reveal } from "./reveal";
import { Glow } from "./glow";
import { ParticleSphere } from "./particle-sphere";
import { BulgeLetter } from "./bulge-letter";

const QUALIOPI_LETTERS = "Qualiopi".split("");
const PILOTE_LETTERS = "Pilote".split("");

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
                {/* Boîte ajustée exactement à la largeur du texte (inline-block) :
                    la sphère qui traverse de 0 % à 100 % suit ainsi précisément
                    "Qualiopi Pilote", du Q jusqu'au e final. */}
                <span className="relative inline-block">
                  <div className="absolute top-1/2 -translate-y-1/2 animate-sphere-travel motion-reduce:hidden">
                    <ParticleSphere size={110} />
                  </div>

                  <span className="relative z-10 animate-gradient bg-[linear-gradient(to_right,var(--color-indigo-300),var(--color-gray-50),var(--color-indigo-400),var(--color-gray-50))] bg-[length:200%_auto] bg-clip-text font-extrabold text-transparent">
                    {QUALIOPI_LETTERS.map((letter, i) => (
                      <BulgeLetter key={`q-${i}`} index={i}>
                        {letter}
                      </BulgeLetter>
                    ))}
                  </span>{" "}
                  <span className="relative z-10 font-extralight text-gray-400">
                    {PILOTE_LETTERS.map((letter, i) => (
                      <BulgeLetter key={`p-${i}`} index={QUALIOPI_LETTERS.length + i}>
                        {letter}
                      </BulgeLetter>
                    ))}
                  </span>
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
