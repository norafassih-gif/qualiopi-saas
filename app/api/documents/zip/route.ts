import JSZip from "jszip";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";
import { getGeneratedDocumentsForZip } from "@/lib/actions/documents";

export const maxDuration = 60;

// Noms de dossiers affichés dans le ZIP — reprend les libellés déjà utilisés
// sur l'écran "Mes documents" (folder_group en base), sans le préfixe
// numérique technique, pour un ZIP lisible par un auditeur qui l'ouvrirait
// directement (cf. conception initiale, "PACK DOCUMENTAIRE").
const FOLDER_NAMES: Record<string, string> = {
  "03_Avant_formation": "03_Avant_la_formation",
  "04_Pendant_formation": "04_Pendant_la_formation",
  "05_Apres_formation": "05_Apres_la_formation",
  "06_Procedures": "06_Procedures",
  "07_Veille": "07_Veille",
  "08_Amelioration": "08_Amelioration_continue",
};

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

  const usedNamesByFolder = new Map<string, Set<string>>();
  for (const result of results) {
    if (!result) continue;
    const folderName = FOLDER_NAMES[result.doc.folder_group] ?? result.doc.folder_group;
    const usedNames = usedNamesByFolder.get(folderName) ?? new Set<string>();
    let fileName = `${safeFileName(result.doc.label)}.pdf`;
    // Sécurité anti-collision : deux libellés très proches ne doivent pas
    // s'écraser l'un l'autre dans le ZIP (improbable avec le référentiel
    // actuel, mais peu coûteux à garantir).
    let suffix = 2;
    while (usedNames.has(fileName)) {
      fileName = `${safeFileName(result.doc.label)}_${suffix}.pdf`;
      suffix += 1;
    }
    usedNames.add(fileName);
    usedNamesByFolder.set(folderName, usedNames);
    zip.file(`${folderName}/${fileName}`, result.buffer);
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
