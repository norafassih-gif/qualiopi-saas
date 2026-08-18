import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstTraining } from "@/lib/actions/training";
import { listDocumentTemplatesWithStatus } from "@/lib/actions/documents";

const FOLDER_LABELS: Record<string, string> = {
  "03_Avant_formation": "Avant la formation",
  "04_Pendant_formation": "Pendant la formation",
  "05_Apres_formation": "Après la formation",
  "06_Procedures": "Procédures de fonctionnement",
  "07_Veille": "Veille",
  "08_Amelioration": "Amélioration continue",
};

const FOLDER_ORDER = [
  "03_Avant_formation",
  "04_Pendant_formation",
  "05_Apres_formation",
  "06_Procedures",
  "07_Veille",
  "08_Amelioration",
];

export default async function DocumentsPage() {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }
  const training = await getMyFirstTraining();
  if (!training) {
    redirect("/onboarding/activite");
  }

  const templates = await listDocumentTemplatesWithStatus();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Mes documents</h1>
      <p className="mb-4 text-sm text-gray-600">
        Tous les documents que le logiciel peut générer pour votre dossier Qualiopi,
        sans intelligence artificielle — uniquement notre banque de contenus, vos
        informations d&apos;organisme et notre moteur de règles.
      </p>

      {!("error" in templates) && templates.some((t) => t.generated) && (
        // Lien de téléchargement de fichier (pas une page interne) : <a> natif est volontaire ici, pas next/link.
        // eslint-disable-next-line @next/next/no-html-link-for-pages
        <a
          href="/api/documents/zip"
          className="mb-6 inline-block rounded-md bg-blue-900 px-4 py-2 text-sm text-white"
        >
          Télécharger mon dossier (ZIP)
        </a>
      )}

      {"error" in templates ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{templates.error}</p>
      ) : (
        <div className="flex flex-col gap-8">
          {FOLDER_ORDER.map((folder) => {
            const docs = templates.filter((t) => t.folder_group === folder);
            if (docs.length === 0) return null;
            return (
              <div key={folder}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  {FOLDER_LABELS[folder] ?? folder}
                </h2>
                <div className="flex flex-col gap-2">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.label}</p>
                        {doc.linked_indicator_numbers.length > 0 && (
                          <p className="text-xs text-gray-500">
                            Indicateur{doc.linked_indicator_numbers.length > 1 ? "s" : ""} Qualiopi{" "}
                            {doc.linked_indicator_numbers.join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          {doc.generated ? "✅ Généré" : "❌ Non généré"}
                        </span>
                        {/* Lien de téléchargement de fichier (pas une page interne) : <a> natif est volontaire ici, pas next/link. */}
                        <a
                          href={`/api/documents/${doc.id}`}
                          className="rounded-md bg-blue-900 px-3 py-1.5 text-xs text-white"
                        >
                          Télécharger le PDF
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <a href="/dashboard" className="mt-8 inline-block text-sm text-blue-900 underline">
        ← Retour au tableau de bord
      </a>
    </div>
  );
}
