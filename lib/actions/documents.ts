"use server";

import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";

export type DocumentTemplateStatus = {
  id: string;
  label: string;
  folder_group: string;
  linked_indicator_numbers: number[];
  sort_order: number;
  generated: boolean;
  generated_at: string | null;
};

/**
 * Liste tous les modèles de documents actifs, avec leur statut de
 * génération pour l'organisme courant — alimente l'écran "Mes documents"
 * (cf. conception : cartes ✅ Généré / ⚠️ À compléter / ❌ Non généré).
 */
export async function listDocumentTemplatesWithStatus(): Promise<DocumentTemplateStatus[] | { error: string }> {
  const org = await getMyOrganization();
  if (!org) return { error: "Organisme introuvable." };

  const supabase = await createClient();

  const [templatesResponse, documentsResponse] = await Promise.all([
    supabase
      .from("document_templates")
      .select("id, label, folder_group, linked_indicator_numbers, sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("documents")
      .select("document_template_id, status, generated_at")
      .eq("organization_id", org.id),
  ]);

  if (templatesResponse.error) {
    return { error: "Erreur lors du chargement des modèles : " + templatesResponse.error.message };
  }

  const statusByTemplateId = new Map<string, { status: string; generated_at: string | null }>();
  for (const row of documentsResponse.data ?? []) {
    statusByTemplateId.set(row.document_template_id, { status: row.status, generated_at: row.generated_at });
  }

  return (templatesResponse.data ?? []).map((t) => {
    const generatedRow = statusByTemplateId.get(t.id);
    return {
      id: t.id,
      label: t.label,
      folder_group: t.folder_group,
      linked_indicator_numbers: t.linked_indicator_numbers ?? [],
      sort_order: t.sort_order,
      generated: generatedRow?.status === "generated",
      generated_at: generatedRow?.generated_at ?? null,
    };
  });
}

export type GeneratedDocumentForZip = {
  document_template_id: string;
  label: string;
  folder_group: string;
  sort_order: number;
  storage_path: string;
};

/**
 * Liste les PDF déjà générés et mis en cache dans Storage (cf. migration
 * 0031, colonne documents.pdf_url réutilisée comme chemin de stockage) —
 * alimente le pack documentaire ZIP (lib/documents/zip.ts). Ne renvoie que
 * les documents ayant réellement une copie en Storage : un document jamais
 * téléchargé n'a pas de pdf_url et n'apparaît donc pas dans le ZIP, plutôt
 * que d'échouer ou de le régénérer à la volée (cohérent avec le principe
 * "le ZIP reflète ce qui a déjà été généré", pas "génère tout d'un coup").
 */
export async function getGeneratedDocumentsForZip(): Promise<GeneratedDocumentForZip[] | { error: string }> {
  const org = await getMyOrganization();
  if (!org) return { error: "Organisme introuvable." };

  const supabase = await createClient();

  const { data: docsData, error: docsError } = await supabase
    .from("documents")
    .select("document_template_id, pdf_url")
    .eq("organization_id", org.id)
    .eq("status", "generated")
    .not("pdf_url", "is", null);

  if (docsError) {
    return { error: "Erreur lors du chargement des documents générés : " + docsError.message };
  }
  if (!docsData || docsData.length === 0) return [];

  const pathByTemplateId = new Map(docsData.map((d) => [d.document_template_id, d.pdf_url as string]));

  const { data: templatesData, error: templatesError } = await supabase
    .from("document_templates")
    .select("id, label, folder_group, sort_order")
    .in("id", Array.from(pathByTemplateId.keys()));

  if (templatesError) {
    return { error: "Erreur lors du chargement des modèles : " + templatesError.message };
  }

  return (templatesData ?? [])
    .map((t) => ({
      document_template_id: t.id,
      label: t.label,
      folder_group: t.folder_group,
      sort_order: t.sort_order,
      storage_path: pathByTemplateId.get(t.id)!,
    }))
    .sort((a, b) => (a.folder_group < b.folder_group ? -1 : a.folder_group > b.folder_group ? 1 : a.sort_order - b.sort_order));
}
