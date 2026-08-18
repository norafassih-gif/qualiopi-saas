import { requireAdmin, listCategories, listRules, toggleRuleActive } from "@/lib/actions/admin";

export default async function AdminRulesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  await requireAdmin();
  const { category } = await searchParams;
  const categories = await listCategories();
  const rules = await listRules(category);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Règles</h1>
      <p className="mb-6 text-sm text-gray-600">
        Le moteur qui décide, selon les réponses de l&apos;utilisateur, quels modules et blocs de
        contenu ajouter au programme. Pour ce premier back-office, vous pouvez activer/désactiver
        une règle existante — la modification des conditions/actions reste à faire avec moi pour
        l&apos;instant (pour éviter qu&apos;une erreur de syntaxe casse le moteur).
      </p>

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

      <div className="flex flex-col gap-2">
        {rules.length === 0 && <p className="text-sm text-gray-500">Aucune règle.</p>}
        {rules.map((r) => (
          <details key={r.id} className="rounded-lg border border-gray-200 px-4 py-3">
            <summary className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-gray-900">
                {r.label} {!r.is_active && <span className="text-xs text-gray-500">— ❌ désactivée</span>}
              </span>
              <form action={toggleRuleActive.bind(null, r.id, !r.is_active)}>
                <button
                  type="submit"
                  className={`rounded-md px-3 py-1 text-xs ${r.is_active ? "border border-gray-300" : "bg-blue-900 text-white"}`}
                >
                  {r.is_active ? "Désactiver" : "Activer"}
                </button>
              </form>
            </summary>
            <div className="mt-3 flex flex-col gap-2 text-xs text-gray-600">
              {r.justification && <p>{r.justification}</p>}
              <div>
                <p className="font-semibold text-gray-500">Conditions</p>
                <pre className="overflow-x-auto rounded bg-gray-50 p-2">{JSON.stringify(r.conditions, null, 2)}</pre>
              </div>
              <div>
                <p className="font-semibold text-gray-500">Actions</p>
                <pre className="overflow-x-auto rounded bg-gray-50 p-2">{JSON.stringify(r.actions, null, 2)}</pre>
              </div>
            </div>
          </details>
        ))}
      </div>

      <a href="/admin" className="mt-8 inline-block text-sm text-blue-900 underline">
        ← Retour au back-office
      </a>
    </div>
  );
}
