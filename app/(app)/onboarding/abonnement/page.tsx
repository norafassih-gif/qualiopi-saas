import { redirect } from "next/navigation";
import { ShieldCheck, Lock, Undo2 } from "lucide-react";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyBilling } from "@/lib/actions/billing";
import { PlanPickerHero } from "@/components/billing/plan-picker-hero";
import { Reveal } from "@/components/marketing/reveal";
import { PageIllustration } from "@/components/marketing/page-illustration";
import { MarketingFooter } from "@/components/marketing/footer";

/**
 * Paywall obligatoire avant de renseigner l'entreprise — décision de Nora du
 * 21/08/2026 : plus personne ne doit pouvoir utiliser le logiciel sans avoir
 * payé. C'est la toute première étape après la création du compte (voir
 * lib/actions/auth.ts, qui envoie désormais tout le monde vers /dashboard,
 * lequel renvoie ici via requireActiveSubscription tant qu'aucun abonnement
 * actif n'existe). Le paiement crée automatiquement un organisme
 * "placeholder" (cf. lib/actions/billing.ts startCheckout) que l'étape
 * suivante (/onboarding/entreprise) complète avec les vraies informations.
 *
 * Habillage refait en Phase 21 (21/08/2026) : Nora a signalé, en testant le
 * tout premier parcours réel via Google, que cette page — le tout premier
 * écran vu par un nouveau client juste après son inscription — ressemblait à
 * un formulaire brut plutôt qu'à une vraie page de vente. Reprend désormais
 * l'habillage sombre + les cartes de la page publique /tarifs (via le
 * nouveau <PlanPickerHero />) plutôt que le <PlanPicker /> sobre resté en
 * place sur /parametres/abonnement (écran de gestion interne, pas un moment
 * de conversion, cf. components/billing/plan-picker.tsx).
 */
export default async function OnboardingAbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const { canceled } = await searchParams;

  const org = await getMyOrganization();
  const billing = org ? await getMyBilling() : null;

  if (billing?.subscription_status === "active") {
    redirect(org?.onboarding_company_completed ? "/dashboard" : "/onboarding/entreprise");
  }

  return (
    <div
      className="relative min-h-[calc(100vh-57px)] overflow-hidden"
      style={{ backgroundColor: "#ffffff", color: "#111827" }}
    >
      <PageIllustration />
      <main className="relative">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 md:pt-16">
          <Reveal>
            <div className="mx-auto max-w-3xl pb-10 text-center">
              <div className="mb-4 inline-flex items-center gap-3 pb-1 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
                <span className="bg-linear-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
                  Dernière étape avant de démarrer
                </span>
              </div>
              <h1 className="pb-4 text-3xl text-gray-900 md:text-4xl">
                <span className="font-extrabold">Choisissez votre formule</span>{" "}
                <span className="font-light text-gray-500">pour activer votre compte</span>
              </h1>
              <p className="text-lg text-gray-600">
                Votre compte est créé — il ne reste qu&apos;à choisir votre abonnement. Vous
                renseignerez les informations de votre organisme juste après.
              </p>
            </div>
          </Reveal>

          {canceled === "1" && (
            <Reveal>
              <div className="mx-auto mb-10 max-w-xl rounded-lg border border-amber-300 bg-amber-50 p-3 text-center text-sm text-amber-800">
                Paiement annulé — rien n&apos;a été débité. Choisissez une formule ci-dessous
                pour continuer.
              </div>
            </Reveal>
          )}

          <PlanPickerHero />

          <Reveal delay={200}>
            <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-600">
              <span className="inline-flex items-center gap-2">
                <Lock className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                Paiement sécurisé par Stripe
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                Vos coordonnées bancaires ne sont jamais stockées par nos soins
              </span>
              <span className="inline-flex items-center gap-2">
                <Undo2 className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                Vous pouvez annuler avant de confirmer le paiement
              </span>
            </div>
          </Reveal>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
