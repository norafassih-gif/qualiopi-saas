"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * "Générer tous mes documents" — demande de Nora (25/08/2026) : "il
 * faudrait que tous les documents se téléchargent une fois pour toutes, en
 * un seul clic [...] ce qui est marqué en haut télécharger mon zip."
 *
 * Le ZIP existant (app/api/documents/zip/route.ts) ne contient QUE les
 * documents déjà générés et mis en cache dans Storage — un document jamais
 * ouvert individuellement n'y figure pas, ce qui empêchait un vrai "1
 * clic". Ce bouton génère chaque document un par un côté client (une
 * requête par modèle, comme un clic manuel sur chaque carte), ce qui
 * alimente le même cache, puis déclenche automatiquement le téléchargement
 * du ZIP une fois tout généré — sans changer la route ZIP elle-même.
 *
 * Séquentiel plutôt qu'en parallèle : chaque génération lance une page
 * Chromium headless (Puppeteer, cf. lib/pdf/render.ts) côté serveur — une
 * quarantaine en parallèle saturerait la fonction serverless. Orchestré ici
 * plutôt que dans la route ZIP elle-même car chaque appel a son propre
 * budget de 60s (maxDuration) — un seul gros appel qui générerait tout
 * risquerait le timeout avec ~40 modèles.
 */
export function GenerateAllButton({ templateIds }: { templateIds: string[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(0);
  const [failedLabels, setFailedLabels] = useState<string[]>([]);

  async function handleClick() {
    setPending(true);
    setDone(0);
    const failed: string[] = [];

    for (let i = 0; i < templateIds.length; i++) {
      const id = templateIds[i];
      try {
        const response = await fetch(`/api/documents/${id}`);
        if (!response.ok) failed.push(id);
      } catch {
        failed.push(id);
      }
      setDone(i + 1);
    }

    setFailedLabels(failed);
    setPending(false);
    router.refresh();

    // Tout est désormais dans le cache Storage (sauf les éventuels échecs
    // ci-dessus) : le ZIP existant les contient automatiquement — on le
    // déclenche directement pour un vrai "1 clic" de bout en bout.
    // /api/documents/zip est une route de téléchargement de fichier
    // (Content-Disposition: attachment), pas une page — router.push()
    // essaierait de la traiter comme une navigation React, ce qui ne
    // déclenche pas le téléchargement.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/api/documents/zip";
  }

  return (
    <div className="mb-3 flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending || templateIds.length === 0}
        className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending
          ? `Génération en cours… ${done}/${templateIds.length}`
          : "Générer tous mes documents puis télécharger le ZIP"}
      </button>
      {pending && (
        <div className="h-1.5 w-64 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-900 transition-all"
            style={{ width: `${(done / Math.max(templateIds.length, 1)) * 100}%` }}
          />
        </div>
      )}
      {!pending && failedLabels.length > 0 && (
        <p className="text-xs text-red-600" role="alert">
          {failedLabels.length} document{failedLabels.length > 1 ? "s n'ont" : " n'a"} pas pu être généré
          {failedLabels.length > 1 ? "s" : ""} automatiquement — téléchargez-le
          {failedLabels.length > 1 ? "s" : ""} individuellement ci-dessous.
        </p>
      )}
    </div>
  );
}
