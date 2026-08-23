import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js limite par défaut le corps d'un appel de Server Action à 1 Mo —
  // bien en dessous de ce que le formulaire d'identité visuelle autorise
  // explicitement (logo + cachet + signature, jusqu'à 2 Mo chacun, cf.
  // MAX_IMAGE_BYTES dans lib/actions/branding.ts). Sans ce réglage, envoyer
  // un vrai logo (souvent >1 Mo) fait planter le serveur avec une erreur 413
  // brute ("Body exceeded 1 MB limit") au lieu du message d'erreur prévu
  // dans le code — bug remonté par Nora le 23/08/2026 en configurant
  // l'identité d'un organisme. 10 Mo couvre le pire cas (3 fichiers à 2 Mo
  // chacun + l'encodage base64 de la signature dessinée à la main + la
  // marge du multipart/form-data) sans être excessif.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // Ces paquets contiennent des binaires natifs (Chromium headless pour la
  // génération PDF, cf. lib/pdf/browser.ts) : on les laisse en dehors du
  // bundle serveur plutôt que de laisser Next.js essayer de les empaqueter.
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],

  // Le "output file tracing" de Next.js (qui décide quels fichiers partent
  // sur Vercel) ne détecte pas tout seul le dossier bin/ de
  // @sparticuz/chromium (binaire Chromium compressé) car il n'est jamais
  // importé par du code JS/TS classique. Sans cette ligne, la route qui
  // génère les PDF plante en production avec :
  // "The input directory .../@sparticuz/chromium/bin does not exist".
  outputFileTracingIncludes: {
    "/api/documents/*": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

export default nextConfig;
