import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";
import { isSubscriptionActiveForOrg } from "@/lib/actions/billing";
import { getMyFirstTraining } from "@/lib/actions/training";
import { getMyFirstSession } from "@/lib/actions/session";
import { buildDocumentHtml } from "@/lib/engine/document-builder";
import { renderHtmlToPdf } from "@/lib/pdf/render";

export const maxDuration = 60;

/**
 * Génère et renvoie le PDF d'un document à la demande — pas de stockage
 * intermédiaire pour ce premier document (cf. point 11 de la conception,
 * "génération PDF côté serveur"). Le ticket `documents` est tout de même
 * mis à jour pour que le tableau de bord puisse refléter le statut
 * "généré".
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await context.params;

  const org = await getMyOrganization();
  if (!org) {
    return NextResponse.json({ error: "Non authentifié ou organisme introuvable." }, { status: 401 });
  }

  // Paiement obligatoire avant de générer un document (décision de Nora,
  // 21/08/2026) — même règle que requireActiveSubscription, mais en 402
  // plutôt qu'une redirection, ce téléchargement n'étant pas une navigation
  // de page.
  if (!(await isSubscriptionActiveForOrg(org.id))) {
    return NextResponse.json(
      { error: "Un abonnement actif est requis pour générer ce document." },
      { status: 402 }
    );
  }

  const built = await buildDocumentHtml(templateId);
  if ("error" in built) {
    return NextResponse.json({ error: built.error }, { status: 400 });
  }

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderHtmlToPdf(built.html);
  } catch (e) {
    console.error("PDF generation failed", e);
    return NextResponse.json(
      { error: "La génération du PDF a échoué : " + (e instanceof Error ? e.message : String(e)) },
      { status: 500 }
    );
  }

  // Bookkeeping non bloquant : si l'écriture échoue, le PDF est quand même
  // renvoyé à l'utilisateur. En plus de la ligne de statut, on conserve
  // désormais aussi une copie du PDF dans Supabase Storage (bucket privé
  // "generated-documents", cf. migration 0031) — sert de cache pour le pack
  // documentaire ZIP (lib/documents/zip.ts) sans avoir à régénérer chaque
  // document au moment du téléchargement du dossier complet. La colonne
  // pdf_url (existante depuis 0001_init.sql, jamais utilisée jusqu'ici)
  // stocke le CHEMIN dans le bucket privé, pas une URL publique.
  try {
    const training = await getMyFirstTraining();
    const session = await getMyFirstSession();
    const supabase = await createClient();
    const storagePath = `${org.id}/${templateId}.pdf`;
    await supabase.storage
      .from("generated-documents")
      .upload(storagePath, pdfBuffer, { upsert: true, contentType: "application/pdf" });
    await supabase.from("documents").upsert(
      {
        organization_id: org.id,
        training_id: training?.id ?? null,
        session_id: session?.id ?? null,
        document_template_id: templateId,
        status: "generated",
        pdf_url: storagePath,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,training_id,document_template_id" }
    );
  } catch (e) {
    console.error("documents upsert/storage failed (non bloquant)", e);
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${templateId}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
