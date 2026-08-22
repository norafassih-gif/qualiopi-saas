import Link from "next/link";
import { Reveal } from "./reveal";

export function MarketingCta() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="bg-linear-to-r from-transparent via-indigo-50/70 py-12 md:py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="pb-8 text-3xl text-gray-900 md:text-4xl">
              <span className="font-extrabold">Prêt à créer</span>{" "}
              <span className="font-light text-gray-500">votre organisme de formation ?</span>
            </h2>
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
                  className="flex w-full items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-600 transition duration-300 hover:scale-105 hover:border-gray-400 hover:text-gray-900 sm:ml-4 sm:w-auto"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
