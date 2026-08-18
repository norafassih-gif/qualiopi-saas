import { requireAdmin, listCategories, createCategory } from "@/lib/actions/admin";
import { NewCategoryForm } from "./new-category-form";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; saved?: string }>;
}) {
  await requireAdmin();
  const categories = await listCategories();
  const { created, saved } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Catégories de formation</h1>
      <p className="mb-6 text-sm text-gray-600">
        Les 10 domaines proposés à l&apos;onboarding. Ajouter une catégorie ici ne crée pas
        automatiquement ses modules/objectifs/règles — il faudra les ajouter séparément
        (onglets Blocs de contenu, Modules, Règles) pour qu&apos;elle soit utilisable.
      </p>
      {(created === "1" || saved === "1") && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Enregistré.
        </div>
      )}

      <div className="mb-8 flex flex-col gap-2">
        {categories.map((c) => (
          <a
            key={c.id}
            href={`/admin/categories/${c.id}`}
            className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-900"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">
                {c.label} <span className="text-xs text-gray-400">({c.id})</span>
              </p>
              {c.description && <p className="text-xs text-gray-500">{c.description}</p>}
            </div>
            <span className="text-xs text-gray-500">{c.is_active ? "✅ Active" : "❌ Désactivée"}</span>
          </a>
        ))}
      </div>

      <details className="rounded-lg border border-gray-200 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-gray-900">
          + Ajouter une catégorie
        </summary>
        <div className="mt-4">
          <NewCategoryForm action={createCategory} />
        </div>
      </details>

      <a href="/admin" className="mt-6 inline-block text-sm text-blue-900 underline">
        ← Retour au back-office
      </a>
    </div>
  );
}
