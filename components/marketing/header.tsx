import Link from "next/link";
import { Logo } from "./logo";

export function MarketingHeader() {
  return (
    <header className="z-30 mt-2 w-full md:mt-5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl border border-gray-800 bg-gray-900/90 px-3 backdrop-blur-xs">
          <div className="flex flex-1 items-center">
            <Logo />
          </div>

          <ul className="hidden items-center gap-2 sm:flex">
            <li>
              <Link
                href="/formations"
                className="rounded-lg px-3 py-[7px] text-sm font-medium text-gray-300 transition hover:text-white"
              >
                Formations
              </Link>
            </li>
            <li>
              <Link
                href="/tarifs"
                className="rounded-lg px-3 py-[7px] text-sm font-medium text-gray-300 transition hover:text-white"
              >
                Tarifs
              </Link>
            </li>
          </ul>

          <ul className="flex flex-1 items-center justify-end gap-3">
            <li>
              <Link
                href="/login"
                className="rounded-lg px-3 py-[7px] text-sm font-medium text-gray-300 transition hover:text-white"
              >
                Se connecter
              </Link>
            </li>
            <li>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-500 px-3 py-[7px] text-sm font-medium text-white transition hover:bg-indigo-400"
              >
                Créer mon compte
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
