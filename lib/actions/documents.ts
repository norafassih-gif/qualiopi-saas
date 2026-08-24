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

  // Un même modèle "par apprenant" (STUDENT_SCOPED_TEMPLATE_IDS, cf.
  // lib/engine/document-variables.ts) peut désormais avoir PLUSIEURS lignes
  // en base — une par bénéficiaire de la session (migration 0044, Phase 29)
  // — alors que cette agrégation ne gardait jusqu'ici que la DERNIÈRE ligne
  // lue par document_template_id, dans un ordre non garanti (bug découvert
  // le 25/08/2026 lors du chantier "documents par apprenant"). Un modèle
  // est désormais marqué "généré" dès qu'AU MOINS UN bénéficiaire a une
  // ligne "generated", avec la date la plus récente parmi elles — plutôt que
  // de dépendre de l'ordre de retour de la requête.
  const aggByTemplateId = new Map<string, { anyGenerated: boolean; latestGeneratedAt: string | null }>();
  for (const row of documentsResponse.data ?? []) {
    const agg = aggByTemplateId.get(row.document_template_id) ?? { anyGenerated: false, latestGeneratedAt: null };
    if (row.status === "generated") {
      agg.anyGenerated = true;
      if (!agg.latestGeneratedAt || (row.generated_at && row.generated_at > agg.latestGeneratedAt)) {
        agg.latestGeneratedAt = row.generated_at;
      }
    }
    aggByTemplateId.set(row.document_template_id, agg);
  }

  return (templatesResponse.data ?? []).map((t) => {
    const agg = aggByTemplateId.get(t.id);
    return {
      id: t.id,
      label: t.label,
      folder_group: t.folder_group,
      linked_indicator_numbers: t.linked_indicator_numbers ?? [],
      sort_order: t.sort_order,
      generated: agg?.anyGenerated ?? false,
      generated_at: agg?.latestGeneratedAt ?? null,
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
    .select("document_template_id, pdf_url, beneficiary_id")
    .eq("organization_id", org.id)
    .eq("status", "generated")
    .not("pdf_url", "is", null);

  if (docsError) {
    return { error: "Erreur lors du chargement des documents générés : " + docsError.message };
  }
  if (!docsData || docsData.length === 0) return [];

  // Un même modèle "par apprenant" (STUDENT_SCOPED_TEMPLATE_IDS) peut avoir
  // PLUSIEURS lignes générées — une par bénéficiaire de la session
  // (migration 0044, Phase 29). Cette fonction ne gardait jusqu'ici qu'UNE
  // seule ligne par document_template_id (Map indexée uniquement sur
  // l'id du modèle), écrasant silencieusement les autres bénéficiaires : le
  // ZIP ne contenait donc jamais qu'un seul exemplaire des documents "par
  // apprenant" (bug découvert le 25/08/2026 lors du chantier "documents par
  // apprenant"). On garde désormais CHAQUE ligne — une entrée = un fichier
  // PDF distinct en Storage — et on distingue leur libellé par le nom du
  // bénéficiaire pour que le ZIP contienne bien un fichier par apprenant.
  const beneficiaryIds = Array.from(
    new Set(docsData.map((d) => d.beneficiary_id).filter((id): id is string => !!id))
  );
  const beneficiaryNameById = new Map<string, string>();
  if (beneficiaryIds.length > 0) {
    const { data: beneficiariesData } = await supabase
      .from("beneficiaries")
      .select("id, full_name")
      .in("id", beneficiaryIds);
    for (const b of beneficiariesData ?? []) {
      beneficiaryNameById.set(b.id, b.full_name);
    }
  }

  const templateIds = Array.from(new Set(docsData.map((d) => d.document_template_id)));
  const { data: templatesData, error: templatesError } = await supabase
    .from("document_templates")
    .select("id, label, folder_group, sort_order")
    .in("id", templateIds);

  if (templatesError) {
    return { error: "Erreur lors du chargement des modèles : " + templatesError.message };
  }
  const templateById = new Map((templatesData ?? []).map((t) => [t.id, t]));

  return docsData
    .map((d) => {
      const template = templateById.get(d.document_template_id);
      if (!template || !d.pdf_url) return null;
      const beneficiaryName = d.beneficiary_id ? beneficiaryNameById.get(d.beneficiary_id) : null;
      return {
        document_template_id: d.document_template_id,
        label: beneficiaryName ? `${template.label} — ${beneficiaryName}` : template.label,
        folder_group: template.folder_group,
        sort_order: template.sort_order,
        storage_path: d.pdf_url as string,
      };
    })
    .filter((d): d is GeneratedDocumentForZip => d !== null)
    .sort((a, b) => (a.folder_group < b.folder_group ? -1 : a.folder_group > b.folder_group ? 1 : a.sort_order - b.sort_order));
}
