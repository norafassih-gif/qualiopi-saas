import { requireAdmin, listCategories, listModules } from "@/lib/actions/admin";

export default async function AdminModulesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; created?: string; saved?: string }>;
}) {
  await requireAdmin();
  const { category, created, saved } = await searchParams;
  const categories = await listCategories();
  const modules = await listModules(category);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Modules</h1>
      <p className="mb-6 text-sm text-gray-600">
        Les modules de programme proposés par domaine de formation (ex. &quot;Créer des contenus
        adaptés aux réseaux sociaux&quot;).
      </p>
      {(created === "1" || saved === "1") && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Enregistré.
        </div>
      )}

      <form className="mb-6 flex gap-3" method="get">
        <select name="category" defaultValue={category ?? ""} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md border border-gray-300 px-3 py-2 text-sm">
          Filtrer
        </button>
      </form>

      <div className="mb-8 flex flex-col gap-2">
        {modules.length === 0 && <p className="text-sm text-gray-500">Aucun module.</p>}
        {modules.map((m) => (
          <a
            key={m.id}
            href={`/admin/modules/${m.id}?category=${category ?? ""}`}
            className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-900"
          >
            <div>
              <p className="text-xs text-gray-400">{m.code}</p>
              <p className="text-sm text-gray-900">{m.title}</p>
            </div>
            <span className="text-xs text-gray-500">
              {m.default_duration_hours ? `${m.default_duration_hours} h` : ""} {!m.is_active && "— ❌ désactivé"}
            </span>
          </a>
        ))}
      </div>

      <details className="rounded-lg border border-gray-200 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-gray-900">+ Ajouter un module</summary>
        <div className="mt-4">
          <a href={`/admin/modules/nouveau${category ? `?category=${category}` : ""}`} className="text-sm text-blue-900 underline">
            Ouvrir le formulaire de création →
          </a>
        </div>
      </details>

      <a href="/admin" className="mt-6 inline-block text-sm text-blue-900 underline">
        ← Retour au back-office
      </a>
    </div>
  );
}
