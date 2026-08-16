import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
