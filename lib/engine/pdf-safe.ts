// Rendu fiable des cases à cocher et des symboles dans les PDF.
//
// Cause du défaut constaté le 10/10/2026 (dossier AKADEMOS EVO) : des
// caractères Unicode (case vide, case cochée, signe d'avertissement...)
// étaient écrits en texte dans les documents. Le Chromium de production
// (@sparticuz/chromium) embarque très peu de polices : le glyphe manque et le
// PDF affiche un carré ou un "?" à la place. Au lieu de dépendre d'une
// police, les cases sont DESSINÉES en CSS : même rendu partout, sur
// n'importe quelle police d'identité visuelle choisie par l'organisme.

// Cases cochées : ☑ ☒ ✓ ✔ ✅
const CHECKED = /[☑☒✓✔✅]/g;
// Cases vides : ☐ □ ⬜
const UNCHECKED = /[☐□⬜]/g;
// Croix : ❌ ✗ ✘
const CROSSED = /[❌✗✘]/g;
// Avertissement : ⚠ (avec ou sans sélecteur de variante)
const WARNING = /⚠️?/g;

export const CHECKBOX_CSS = `
    /* Cases à cocher dessinées (aucune dépendance à une police). */
    .cb {
      display: inline-block; position: relative; box-sizing: border-box;
      width: 3.3mm; height: 3.3mm; border: 0.35mm solid #1f2937; border-radius: 0.5mm;
      vertical-align: -0.55mm; margin-right: 1.2mm; background: #fff;
    }
    .cb-on::after {
      content: ""; position: absolute; left: 0.85mm; top: -0.05mm;
      width: 1.05mm; height: 2.2mm; border: solid #1f2937; border-width: 0 0.45mm 0.45mm 0;
      transform: rotate(45deg);
    }
    .cb-x::before, .cb-x::after {
      content: ""; position: absolute; left: 1.3mm; top: 0.1mm; width: 0; height: 2.8mm;
      border-left: 0.4mm solid #1f2937;
    }
    .cb-x::before { transform: rotate(45deg); }
    .cb-x::after { transform: rotate(-45deg); }
    .warn {
      display: inline-block; box-sizing: border-box; width: 3.6mm; height: 3.6mm; line-height: 3.1mm;
      text-align: center; border: 0.35mm solid #b45309; border-radius: 50%;
      font-weight: 700; font-size: 7pt; color: #b45309; margin-right: 1.2mm; vertical-align: -0.6mm;
    }
`;

// Caractères rares remplacés par des équivalents présents dans toutes les
// polices (liste établie à partir des modèles en production).
const GLYPH_REPLACEMENTS: Array<[RegExp, string]> = [
  [/≥\s?/g, "min. "], // ≥
  [/≤\s?/g, "max. "], // ≤
  [/→/g, "›"], // → devient ›
  [/ʳ/g, "r"], // ʳ
  [/ᵉ/g, "e"], // ᵉ
  [/[️‍]/g, ""], // sélecteurs de variante / liaisons invisibles
];

/** Remplace les symboles de cases par des cases dessinées en CSS. */
export function drawCheckboxes(html: string): string {
  return html
    .replace(UNCHECKED, '<span class="cb" aria-hidden="true"></span>')
    .replace(CHECKED, '<span class="cb cb-on" aria-hidden="true"></span>')
    .replace(CROSSED, '<span class="cb cb-x" aria-hidden="true"></span>')
    .replace(WARNING, '<span class="warn" aria-hidden="true">!</span>');
}

/** Normalise les caractères rares puis dessine les cases. À appliquer au corps du document. */
export function makePdfSafe(html: string): string {
  let out = html;
  for (const [pattern, replacement] of GLYPH_REPLACEMENTS) out = out.replace(pattern, replacement);
  return drawCheckboxes(out);
}

// Caractères que l'on accepte de voir dans un PDF : latin de base, latin-1,
// Œ œ, tirets, guillemets typographiques, puce, points de suspension, euro,
// guillemets français simples.
const SAFE_GLYPHS =
  /^[\u0009\u000A\u000D -~ -ÿŒœ–—‘’“”•…€‹›]*$/;

/** Retourne les caractères d'un texte qui risquent de s'afficher en "?" dans le PDF. */
export function findUnsafeGlyphs(text: string): string[] {
  if (SAFE_GLYPHS.test(text)) return [];
  const bad = new Set<string>();
  for (const ch of text) {
    if (!SAFE_GLYPHS.test(ch)) bad.add(ch);
  }
  return [...bad];
}
