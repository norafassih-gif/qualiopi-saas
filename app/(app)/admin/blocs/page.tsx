import { requireAdmin, listCategories, listContentBlocks } from "@/lib/actions/admin";

export default async function AdminBlocsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string; q?: string; created?: string; saved?: string }>;
}) {
  await requireAdmin();
  const { category, type, q, created, saved } = await searchParams;
  const categories = await listCategories();
  const blocks = await listContentBlocks({ categoryId: category, type, search: q });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Blocs de contenu</h1>
      <p className="mb-6 text-sm text-gray-600">
        Objectifs pédagogiques, exemples, méthodes, questions de positionnement... la banque de
        contenu utilisée pour construire automatiquement les programmes et documents. 200
        premiers résultats affichés — filtrez pour affiner.
      </p>
      {(created === "1" || saved === "1") && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Enregistré.
        </div>
      )}

      <form className="mb-6 grid grid-cols-3 gap-3" method="get">
        <select name="category" defaultValue={category ?? ""} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
          <option value="">Toutes catégories</option>
          <option value="__global__">Transverse (sans catégorie)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          name="type"
          defaultValue={type ?? ""}
          placeholder="Type (ex. pedagogical_objective)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Rechercher dans le texte..."
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="col-span-3 rounded-md border border-gray-300 px-3 py-2 text-sm">
          Filtrer
        </button>
      </form>

      <div className="mb-8 flex flex-col gap-2">
        {blocks.length === 0 && <p className="text-sm text-gray-500">Aucun résultat.</p>}
        {blocks.map((b) => (
          <a
            key={b.id}
            href={`/admin/blocs/${b.id}?category=${category ?? ""}`}
            className="rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-900"
          >
            <p className="mb-1 text-xs text-gray-400">
              {b.code} — {b.type} {!b.is_active && "— ❌ désactivé"}
            </p>
            <p className="text-sm text-gray-900">{b.text.length > 160 ? b.text.slice(0, 160) + "…" : b.text}</p>
          </a>
        ))}
      </div>

      <details className="rounded-lg border border-gray-200 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-gray-900">+ Ajouter un bloc de contenu</summary>
        <div className="mt-4">
          <a href={`/admin/blocs/nouveau${category ? `?category=${category}` : ""}`} className="text-sm text-blue-900 underline">
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
