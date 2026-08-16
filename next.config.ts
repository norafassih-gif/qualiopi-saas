import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ces paquets contiennent des binaires natifs (Chromium headless pour la
  // génération PDF, cf. lib/pdf/browser.ts) : on les laisse en dehors du
  // bundle serveur plutôt que de laisser Next.js essayer de les empaqueter.
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
};

export default nextConfig;
