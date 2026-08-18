import { requireAdmin, listDocumentTemplatesAdmin, toggleDocumentTemplateActive } from "@/lib/actions/admin";

export default async function AdminDocumentsPage() {
  await requireAdmin();
  const templates = await listDocumentTemplatesAdmin();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Modèles de documents</h1>
      <p className="mb-6 text-sm text-gray-600">
        Cliquez sur un document pour modifier le texte de ses sections — c&apos;est exactement ce
        contenu qui apparaît dans le PDF généré. Désactiver un modèle le retire de la liste
        &quot;Mes documents&quot; pour tous les organismes de la plateforme.
      </p>

      <div className="flex flex-col gap-2">
        {templates.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <a href={`/admin/documents/${t.id}`} className="text-sm text-gray-900 hover:underline">
              {t.label} <span className="text-xs text-gray-400">({t.folder_group ?? "—"})</span>
              {!t.is_active && <span className="ml-2 text-xs text-gray-500">— ❌ désactivé</span>}
            </a>
            <form action={toggleDocumentTemplateActive.bind(null, t.id, !t.is_active)}>
              <button
                type="submit"
                className={`rounded-md px-3 py-1 text-xs ${t.is_active ? "border border-gray-300" : "bg-blue-900 text-white"}`}
              >
                {t.is_active ? "Désactiver" : "Activer"}
              </button>
            </form>
          </div>
        ))}
      </div>

      <a href="/admin" className="mt-8 inline-block text-sm text-blue-900 underline">
        ← Retour au back-office
      </a>
    </div>
  );
}
