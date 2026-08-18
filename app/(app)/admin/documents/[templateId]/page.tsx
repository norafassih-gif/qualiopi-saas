import Link from "next/link";
import { requireAdmin, listDocumentTemplateSections } from "@/lib/actions/admin";

export default async function AdminDocumentSectionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const { templateId } = await params;
  const { saved } = await searchParams;
  const sections = await listDocumentTemplateSections(templateId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Sections du document</h1>
      <p className="mb-6 text-sm text-gray-600">
        Cliquez sur une section pour modifier son texte. Les variables entre doubles accolades
        (ex. <code>{"{{company_name}}"}</code>) sont remplacées automatiquement par les vraies
        informations de l&apos;organisme à la génération — ne les supprimez pas par erreur.
      </p>
      {saved === "1" && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Enregistré.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`/admin/documents/${templateId}/${s.id}`}
            className="rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-900"
          >
            <p className="text-sm text-gray-900">{s.title}</p>
            <p className="text-xs text-gray-400">
              {s.code} — type : {s.content_type}
              {s.content_type !== "rich_text" && s.content_type !== "variable_block" && " (non éditable en texte libre ici)"}
            </p>
          </a>
        ))}
      </div>

      <Link href="/admin/documents" className="mt-8 inline-block text-sm text-blue-900 underline">
        ← Retour aux modèles de documents
      </Link>
    </div>
  );
}
