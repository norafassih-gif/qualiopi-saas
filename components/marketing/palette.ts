/**
 * Palette d'accent partagée (Phase 24, 22/08/2026) — les mêmes 11 teintes
 * pastel que le couloir de cartes de la page d'accueil (`principles-corridor.tsx`),
 * réutilisées ailleurs sur le site public pour que ces couleurs "se fondent
 * un peu partout" plutôt que de rester isolées dans le hero (retour de Nora :
 * le reste du site n'utilisait qu'un indigo unique, sans lien visuel avec les
 * cartes colorées).
 *
 * Classes Tailwind écrites en toutes lettres (pas de construction dynamique
 * `text-${color}-500`) : le compilateur Tailwind doit voir la classe complète
 * dans le code source pour la générer, une chaîne interpolée ne fonctionnerait
 * pas en production.
 */
export const ACCENT_ORDER = [
  "indigo",
  "emerald",
  "amber",
  "rose",
  "sky",
  "violet",
  "teal",
  "fuchsia",
  "orange",
  "cyan",
  "lime",
] as const;

export type AccentColor = (typeof ACCENT_ORDER)[number];

/** Icône seule (ex. lucide-react) sur fond blanc/clair. */
export const ACCENT_ICON: Record<AccentColor, string> = {
  indigo: "text-indigo-500",
  emerald: "text-emerald-500",
  amber: "text-amber-500",
  rose: "text-rose-500",
  sky: "text-sky-500",
  violet: "text-violet-500",
  teal: "text-teal-500",
  fuchsia: "text-fuchsia-500",
  orange: "text-orange-500",
  cyan: "text-cyan-500",
  lime: "text-lime-500",
};

/** Pastille/badge (fond pastel très clair + texte saturé de la même teinte). */
export const ACCENT_BADGE: Record<AccentColor, string> = {
  indigo: "bg-indigo-50 text-indigo-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  sky: "bg-sky-50 text-sky-700",
  violet: "bg-violet-50 text-violet-700",
  teal: "bg-teal-50 text-teal-700",
  fuchsia: "bg-fuchsia-50 text-fuchsia-700",
  orange: "bg-orange-50 text-orange-700",
  cyan: "bg-cyan-50 text-cyan-700",
  lime: "bg-lime-50 text-lime-700",
};

/** Carte (fond dégradé pastel + texte + contour + ombre, même teinte). */
export const ACCENT_CARD: Record<AccentColor, string> = {
  indigo: "from-indigo-100 to-indigo-50 text-indigo-700 border-indigo-200 shadow-indigo-200/70",
  emerald: "from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-200/70",
  amber: "from-amber-100 to-amber-50 text-amber-700 border-amber-200 shadow-amber-200/70",
  rose: "from-rose-100 to-rose-50 text-rose-700 border-rose-200 shadow-rose-200/70",
  sky: "from-sky-100 to-sky-50 text-sky-700 border-sky-200 shadow-sky-200/70",
  violet: "from-violet-100 to-violet-50 text-violet-700 border-violet-200 shadow-violet-200/70",
  teal: "from-teal-100 to-teal-50 text-teal-700 border-teal-200 shadow-teal-200/70",
  fuchsia: "from-fuchsia-100 to-fuchsia-50 text-fuchsia-700 border-fuchsia-200 shadow-fuchsia-200/70",
  orange: "from-orange-100 to-orange-50 text-orange-700 border-orange-200 shadow-orange-200/70",
  cyan: "from-cyan-100 to-cyan-50 text-cyan-700 border-cyan-200 shadow-cyan-200/70",
  lime: "from-lime-100 to-lime-50 text-lime-700 border-lime-200 shadow-lime-200/70",
};

/** Renvoie la teinte n°`index` de la palette, en bouclant. */
export function accentAt(index: number): AccentColor {
  return ACCENT_ORDER[index % ACCENT_ORDER.length];
}
