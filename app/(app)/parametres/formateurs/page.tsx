import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyTrainers, saveTrainer, deleteTrainer, type OrgTrainer } from "@/lib/actions/trainers";

function Field({ label, name, defaultValue, hint }: { label: string; name: string; defaultValue?: string | null; hint?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input name={name} defaultValue={defaultValue ?? ""} className="rounded-md border border-gray-300 px-3 py-2" />
      {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
    </label>
  );
}

function Area({ label, name, defaultValue, hint }: { label: string; name: string; defaultValue?: string | null; hint?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <textarea name={name} rows={4} defaultValue={defaultValue ?? ""} className="rounded-md border border-gray-300 px-3 py-2" />
      {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
    </label>
  );
}

function TrainerForm({ trainer, managerName }: { trainer?: Partial<OrgTrainer>; managerName?: string | null }) {
  return (
    <form action={saveTrainer} className="flex flex-col gap-3">
      {trainer?.id ? <input type="hidden" name="id" value={trainer.id} /> : null}
      <Field label="Nom et prénom" name="full_name" defaultValue={trainer?.full_name ?? managerName ?? ""} />
      <Field label="Fonction" name="role" defaultValue={trainer?.role} hint="Exemple : Dirigeante et formatrice." />
      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_manager" defaultChecked={trainer?.is_manager ?? Boolean(managerName && !trainer)} />
          C&apos;est le/la dirigeant(e)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_subcontracted" defaultChecked={trainer?.is_subcontracted ?? false} />
          Intervient en sous-traitance
        </label>
      </div>
      <Field
        label="Statut (facultatif)"
        name="link_type"
        defaultValue={trainer?.link_type}
        hint="Laissez vide pour le/la dirigeant(e) : le statut est déduit de votre forme juridique et reste identique dans les « Documents contractuels »."
      />
      <div className="grid grid-cols-2 gap-4">
        <Field label="E-mail professionnel" name="email" defaultValue={trainer?.email} />
        <Field label="Téléphone" name="phone" defaultValue={trainer?.phone} />
      </div>
      <Field label="Domaines d'intervention" name="domains" defaultValue={trainer?.domains} hint="Les thèmes que cette personne anime." />
      <Area label="Diplômes et titres" name="diplomas" defaultValue={trainer?.diplomas} hint="Une ligne par diplôme : année, intitulé, établissement. Les mêmes que sur les copies jointes." />
      <Area label="Expérience professionnelle" name="experience" defaultValue={trainer?.experience} hint="Une ligne par poste : période, fonction, structure, missions." />
      <Area label="Compétences mobilisées" name="skills" defaultValue={trainer?.skills} hint="Les compétences en lien avec la formation dispensée." />
      <Area label="Expérience de l'animation" name="animation_experience" defaultValue={trainer?.animation_experience} />
      <Area label="Formation continue" name="continuing_training" defaultValue={trainer?.continuing_training} hint="Formations, webinaires, certifications suivis, avec leurs dates." />
      <button type="submit" className="self-start rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
        Enregistrer
      </button>
    </form>
  );
}

export default async function FormateursPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; edit?: string }>;
}) {
  const org = await getMyOrganization();
  if (!org) redirect("/onboarding/entreprise");
  const trainers = await getMyTrainers();
  const { saved, error, edit } = await searchParams;
  const editing = trainers.find((t) => t.id === edit);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Mes formateurs</h1>
      <p className="mb-6 text-sm text-gray-600">
        Ces informations alimentent automatiquement la « Liste des formateurs » et les « Documents contractuels » de votre
        dossier de déclaration d&apos;activité. Saisissez uniquement ce qui figure sur le CV et les diplômes que vous joignez.
      </p>
      {saved === "1" && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">Enregistré.</div>
      )}
      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error === "nom" ? "Le nom et prénom est requis." : "L'enregistrement a échoué, réessayez."}
        </div>
      )}

      {trainers.length > 0 && !editing && (
        <ul className="mb-8 space-y-2">
          {trainers.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-gray-200 bg-white p-3 text-sm">
              <span>
                <strong>{t.full_name}</strong>
                {t.role ? <span className="text-gray-600"> · {t.role}</span> : null}
                {!t.diplomas ? <span className="ml-2 text-xs text-amber-700">diplômes à compléter</span> : null}
              </span>
              <span className="flex gap-3">
                <a href={`/parametres/formateurs?edit=${t.id}`} className="text-blue-900 underline">Modifier</a>
                <form action={deleteTrainer}>
                  <input type="hidden" name="id" value={t.id} />
                  <button type="submit" className="text-red-700 underline">Supprimer</button>
                </form>
              </span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-3 text-lg font-semibold">{editing ? `Modifier ${editing.full_name}` : trainers.length ? "Ajouter un formateur" : "Mon premier formateur"}</h2>
      <TrainerForm trainer={editing} managerName={trainers.length === 0 ? org.manager_name : null} />

      <a href="/nda" className="mt-6 inline-block text-sm text-blue-900 underline">← Retour à mon dossier NDA</a>
    </div>
  );
}
