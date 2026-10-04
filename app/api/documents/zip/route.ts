import JSZip from "jszip";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";
import { isSubscriptionActiveForOrg } from "@/lib/actions/billing";
import { getGeneratedDocumentsForZip } from "@/lib/actions/documents";
import { getMyFirstTraining } from "@/lib/actions/training";
import { getMyFirstPartner } from "@/lib/actions/partners";
import {
  allIndicatorFolders,
  documentIndicators,
  indicatorFolderPath,
  notApplicableReason,
  TO_COMPLETE,
  type AuditContext,
} from "@/lib/engine/audit-structure";

export const maxDuration = 60;

function safeFileName(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // diacritiques (accents) isoles apres normalize("NFD")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

/**
 * Construit et renvoie le ZIP "Mon dossier Qualiopi" — cf. conception
 * initiale, section "PACK DOCUMENTAIRE / TÉLÉCHARGER MON DOSSIER". Utilise
 * uniquement les PDF déjà générés et mis en cache dans Storage (migration
 * 0031) : ne régénère rien à la volée, pour rester rapide même avec une
 * quarantaine de documents. Si un document n'a jamais été téléchargé
 * individuellement, il n'a pas encore de copie en cache et n'apparaît donc
 * pas dans le ZIP — l'écran "Mes documents" indique déjà clairement lesquels
 * sont "❌ Non généré".
 */
export async function GET() {
  const org = await getMyOrganization();
  if (!org) {
    return NextResponse.json({ error: "Non authentifié ou organisme introuvable." }, { status: 401 });
  }

  // Paiement obligatoire pour télécharger le dossier (décision de Nora,
  // 21/08/2026, paywall "à l'usage" révisé le 24/08/2026). Cette route est
  // atteinte par une vraie navigation de page (lien <a href> et
  // window.location.href, jamais un fetch() — cf. documents/page.tsx et
  // generate-all-button.tsx), donc une redirection plutôt qu'un JSON 402 :
  // sinon le navigateur affiche le JSON brut à l'écran au lieu d'amener
  // l'utilisateur vers la page de paiement.
  if (!(await isSubscriptionActiveForOrg(org.id))) {
    redirect("/onboarding/abonnement");
  }

  const docs = await getGeneratedDocumentsForZip();
  if ("error" in docs) {
    return NextResponse.json({ error: docs.error }, { status: 400 });
  }
  if (docs.length === 0) {
    return NextResponse.json(
      { error: "Aucun document généré pour l'instant — téléchargez au moins un PDF avant de créer le ZIP." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const zip = new JSZip();

  // Téléchargements en parallèle (nombre de documents modeste, quelques
  // dizaines au maximum) plutôt qu'en série, pour rester dans la limite de
  // temps d'une fonction serverless.
  const results = await Promise.all(
    docs.map(async (doc) => {
      const { data, error } = await supabase.storage.from("generated-documents").download(doc.storage_path);
      if (error || !data) {
        console.error("zip: échec du téléchargement", doc.storage_path, error);
        return null;
      }
      return { doc, buffer: Buffer.from(await data.arrayBuffer()) };
    })
  );

  // Classement par critère puis par indicateur, comme le chef auditeur
  // l'a fait à la main pour un dossier client (cf. lib/engine/audit-structure.ts).
  const [training, subcontractor, partner] = await Promise.all([
    getMyFirstTraining(),
    getMyFirstPartner("sous_traitant"),
    getMyFirstPartner("partenaire"),
  ]);
  const ctx: AuditContext = {
    isCertifying: Boolean((training as { is_certifying?: boolean | null } | null)?.is_certifying),
    hasSubcontractor: Boolean(subcontractor),
    hasWorkPlacementPartner: Boolean(partner),
  };

  const root = `Dossier audit Qualiopi - ${safeFileName(org.company_name || "organisme").replace(/_/g, " ")}`;

  // Tous les dossiers indicateurs, même vides : l'auditeur retrouve
  // immédiatement la grille complète des 32 indicateurs.
  for (const indicator of allIndicatorFolders()) {
    const folder = `${root}/${indicatorFolderPath(indicator, ctx)}`;
    zip.folder(folder);
    const naReason = notApplicableReason(indicator, ctx);
    if (naReason) {
      zip.file(`${folder}/NON_APPLICABLE.txt`, naReason + "\n");
    }
    const toComplete = TO_COMPLETE[indicator];
    if (toComplete && !naReason) {
      zip.file(`${folder}/A_COMPLETER.txt`, "Preuves à ajouter par l'organisme avant l'audit :\n" + toComplete + "\n");
    }
  }

  const usedNamesByFolder = new Map<string, Set<string>>();
  for (const result of results) {
    if (!result) continue;
    const indicators = documentIndicators(
      result.doc.document_template_id,
      result.doc.linked_indicator_numbers,
      ctx
    );
    for (const indicator of indicators) {
      const folderName = `${root}/${indicatorFolderPath(indicator, ctx)}`;
      const usedNames = usedNamesByFolder.get(folderName) ?? new Set<string>();
      let fileName = `${safeFileName(result.doc.label)}.pdf`;
      // Anti-collision : deux libellés proches ne doivent pas s'écraser.
      let suffix = 2;
      while (usedNames.has(fileName)) {
        fileName = `${safeFileName(result.doc.label)}_${suffix}.pdf`;
        suffix += 1;
      }
      usedNames.add(fileName);
      usedNamesByFolder.set(folderName, usedNames);
      zip.file(`${folderName}/${fileName}`, result.buffer);
    }
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  const orgSlug = safeFileName(org.company_name || "organisme").toLowerCase();
  const dateSlug = new Date().toISOString().slice(0, 10);

  return new NextResponse(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="dossier-qualiopi-${orgSlug}-${dateSlug}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
