import Link from "next/link";
import { ShieldCheck } from "lucide-react";

/**
 * Nom de travail de la plateforme — pas encore définitivement tranché
 * (cf. roadmap-produit-et-tarifs.md). Un seul endroit à modifier le jour où
 * le nom change.
 */
export const PLATFORM_NAME = "Qualiopi Pilote";

export function Logo() {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center gap-2" aria-label={PLATFORM_NAME}>
      <ShieldCheck className="h-6 w-6 text-indigo-400" aria-hidden="true" />
      <span className="text-sm font-semibold tracking-wide text-gray-100">{PLATFORM_NAME}</span>
    </Link>
  );
}
