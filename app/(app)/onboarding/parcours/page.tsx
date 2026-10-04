import { FilePen, ShieldCheck, RefreshCcw } from "lucide-react";
import { getMyOrganization } from "@/lib/actions/organization";
import { chooseTrack } from "@/lib/actions/track";
import { TRACKS } from "@/lib/engine/tracks";

export const dynamic = "force-dynamic";

const ICONS = {
  nda: FilePen,
  qualiopi_initial: ShieldCheck,
  qualiopi_surveillance: RefreshCcw,
} as const;

/**
 * Premier écran après la création du compte : le client choisit ce qu'il
 * vient faire (NDA, audit initial, audit de surveillance). Reste accessible
 * ensuite pour changer de parcours (ex. « NDA obtenu, je passe à Qualiopi »).
 */
export default async function ParcoursPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const org = await getMyOrganization();
  const current = org?.current_track ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl text-gray-900">
          <span className="font-extrabold">Par quoi commençons-nous ?</span>
        </h1>
        <p className="mt-3 text-gray-600">
          Choisissez votre situation. Vos informations ne seront saisies qu&apos;une seule fois et
          resserviront pour la suite (vous pourrez changer de parcours à tout moment).
        </p>
      </div>

      {error ? (
        <p className="mx-auto mt-6 max-w-xl rounded-md bg-red-50 px-4 py-3 text-center text-sm text-red-800">
          Une erreur est survenue. Réessayez.
        </p>
      ) : null}

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {TRACKS.map((track) => {
          const Icon = ICONS[track.id];
          const isCurrent = current === track.id && org?.onboarding_company_completed;
          return (
            <form
              key={track.id}
              action={chooseTrack}
              className={`flex flex-col rounded-xl border bg-white p-6 shadow-sm ${
                isCurrent ? "border-blue-900 ring-2 ring-blue-900/20" : "border-gray-200"
              }`}
            >
              <input type="hidden" name="track" value={track.id} />
              <Icon className="h-8 w-8 text-blue-900" aria-hidden="true" />
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                {track.subtitle}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-gray-900">{track.title}</h2>
              <p className="mt-2 flex-1 text-sm text-gray-600">{track.description}</p>
              <button
                type="submit"
                className="mt-6 rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                {isCurrent ? "Continuer ce parcours" : "Choisir ce parcours"}
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
