import Link from "next/link";

export function MarketingCta() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="bg-linear-to-r from-transparent via-gray-800/50 py-12 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="pb-8 text-3xl font-semibold text-gray-100 md:text-4xl">
              Prêt à créer votre organisme de formation ?
            </h2>
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
    </section>
  );
}
