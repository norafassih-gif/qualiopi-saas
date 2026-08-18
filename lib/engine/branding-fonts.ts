// Liste FERMÉE de polices proposées pour l'identité visuelle des documents
// PDF (pas de saisie libre) — garantit un rendu fiable côté Chromium
// headless (cf. lib/pdf/render.ts) : les polices système (helvetica/times/
// georgia) ne dépendent d'aucun chargement réseau, les polices Google Fonts
// sont chargées via un <link> dans l'en-tête du document généré (cf.
// lib/engine/document-builder.ts, wrapDocument). Cette même liste alimente
// le menu déroulant de l'écran /parametres/identite-visuelle. Nora a demandé
// une quinzaine de choix (Phase 12) — élargi depuis les 6 de la Phase 11,
// cf. migration 0029_cachet_signature.sql pour le CHECK constraint associé.
export type FontOptionKey =
  | "helvetica"
  | "times"
  | "georgia"
  | "montserrat"
  | "lato"
  | "merriweather"
  | "poppins"
  | "roboto"
  | "opensans"
  | "raleway"
  | "playfair"
  | "worksans"
  | "nunito"
  | "sourcesans"
  | "ptserif";

export type FontOption = {
  key: FontOptionKey;
  label: string;
  cssFontFamily: string;
  // null = police système, aucun chargement externe nécessaire.
  googleFontHref: string | null;
};

export const FONT_OPTIONS: FontOption[] = [
  {
    key: "helvetica",
    label: "Helvetica / Arial (par défaut, sobre)",
    cssFontFamily: '"Helvetica Neue", Arial, sans-serif',
    googleFontHref: null,
  },
  {
    key: "times",
    label: "Times New Roman (classique)",
    cssFontFamily: '"Times New Roman", Times, serif',
    googleFontHref: null,
  },
  {
    key: "georgia",
    label: "Georgia (serif, lisible)",
    cssFontFamily: 'Georgia, "Times New Roman", serif',
    googleFontHref: null,
  },
  {
    key: "montserrat",
    label: "Montserrat (moderne)",
    cssFontFamily: '"Montserrat", "Helvetica Neue", Arial, sans-serif',
    googleFontHref: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap",
  },
  {
    key: "lato",
    label: "Lato (épuré)",
    cssFontFamily: '"Lato", "Helvetica Neue", Arial, sans-serif',
    googleFontHref: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap",
  },
  {
    key: "merriweather",
    label: "Merriweather (élégant, serif)",
    cssFontFamily: '"Merriweather", "Times New Roman", serif',
    googleFontHref: "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap",
  },
  {
    key: "poppins",
    label: "Poppins (dynamique)",
    cssFontFamily: '"Poppins", "Helvetica Neue", Arial, sans-serif',
    googleFontHref: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap",
  },
  {
    key: "roboto",
    label: "Roboto (neutre, très lisible)",
    cssFontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
    googleFontHref: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
  },
  {
    key: "opensans",
    label: "Open Sans (accessible)",
    cssFontFamily: '"Open Sans", "Helvetica Neue", Arial, sans-serif',
    googleFontHref: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap",
  },
  {
    key: "raleway",
    label: "Raleway (élégant, fin)",
    cssFontFamily: '"Raleway", "Helvetica Neue", Arial, sans-serif',
    googleFontHref: "https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&display=swap",
  },
  {
    key: "playfair",
    label: "Playfair Display (haut de gamme, serif)",
    cssFontFamily: '"Playfair Display", "Times New Roman", serif',
    googleFontHref: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap",
  },
  {
    key: "worksans",
    label: "Work Sans (professionnel, sans-serif)",
    cssFontFamily: '"Work Sans", "Helvetica Neue", Arial, sans-serif',
    googleFontHref: "https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;600;700&display=swap",
  },
  {
    key: "nunito",
    label: "Nunito (arrondi, chaleureux)",
    cssFontFamily: '"Nunito", "Helvetica Neue", Arial, sans-serif',
    googleFontHref: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap",
  },
  {
    key: "sourcesans",
    label: "Source Sans (technique, neutre)",
    cssFontFamily: '"Source Sans 3", "Helvetica Neue", Arial, sans-serif',
    googleFontHref: "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap",
  },
  {
    key: "ptserif",
    label: "PT Serif (classique, chaleureux)",
    cssFontFamily: '"PT Serif", "Times New Roman", serif',
    googleFontHref: "https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&display=swap",
  },
];

export const DEFAULT_FONT_KEY: FontOptionKey = "helvetica";

export function isFontOptionKey(value: string | null | undefined): value is FontOptionKey {
  return FONT_OPTIONS.some((f) => f.key === value);
}

export function getFontOption(key: string | null | undefined): FontOption {
  return FONT_OPTIONS.find((f) => f.key === key) ?? FONT_OPTIONS[0];
}
