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
