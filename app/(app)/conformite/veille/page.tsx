import Link from "next/link";
import {
  listWatchAxes,
  listWatchEntries,
  addWatchEntry,
  deleteWatchEntry,
  type WatchEntry,
} from "@/lib/actions/watch";

export const dynamic = "force-dynamic";

function countMaxEntriesSameDay(entries: WatchEntry[]): number {
  const byDay = new Map<string, number>();
  for (const entry of entries) {
    const day = (entry.created_at || "").slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  let max = 0;
  for (const count of byDay.values()) {
    if (count > max) max = count;
  }
  return max;
}

function isStale(entries: WatchEntry[]): boolean {
  if (entries.length === 0) return true;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return entries[0].consulted_on < sixMonthsAgo.toISOString().slice(0, 10);
}

export default async function VeillePage({
  searchParams,
}: {
  searchParams: Promise<{ axe?: string; saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const axes = await listWatchAxes();
  const currentAxis = axes.find((a) => a.id === params.axe) ?? axes[0] ?? null;
  const entries = currentAxis ? await listWatchEntries(currentAxis.id) : [];
  const today = new Date().toISOString().slice(0, 10);
  const stale = isStale(entries);
  const sameDay = countMaxEntriesSameDay(entries);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Ma veille</h1>
      <p className="mt-1 text-sm text-gray-600">
        Vos registres de veille. Ils alimentent les procedures de veille generees en PDF : ce que
        vous saisissez ici est ce que l&apos;auditeur lira.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {axes.map((axis) => (
          <Link
            key={axis.id}
            href={"/conformite/veille?axe=" + axis.id}
            className={
              "rounded-full border px-4 py-2 text-sm " +
              (currentAxis && axis.id === currentAxis.id
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400")
            }
          >
            {axis.label}
            <span className="ml-2 opacity-70">indicateur {axis.indicator_number}</span>
          </Link>
        ))}
      </div>

      {params.saved ? (
        <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
          Entree de veille enregistree.
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          L&apos;entree n&apos;a pas pu etre enregistree. Verifiez la source, le titre et ce que
          vous en retenez.
        </p>
      ) : null}

      {currentAxis && stale ? (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          Indicateur {currentAxis.indicator_number} : aucune veille enregistree depuis 6 mois.
          C&apos;est la non-conformite la plus frequente en audit.
        </p>
      ) : null}
      {sameDay > 3 ? (
        <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Vos preuves sont concentrees sur une seule date. L&apos;auditeur evalue la regularite :
          etalez vos saisies dans le temps.
        </p>
      ) : null}

      {currentAxis ? (
        <form action={addWatchEntry} className="mt-8 rounded-lg border border-gray-200 bg-white p-5">
          <input type="hidden" name="axis_id" value={currentAxis.id} />
          <h2 className="text-lg font-medium text-gray-900">Ajouter une veille</h2>
          <p className="mt-1 text-sm text-gray-500">
            Six champs, moins d&apos;une minute. Le plus important est le dernier : ce que vous
            changez grace a cette veille.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-gray-700">Source</span>
              <input
                name="source_name"
                required
                placeholder="France Competences, Centre Inffo, OPCO..."
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-gray-700">Lien (facultatif)</span>
              <input
                name="source_url"
                type="url"
                placeholder="https://..."
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-gray-700">Titre de ce que vous avez lu ou suivi</span>
              <input
                name="title"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-gray-700">Date de consultation</span>
              <input
                name="consulted_on"
                type="date"
                defaultValue={today}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-gray-700">Ce que vous en retenez</span>
              <textarea
                name="summary"
                required
                rows={2}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-gray-700">
                Ce que vous changez dans votre organisme (facultatif, mais c&apos;est ce que
                l&apos;auditeur regarde)
              </span>
              <textarea
                name="action_taken"
                rows={2}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Enregistrer cette veille
          </button>
        </form>
      ) : null}

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Registre</h2>

        {entries.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
            Aucune entree pour l&apos;instant. La premiere se saisit en moins d&apos;une minute.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {entries.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900">{entry.title}</span>
                  <span className="text-xs text-gray-500">{entry.consulted_on}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {entry.source_name}
                  {entry.source_url ? " - " + entry.source_url : ""}
                </p>
                <p className="mt-2 text-sm text-gray-700">{entry.summary}</p>
                {entry.action_taken ? (
                  <p className="mt-2 text-sm text-gray-700">
                    <span className="font-medium">Action menee : </span>
                    {entry.action_taken}
                  </p>
                ) : (
                  <p className="mt-2 inline-block rounded bg-amber-50 px-2 py-1 text-xs text-amber-900">
                    A exploiter : cette veille n&apos;a debouche sur aucune action.
                  </p>
                )}
                <form action={deleteWatchEntry} className="mt-3">
                  <input type="hidden" name="id" value={entry.id} />
                  <input type="hidden" name="axis_id" value={entry.axis_id} />
                  <button type="submit" className="text-xs text-gray-400 hover:text-red-600">
                    Supprimer
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
