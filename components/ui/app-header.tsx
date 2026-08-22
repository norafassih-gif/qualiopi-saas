import Link from "next/link";
import { ShieldCheck, LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { PLATFORM_NAME } from "@/components/marketing/logo";

/**
 * Bandeau commun à toutes les pages connectées (tableau de bord, documents,
 * paramètres, back-office...) — même thème clair que la page d'accueil
 * publique (refonte Phase 23), pour que l'identité visuelle soit cohérente
 * d'un bout à l'autre de l'application.
 */
export function AppHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2" aria-label={PLATFORM_NAME}>
          <ShieldCheck className="h-5 w-5 text-indigo-500" aria-hidden="true" />
          <span className="text-sm tracking-wide">
            <span className="font-extrabold text-gray-900">Qualiopi</span>{" "}
            <span className="font-light text-gray-500">Pilote</span>
          </span>
        </Link>

        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Se déconnecter
          </button>
        </form>
      </div>
    </header>
  );
}
