import Link from "next/link";

export function MarketingHero() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="pb-12 text-center md:pb-16">
            <h1 className="animate-gradient bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-5 text-4xl font-semibold text-transparent md:text-5xl">
              Votre organisme de formation, certifié Qualiopi sans prise de tête
            </h1>
            <div className="mx-auto max-w-2xl">
              <p className="mb-8 text-lg text-indigo-200/65 md:text-xl">
                Répondez à des questions simples : le logiciel construit automatiquement votre
                programme de formation et génère tous les documents de votre dossier, prêts pour
                l&apos;audit.
              </p>
              <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
                <div>
                  <Link
                    href="/signup"
                    className="mb-4 flex w-full items-center justify-center rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 sm:mb-0 sm:w-auto"
                  >
                    Créer mon compte
                  </Link>
                </div>
                <div>
                  <Link
                    href="/login"
                    className="flex w-full items-center justify-center rounded-lg border border-gray-700 px-6 py-3 text-sm font-semibold text-gray-300 transition hover:border-gray-500 hover:text-white sm:ml-4 sm:w-auto"
                  >
                    Se connecter
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
