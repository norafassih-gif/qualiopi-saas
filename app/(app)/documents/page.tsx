import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { requireActiveSubscription } from "@/lib/actions/billing";
import { getMyFirstTraining } from "@/lib/actions/training";
import { getMyFirstSession, getMyFirstBeneficiary, listMyBeneficiaries } from "@/lib/actions/session";
import { listDocumentTemplatesWithStatus } from "@/lib/actions/documents";
import { getMyFirstPartner } from "@/lib/actions/partners";
import { STUDENT_SCOPED_TEMPLATE_IDS } from "@/lib/engine/document-variables";
import {
  getMissingRequiredFields,
  isPartnerInfoComplete,
  MISSING_FIELD_GROUP_LABELS,
  type MissingField,
  type MissingFieldGroup,
} from "@/lib/engine/data-completeness";
import { DocumentDownloadForm } from "./download-form";
import { GenerateAllButton } from "./generate-all-button";

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
  await requireActiveSubscription();

  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }
  const training = await getMyFirstTraining();
  if (!training) {
    redirect("/onboarding/activite");
  }

  const session = await getMyFirstSession();
  const beneficiaries = session ? await listMyBeneficiaries(session.id) : [];
  const principalBeneficiary = session ? await getMyFirstBeneficiary(session.id) : null;
  const studentScopedIds: readonly string[] = STUDENT_SCOPED_TEMPLATE_IDS;

  const templates = await listDocumentTemplatesWithStatus();

  // Alerte "informations manquantes" (demande de Nora, 24/08/2026, reprise
  // le 25/08/2026 : "je veux bien renseigner les informations manquantes,
  // mais il faut que le système me dise qu'elles sont manquantes") : ces
  // champs apparaîtront comme "[... à compléter]" dans les documents
  // générés — cf. lib/engine/data-completeness.ts pour le détail exact des
  // vérifications, qui reflètent lib/engine/document-variables.ts.
  const missingFields = getMissingRequiredFields(org, session, principalBeneficiary);

  // Sous-traitant / partenaire (cf. isPartnerInfoComplete) : volontairement
  // pas dans missingFields (un organisme sans sous-traitant/partenaire n'a
  // rien à y renseigner) — signalé directement sur les 2 cartes concernées.
  const [subcontractorPartner, businessPartner] = await Promise.all([
    getMyFirstPartner("sous_traitant"),
    getMyFirstPartner("partenaire"),
  ]);
  const subcontractorComplete = isPartnerInfoComplete(subcontractorPartner, "sous_traitant");
  const businessPartnerComplete = isPartnerInfoComplete(businessPartner, "partenaire");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Mes documents</h1>
      <p className="mb-4 text-sm text-gray-600">
        Tous les documents que le logiciel peut générer pour votre dossier Qualiopi,
        sans intelligence artificielle — uniquement notre banque de contenus, vos
        informations d&apos;organisme et notre moteur de règles.
      </p>

      <MissingFieldsBanner missing={missingFields} />

      {!("error" in templates) && templates.length > 0 && (
        <div className="mb-6">
          <GenerateAllButton templateIds={templates.map((t) => t.id)} />
          <p className="text-xs text-gray-500">
            Génère (ou régénère) chaque document, puis télécharge automatiquement le ZIP complet — utile
            après avoir complété des informations, ou après une mise à jour du logiciel.
          </p>
        </div>
      )}

      {!("error" in templates) && templates.some((t) => t.generated) && (
        // eslint-disable-next-line @next/next/no-html-link-for-pages
        <a
          href="/api/documents/zip"
          className="mb-6 inline-block rounded-md border border-blue-900 px-4 py-2 text-sm text-blue-900"
        >
          Télécharger mon dossier tel quel (ZIP)
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
                        {doc.id === "feuille_emargement" && (
                          <a href="/emargement" className="text-xs font-medium text-blue-900 underline">
                            ✍️ Faire signer les apprenants sur l&apos;écran →
                          </a>
                        )}
                        {doc.id === "contrat_sous_traitance" && !subcontractorComplete && (
                          <a href="/parametres/sous-traitant" className="text-xs font-medium text-amber-700 underline">
                            ⚠️ Informations du sous-traitant à compléter →
                          </a>
                        )}
                        {doc.id === "convention_partenariat" && !businessPartnerComplete && (
                          <a href="/parametres/partenaire" className="text-xs font-medium text-amber-700 underline">
                            ⚠️ Informations du partenaire à compléter →
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          {doc.generated ? "✅ Généré" : "❌ Non généré"}
                        </span>
                        <DocumentDownloadForm
                          templateId={doc.id}
                          beneficiaries={studentScopedIds.includes(doc.id) ? beneficiaries : []}
                        />
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

/**
 * Bannière "informations manquantes" — demande explicite de Nora
 * (24/08/2026) : "on devrait avoir une alerte dès qu'il manque quelque
 * chose qui n'est pas rempli pour pouvoir générer un document [...] on
 * parle d'un audit, c'est très sérieux" (reprend la demande déjà formulée
 * en Phase 30). Non bloquante : les documents restent générables tels
 * quels (avec leurs placeholders visibles), cette bannière sert seulement à
 * prévenir avant que Nora ne le découvre en relisant un PDF déjà généré.
 */
function MissingFieldsBanner({ missing }: { missing: MissingField[] }) {
  if (missing.length === 0) return null;

  const byGroup = new Map<MissingFieldGroup, MissingField[]>();
  for (const field of missing) {
    const list = byGroup.get(field.group) ?? [];
    list.push(field);
    byGroup.set(field.group, list);
  }

  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-amber-900">
            {missing.length} information{missing.length > 1 ? "s" : ""} non renseignée
            {missing.length > 1 ? "s" : ""}
          </p>
          <p className="mt-1 text-xs text-amber-800">
            Ces champs apparaîtront comme « [... à compléter] » dans vos documents générés — à corriger
            avant de présenter votre dossier à l&apos;audit.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {Array.from(byGroup.entries()).map(([group, fields]) => (
              <div key={group}>
                <Link href={fields[0].href} className="text-xs font-medium text-amber-900 underline">
                  {MISSING_FIELD_GROUP_LABELS[group]} →
                </Link>
                <p className="text-xs text-amber-800">{fields.map((f) => f.label).join(", ")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
