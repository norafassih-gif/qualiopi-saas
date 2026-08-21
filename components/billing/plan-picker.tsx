import { isPlanPurchasable } from "@/lib/stripe/client";
import { SubscribeButton } from "@/app/(app)/parametres/abonnement/subscribe-button";

/**
 * Les 3 formules d'abonnement, factorisées pour être affichées à deux
 * endroits : /parametres/abonnement (changement de formule pour un client
 * déjà en place) et /onboarding/abonnement (paiement obligatoire avant de
 * renseigner l'entreprise, décision de Nora du 21/08/2026).
 */
export function PlanPicker() {
  return (
    <div className="space-y-6">
      {isPlanPurchasable("documents") && (
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="mb-1 font-medium text-gray-900">1 — Documents</p>
          <p className="mb-3 text-sm text-gray-600">
            Dossier de preuve Qualiopi généré automatiquement.
          </p>
          <SubscribeButton plan="documents" label="S'abonner — 29 €/mois" />
        </div>
      )}

      {isPlanPurchasable("documents_site") && (
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="mb-1 font-medium text-gray-900">2 — Documents + Site</p>
          <p className="mb-3 text-sm text-gray-600">
            Dossier de preuve Qualiopi + site internet de votre organisme.{" "}
            <span className="italic text-amber-700">
              Le générateur de site est en cours de construction — inclus dans votre
              abonnement dès sa mise en ligne.
            </span>
          </p>
          <SubscribeButton plan="documents_site" label="S'abonner — 75 €/mois" showBrandingAddon />
        </div>
      )}

      {isPlanPurchasable("tout_compris") && (
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="mb-1 font-medium text-gray-900">3 — Tout compris + LMS</p>
          <p className="mb-3 text-sm text-gray-600">
            Documents + Site + plateforme de formation en ligne (espace apprenant, quiz,
            attestations).{" "}
            <span className="italic text-amber-700">
              Le site et le LMS sont en cours de construction — inclus dans votre abonnement
              dès leur mise en ligne.
            </span>
          </p>
          <SubscribeButton plan="tout_compris" label="S'abonner — 129 €/mois" showBrandingAddon />
        </div>
      )}
    </div>
  );
}
