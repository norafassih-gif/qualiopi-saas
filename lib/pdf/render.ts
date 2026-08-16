import { launchBrowser } from "./browser";

/**
 * Convertit un document HTML déjà assemblé (cf. lib/engine/document-builder.ts)
 * en PDF. Aucun service externe payant : rendu local via Chromium headless
 * (cf. point 11 de la conception).
 */
export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate:
        '<div style="font-size:8px; width:100%; text-align:center; color:#888;">Page <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin: { top: "24mm", bottom: "18mm", left: "0mm", right: "0mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
