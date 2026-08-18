import Link from "next/link";
import { ShieldCheck, LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { PLATFORM_NAME } from "@/components/marketing/logo";

/**
 * Bandeau sombre commun à toutes les pages connectées (tableau de bord,
 * documents, paramètres, back-office...) — même couleur que la page
 * d'accueil publique, pour que l'identité visuelle soit cohérente d'un bout
 * à l'autre de l'application, même si le contenu des pages reste clair
 * (plus lisible pour des formulaires et des tableaux).
 */
export function AppHeader() {
  return (
    <header style={{ backgroundColor: "#030712" }} className="border-b border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2" aria-label={PLATFORM_NAME}>
          <ShieldCheck className="h-5 w-5 text-indigo-400" aria-hidden="true" />
          <span className="text-sm tracking-wide">
            <span className="font-extrabold text-gray-100">Qualiopi</span>{" "}
            <span className="font-light text-gray-400">Pilote</span>
          </span>
        </Link>

        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Se déconnecter
          </button>
        </form>
      </div>
    </header>
  );
}
