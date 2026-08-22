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

/**
 * Carte "verre liquide" sombre (Phase 27ter, 24/08/2026) — même esthétique
 * que les vignettes du hero (`public/images/marquee/doc-*.svg` : dégradé
 * quasi-noir + halo teinté flouté en coin + liseré clair en haut), reprise
 * ici en CSS pour les 4 cartes de `NotionsGrid` suite au retour de Nora
 * ("cas doivent être flottantes et en glacis liquide"). Contrairement à
 * `ACCENT_CARD` (fond pastel clair, texte saturé), ces cartes sont sombres
 * et flottent sur le fond blanc de la page — le contraste fort porte
 * l'attention plutôt qu'un dégradé pastel qui se fond dans la page.
 */
export const ACCENT_GLASS: Record<AccentColor, string> = {
  indigo:
    "border-white/10 shadow-indigo-950/30 [background:radial-gradient(120%_140%_at_20%_15%,rgba(99,102,241,0.35),transparent_60%),linear-gradient(160deg,#101018,#020204)]",
  emerald:
    "border-white/10 shadow-emerald-950/30 [background:radial-gradient(120%_140%_at_20%_15%,rgba(16,185,129,0.35),transparent_60%),linear-gradient(160deg,#0e1614,#020204)]",
  amber:
    "border-white/10 shadow-amber-950/30 [background:radial-gradient(120%_140%_at_20%_15%,rgba(245,158,11,0.32),transparent_60%),linear-gradient(160deg,#181410,#020204)]",
  rose: "border-white/10 shadow-rose-950/30 [background:radial-gradient(120%_140%_at_20%_15%,rgba(244,63,94,0.32),transparent_60%),linear-gradient(160deg,#180f13,#020204)]",
  sky: "border-white/10 shadow-sky-950/30 [background:radial-gradient(120%_140%_at_20%_15%,rgba(14,165,233,0.32),transparent_60%),linear-gradient(160deg,#0d1620,#020204)]",
  violet:
    "border-white/10 shadow-violet-950/30 [background:radial-gradient(120%_140%_at_20%_15%,rgba(139,92,246,0.35),transparent_60%),linear-gradient(160deg,#15111e,#020204)]",
  teal: "border-white/10 shadow-teal-950/30 [background:radial-gradient(120%_140%_at_20%_15%,rgba(20,184,166,0.32),transparent_60%),linear-gradient(160deg,#0d1716,#020204)]",
  fuchsia:
    "border-white/10 shadow-fuchsia-950/30 [background:radial-gradient(120%_140%_at_20%_15%,rgba(217,70,239,0.32),transparent_60%),linear-gradient(160deg,#180f1a,#020204)]",
  orange:
    "border-white/10 shadow-orange-950/30 [background:radial-gradient(120%_140%_at_20%_15%,rgba(249,115,22,0.32),transparent_60%),linear-gradient(160deg,#181210,#020204)]",
  cyan: "border-white/10 shadow-cyan-950/30 [background:radial-gradient(120%_140%_at_20%_15%,rgba(6,182,212,0.32),transparent_60%),linear-gradient(160deg,#0d1618,#020204)]",
  lime: "border-white/10 shadow-lime-950/30 [background:radial-gradient(120%_140%_at_20%_15%,rgba(132,204,22,0.32),transparent_60%),linear-gradient(160deg,#131810,#020204)]",
};

/** Renvoie la teinte n°`index` de la palette, en bouclant. */
export function accentAt(index: number): AccentColor {
  return ACCENT_ORDER[index % ACCENT_ORDER.length];
}
