import { redirect } from "next/navigation";
import { Lock, Sparkles } from "lucide-react";
import { getMyOrganization } from "@/lib/actions/organization";
import { requireActiveSubscription, getMyBilling } from "@/lib/actions/billing";
import { isPlatformAdmin } from "@/lib/actions/admin";
import { BrandingForm } from "./form";

export default async function IdentiteVisuellePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  // Paiement obligatoire avant d'utiliser le logiciel (décision de Nora, 21/08/2026).
  await requireActiveSubscription();

  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }
  const { saved } = await searchParams;

  // Personnalisation des documents (logo, cachet, signature, couleurs,
  // police) réservée à l'add-on "document personnalisé" (+5 €/mois,
  // migration 0041, demande de Nora du 24/08/2026) — même garde-fou que
  // lib/engine/document-builder.ts (applyPersonalizationGate) et
  // lib/actions/branding.ts (updateBranding), ici côté affichage : sans
  // l'option, cette page montre un écran verrouillé plutôt que le
  // formulaire. Administrateurs plateforme exemptés (mêmes raisons).
  const admin = await isPlatformAdmin();
  const billing = admin ? null : await getMyBilling();
  const isPersonalizationUnlocked = admin || billing?.has_personalization_addon === true;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Identité visuelle</h1>
      <p className="mb-6 text-sm text-gray-600">
        Votre logo, vos couleurs et votre police apparaissent automatiquement sur
        tous les documents PDF générés (programme, convention, attestations…) —
        rien à refaire document par document.
      </p>
      {saved === "1" && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Enregistré. Vos prochains documents générés utiliseront cette identité visuelle.
        </div>
      )}

      {isPersonalizationUnlocked ? (
        <BrandingForm org={org} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
            <Lock className="h-4 w-4 text-gray-500" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-700">
              Option &laquo;&nbsp;document personnalisé&nbsp;&raquo; non activée
            </p>
          </div>
          <div className="space-y-4 p-6">
            <p className="text-sm text-gray-600">
              Avec votre formule actuelle, vos documents utilisent la mise en page standard
              (sans logo, cachet ni signature) — à imprimer, signer à la main et tamponner
              vous-même.
            </p>
            <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Document personnalisé — +5 €/mois
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Débloque votre logo, votre cachet, votre signature électronique, vos couleurs et
                  votre police sur tous les documents générés, avec datation automatique.
                </p>
              </div>
            </div>
            <a
              href="/parametres/abonnement"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Activer l&apos;option depuis Abonnement
            </a>
          </div>
        </div>
      )}

      <a href="/dashboard" className="mt-6 inline-block text-sm text-blue-900 underline">
        ← Retour au tableau de bord
      </a>
    </div>
  );
}
