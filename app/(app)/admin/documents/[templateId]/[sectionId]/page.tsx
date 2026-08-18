import { redirect } from "next/navigation";
import { requireAdmin, updateDocumentSectionHtml } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/server";
import { EditSectionForm } from "./edit-section-form";

export default async function EditDocumentSectionPage({
  params,
}: {
  params: Promise<{ templateId: string; sectionId: string }>;
}) {
  await requireAdmin();
  const { templateId, sectionId } = await params;

  const supabase = await createClient();
  const { data: section } = await supabase
    .from("document_template_sections")
    .select("id, document_template_id, code, title, sort_order, content_type, html_template")
    .eq("id", sectionId)
    .maybeSingle();

  if (!section) redirect(`/admin/documents/${templateId}`);

  const usesHtml = section.content_type === "rich_text" || section.content_type === "variable_block";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">{section.title}</h1>
      <p className="mb-6 text-sm text-gray-600">Code : {section.code} — type : {section.content_type}</p>

      {!usesHtml && (
        <div className="mb-6 rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
          Cette section est construite automatiquement par le moteur (type &quot;{section.content_type}&quot;) —
          modifier le texte ci-dessous n&apos;aura probablement aucun effet visible dans le document généré.
        </div>
      )}

      <EditSectionForm action={updateDocumentSectionHtml} section={section} />

      <a href={`/admin/documents/${templateId}`} className="mt-6 inline-block text-sm text-blue-900 underline">
        ← Retour aux sections
      </a>
    </div>
  );
}
