import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";
import { isSubscriptionActiveForOrg } from "@/lib/actions/billing";
import { getMyFirstTraining } from "@/lib/actions/training";
import { getMyFirstSession } from "@/lib/actions/session";
import { buildDocumentHtml } from "@/lib/engine/document-builder";
import { STUDENT_SCOPED_TEMPLATE_IDS } from "@/lib/engine/document-variables";
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
  request: Request,
  context: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await context.params;

  // Date personnalisée facultative (?date=YYYY-MM-DD) — demande de Nora
  // (24/08/2026) : les organismes doivent pouvoir choisir la date affichée
  // sur le document plutôt que de subir systématiquement la date du jour.
  // Revalidée ici (pas seulement dans resolveDocumentVariables) pour ne
  // jamais transmettre une chaîne vide ou manifestement invalide plus loin.
  const requestUrl = new URL(request.url);
  const requestedDate = requestUrl.searchParams.get("date");
  const customDate =
    requestedDate && requestedDate.trim().length > 0 && !Number.isNaN(new Date(requestedDate).getTime())
      ? requestedDate
      : undefined;

  // Sélecteur "par apprenant" (?beneficiary_id=..., cf.
  // app/(app)/documents/download-form.tsx et generate-all-button.tsx) —
  // uniquement pris en compte pour les modèles STUDENT_SCOPED_TEMPLATE_IDS :
  // un document "de session" (programme, émargement...) ne dépend d'aucun
  // bénéficiaire précis et doit rester unique par organisme/formation quel
  // que soit ce paramètre.
  const isStudentScoped = (STUDENT_SCOPED_TEMPLATE_IDS as readonly string[]).includes(templateId);
  const requestedBeneficiaryId = isStudentScoped
    ? requestUrl.searchParams.get("beneficiary_id")?.trim() || undefined
    : undefined;

  const org = await getMyOrganization();
  if (!org) {
    return NextResponse.json({ error: "Non authentifié ou organisme introuvable." }, { status: 401 });
  }

  // Paiement obligatoire pour générer un document (décision de Nora,
  // 21/08/2026, paywall "à l'usage" révisé le 24/08/2026) — en 402 JSON
  // plutôt qu'une redirection, cette route étant appelée via fetch() par
  // download-form.tsx et generate-all-button.tsx, qui gèrent eux-mêmes la
  // redirection vers /onboarding/abonnement sur ce statut.
  if (!(await isSubscriptionActiveForOrg(org.id))) {
    return NextResponse.json(
      { error: "Un abonnement actif est requis pour générer ce document." },
      { status: 402 }
    );
  }

  const built = await buildDocumentHtml(templateId, customDate, requestedBeneficiaryId);
  if ("error" in built) {
    return NextResponse.json({ error: built.error }, { status: 400 });
  }

  // Nom de fichier distinct par bénéficiaire pour les documents "par
  // apprenant" — sinon télécharger la convocation de Jean puis celle de
  // Marie produit deux fois "convocation.pdf" dans le dossier
  // Téléchargements du navigateur, la seconde écrasant silencieusement la
  // première (cf. chantier "documents par apprenant", 25/08/2026).
  let downloadFileName = `${templateId}.pdf`;
  if (isStudentScoped && built.beneficiaryId) {
    const supabaseForName = await createClient();
    const { data: beneficiaryRow } = await supabaseForName
      .from("beneficiaries")
      .select("full_name")
      .eq("id", built.beneficiaryId)
      .maybeSingle();
    if (beneficiaryRow?.full_name) {
      const slug = beneficiaryRow.full_name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // diacritiques (accents) isoles apres normalize("NFD")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      downloadFileName = slug ? `${templateId}__${slug}.pdf` : downloadFileName;
    }
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
    // Bénéficiaire effectivement utilisé pour ce document (renvoyé par
    // buildDocumentHtml — pas le paramètre brut de l'URL, qui peut être
    // absent/invalide et avoir déclenché un repli sur getMyFirstBeneficiary,
    // cf. lib/engine/document-builder.ts). null pour tout document "de
    // session" (isStudentScoped=false) ou si la session n'a aucun
    // bénéficiaire.
    const resolvedBeneficiaryId = isStudentScoped ? built.beneficiaryId : null;
    // Chemin de Storage distinct par bénéficiaire pour les documents "par
    // apprenant" — sinon la génération du document de l'apprenant B écrase
    // en Storage la copie déjà générée pour l'apprenant A (même si les deux
    // lignes `documents` restent, elles, correctement distinctes) : c'était
    // la 2e moitié du bug corrigé ici (25/08/2026), en plus de l'ignorance
    // pure et simple de beneficiary_id.
    const storagePath = resolvedBeneficiaryId
      ? `${org.id}/${templateId}__${resolvedBeneficiaryId}.pdf`
      : `${org.id}/${templateId}.pdf`;
    await supabase.storage
      .from("generated-documents")
      .upload(storagePath, pdfBuffer, { upsert: true, contentType: "application/pdf" });
    // Le upsert() avec onConflict ne fonctionne plus depuis la migration
    // multi-beneficiaires (0044, Phase 29) : l'ancienne contrainte unique
    // "plate" a ete remplacee par deux index uniques PARTIELS (un pour les
    // documents "de session", beneficiary_id IS NULL ; un pour les
    // documents "par apprenant", beneficiary_id IS NOT NULL). Postgres ne
    // fait pas correspondre un ON CONFLICT sans clause WHERE a un index
    // partiel (erreur 42P10) : l'upsert echouait donc silencieusement a
    // chaque appel, et le tableau de bord restait bloque a "0 document
    // genere" (cf. journal, Phase 31 point 4). Remplace par un
    // select-puis-insert/update explicite, qui n'a pas besoin de cibler un
    // index precis. Filtre desormais sur beneficiary_id (null OU une valeur
    // precise) plutot que de toujours supposer une ligne "de session" — cf.
    // chantier "documents par apprenant" du 25/08/2026.
    const trainingId = training?.id ?? null;
    let existingQuery = supabase
      .from("documents")
      .select("id")
      .eq("organization_id", org.id)
      .eq("document_template_id", templateId);
    existingQuery = resolvedBeneficiaryId
      ? existingQuery.eq("beneficiary_id", resolvedBeneficiaryId)
      : existingQuery.is("beneficiary_id", null);
    existingQuery = trainingId
      ? existingQuery.eq("training_id", trainingId)
      : existingQuery.is("training_id", null);
    const { data: existingDoc } = await existingQuery.maybeSingle();

    const documentFields = {
      organization_id: org.id,
      training_id: trainingId,
      session_id: session?.id ?? null,
      document_template_id: templateId,
      beneficiary_id: resolvedBeneficiaryId,
      status: "generated",
      pdf_url: storagePath,
      generated_at: new Date().toISOString(),
    };

    if (existingDoc) {
      await supabase.from("documents").update(documentFields).eq("id", existingDoc.id);
    } else {
      await supabase.from("documents").insert(documentFields);
    }
  } catch (e) {
    console.error("documents upsert/storage failed (non bloquant)", e);
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${downloadFileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
