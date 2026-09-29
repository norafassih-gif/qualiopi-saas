import {
  listOrgChartEntries,
  addOrgChartEntry,
  deleteOrgChartEntry,
} from "@/lib/actions/org-chart";

export const dynamic = "force-dynamic";

const LEVEL_LABELS: Record<number, string> = {
  1: "Direction",
  2: "Fonctions rattachées",
  3: "Appuis et intervenants",
};

export default async function OrganigrammePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const entries = await listOrgChartEntries();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Mon organigramme</h1>
      <p className="mt-1 text-sm text-gray-600">
        Saisissez une ligne par personne et par fonction. Le schéma est généré
        automatiquement dans le document « Organigramme fonctionnel et fiches de poste ».
        Si une personne occupe plusieurs fonctions, créez une ligne par fonction : son nom
        apparaîtra dans chaque case, ce qui est normal et attendu en audit.
      </p>

      {params.saved ? (
        <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
          Ligne ajoutée à votre organigramme.
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          Le nom et la fonction sont obligatoires.
        </p>
      ) : null}

      <form action={addOrgChartEntry} className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-medium text-gray-900">Ajouter une personne</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="text-gray-700">Nom et prénom</span>
            <input
              name="person_name"
              required
              placeholder="MAZOUZ Iman"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-gray-700">Fonction</span>
            <input
              name="function_label"
              required
              placeholder="Référent qualité"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-gray-700">Niveau dans le schéma</span>
            <select
              name="level"
              defaultValue="2"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="1">1 — Direction (en haut)</option>
              <option value="2">2 — Fonctions rattachées</option>
              <option value="3">3 — Appuis et intervenants</option>
            </select>
          </label>
        </div>
        <button
          type="submit"
          className="mt-5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Ajouter au schéma
        </button>
      </form>

      <div className="mt-8 space-y-6">
        {[1, 2, 3].map((level) => {
          const rows = entries.filter((e) => e.level === level);
          if (rows.length === 0) return null;
          return (
            <div key={level}>
              <h3 className="text-sm font-medium text-gray-500">{LEVEL_LABELS[level]}</h3>
              <ul className="mt-2 space-y-2">
                {rows.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
                  >
                    <span className="text-sm text-gray-800">
                      <span className="font-medium">{entry.function_label}</span>
                      {" — "}
                      {entry.person_name}
                    </span>
                    <form action={deleteOrgChartEntry}>
                      <input type="hidden" name="id" value={entry.id} />
                      <button type="submit" className="text-xs text-gray-400 hover:text-red-600">
                        Supprimer
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {entries.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
            Aucune ligne pour l&apos;instant. Tant que cet écran est vide, le schéma est construit
            à partir du dirigeant et des référents saisis dans « Mes informations qualité ».
          </p>
        ) : null}
      </div>
    </div>
  );
}
