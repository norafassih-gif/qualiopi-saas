import type { Browser } from "puppeteer-core";
import puppeteer from "puppeteer-core";
import fs from "node:fs";

// Chromium local pré-installé dans le bac à sable de développement — ne
// sert qu'en dehors de Vercel (cf. lancement conditionnel ci-dessous). Le
// numéro de révision peut changer avec l'image de dev ; si ce chemin
// n'existe plus, l'erreur explicite ci-dessous le signale plutôt que
// d'échouer silencieusement.
const LOCAL_DEV_CHROMIUM_CANDIDATES = [
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
];

/**
 * Lance un navigateur headless pour la génération PDF (cf. point 11 de la
 * conception — génération PDF côté serveur, aucune bibliothèque ni service
 * payant). En production sur Vercel, utilise `@sparticuz/chromium`, un
 * binaire Chromium compressé conçu pour les fonctions serverless. En
 * développement, utilise le Chromium déjà installé sur la machine.
 */
export async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      executablePath: await chromium.executablePath(),
      args: chromium.args,
      headless: true,
    });
  }

  const localPath = LOCAL_DEV_CHROMIUM_CANDIDATES.find((p) => fs.existsSync(p));
  if (!localPath) {
    throw new Error(
      "Aucun Chromium local trouvé pour la génération PDF en développement. " +
        "En production (Vercel), @sparticuz/chromium est utilisé automatiquement — ce message ne devrait apparaître qu'en environnement de développement."
    );
  }

  return puppeteer.launch({
    executablePath: localPath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });
}
