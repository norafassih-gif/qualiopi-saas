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
/**
 * Date commune à appliquer à tous les documents en un clic — demande de
 * Nora (25/08/2026) : "des fois c'est différé [...] proposer de pouvoir
 * mettre la même date partout. Et après si on doit la corriger, on la
 * corrige sur certains documents. Mais sur 41 documents, devoir mettre la
 * date à chaque fois, c'est pas faciliter la vie aux gens, c'est la
 * compliquer." Champ pré-rempli à la date du jour (comportement inchangé si
 * on ne le touche pas), modifiable avant de lancer la génération groupée ;
 * chaque carte de document garde en plus son propre champ date individuel
 * (cf. download-form.tsx) pour corriger un document précis après coup sans
 * tout regénérer.
 */
function todayIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function GenerateAllButton({
  templateIds,
  studentScopedTemplateIds,
  beneficiaries,
}: {
  templateIds: string[];
  /**
   * Modèles "par apprenant" (STUDENT_SCOPED_TEMPLATE_IDS, cf.
   * lib/engine/document-variables.ts) — un exemplaire distinct doit être
   * généré pour CHAQUE bénéficiaire de la session, pas un seul pour toute la
   * session (bugfix "documents par apprenant", 25/08/2026 : Nora a un
   * client avec 15 apprenants sur une même session).
   */
  studentScopedTemplateIds: string[];
  beneficiaries: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(0);
  const [failedLabels, setFailedLabels] = useState<string[]>([]);
  const [date, setDate] = useState(() => todayIsoDate());

  // Construit la liste réelle des documents à générer : un par modèle "de
  // session", et un par (modèle "par apprenant" × bénéficiaire) — sinon
  // "Générer tous mes documents" ne produirait jamais qu'un seul exemplaire
  // des documents par apprenant (celui du bénéficiaire "le plus complet",
  // cf. lib/actions/session.ts) au lieu d'un jeu complet par apprenant.
  // C'est précisément le bug corrigé par ce chantier (25/08/2026) : le
  // sélecteur manuel de bénéficiaire (download-form.tsx) envoyait déjà
  // beneficiary_id à l'API, mais ce bouton "tout générer" ne l'a jamais
  // fait, et rien côté serveur ne le lisait de toute façon.
  const jobs = templateIds.flatMap((id) => {
    if (!studentScopedTemplateIds.includes(id) || beneficiaries.length === 0) {
      return [{ templateId: id, beneficiaryId: null as string | null }];
    }
    return beneficiaries.map((b) => ({ templateId: id, beneficiaryId: b.id as string | null }));
  });

  async function handleClick() {
    setPending(true);
    setDone(0);
    const failed: string[] = [];

    for (let i = 0; i < jobs.length; i++) {
      const { templateId, beneficiaryId } = jobs[i];
      const params = new URLSearchParams();
      if (date) params.set("date", date);
      if (beneficiaryId) params.set("beneficiary_id", beneficiaryId);
      const queryString = params.toString();
      try {
        const response = await fetch(`/api/documents/${templateId}${queryString ? `?${queryString}` : ""}`);
        if (!response.ok) {
          // Paywall "à l'usage" (décision de Nora, 24/08/2026) : dès qu'un
          // document échoue faute d'abonnement actif, inutile de continuer
          // à boucler sur les ~40 autres — on redirige tout de suite vers
          // la page de paiement plutôt que de terminer la boucle puis
          // d'afficher un ZIP vide/en erreur.
          if (response.status === 402) {
            setPending(false);
            router.push("/onboarding/abonnement");
            return;
          }
          failed.push(templateId);
        }
      } catch {
        failed.push(templateId);
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
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-gray-600">
          Date à appliquer à tous les documents
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={pending}
            className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 disabled:opacity-50"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending || jobs.length === 0}
        className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending
          ? `Génération en cours… ${done}/${jobs.length}`
          : "Générer tous mes documents puis télécharger le ZIP"}
      </button>
      <p className="text-xs text-gray-500">
        Vous pourrez toujours corriger la date d&apos;un document précis ensuite, individuellement, sur sa
        propre carte ci-dessous.
      </p>
      {pending && (
        <div className="h-1.5 w-64 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-900 transition-all"
            style={{ width: `${(done / Math.max(jobs.length, 1)) * 100}%` }}
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
