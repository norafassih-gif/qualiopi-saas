import { Check } from "lucide-react";
import { isPlanPurchasable } from "@/lib/stripe/client";
import { SubscribeButton } from "@/app/(app)/parametres/abonnement/subscribe-button";
import { Reveal } from "@/components/marketing/reveal";
import { Spotlight } from "@/components/marketing/spotlight";

type PlanCard = {
  plan: string;
  name: string;
  tagline: string;
  price: string;
  billingNote: string;
  features: string[];
  showBrandingAddon: boolean;
};

// Même contenu que la grille publique /tarifs (components/marketing/pricing-plans.tsx),
// pour que le message reste identique entre la page de vente et cet écran de
// paiement obligatoire post-inscription (Phase 20/21) — seul le prix affiché
// change de forme (bouton de paiement direct au lieu d'un lien "Créer mon compte",
// l'utilisateur ayant déjà un compte à ce stade).
const PLANS: PlanCard[] = [
  {
    plan: "documents",
    name: "Documents",
    tagline: "Votre dossier de preuve Qualiopi, généré automatiquement.",
    price: "29 €",
    billingNote: "par mois, engagement 12 mois",
    features: [
      "Questionnaire guidé, sans jargon Qualiopi",
      "Bibliothèque de contenu pour votre domaine de formation",
      "Programme, convention, émargement, procédures, évaluations…",
      "Téléchargement du dossier complet, classé et prêt pour l'audit",
      "Option : document personnalisé (logo, cachet, signature) +5 €/mois",
    ],
    showBrandingAddon: false,
  },
  {
    plan: "documents_site",
    name: "Documents + Site",
    tagline: "Votre dossier de preuve, et le site internet de votre organisme.",
    price: "75 €",
    billingNote: "par mois, engagement 12 mois",
    features: [
      "Tout ce qui est inclus dans la formule Documents",
      "Site vitrine généré à partir des mêmes informations",
      "Catalogue de formations, pages légales, accessibilité, contact…",
      "Option : document personnalisé (logo, cachet, signature) +5 €/mois",
      "Option : Logo + charte graphique sur-mesure (+18 €/mois)",
    ],
    showBrandingAddon: true,
  },
  {
    plan: "tout_compris",
    name: "Tout compris + LMS",
    tagline: "La formule complète, avec votre plateforme de formation en ligne.",
    price: "129 €",
    billingNote: "par mois, engagement 12 mois",
    features: [
      "Tout ce qui est inclus dans la formule Documents + Site",
      "Espace apprenant, quiz et évaluations interactives",
      "Contenus vidéo et attestations/certificats automatiques",
      "Statistiques de suivi pédagogique",
      "Option : document personnalisé (logo, cachet, signature) +5 €/mois",
      "Option : Logo + charte graphique sur-mesure (+18 €/mois)",
    ],
    showBrandingAddon: true,
  },
];

/**
 * Version "vitrine" des 3 formules, réservée à /onboarding/abonnement (le
 * paywall obligatoire juste après la création du compte, Phase 20) — reprend
 * exactement l'habillage de la grille publique /tarifs (cartes claires,
 * halo au survol, coche de fonctionnalités — thème blanc, Phase 23) pour que
 * ce premier écran après l'inscription soit aussi soigné qu'une vraie page de
 * vente, plutôt que le formulaire brut utilisé sur /parametres/abonnement
 * (écran interne, pas un moment de conversion). Le <PlanPicker /> plus sobre
 * reste utilisé tel quel sur /parametres/abonnement — cf.
 * components/billing/plan-picker.tsx.
 */
export function PlanPickerHero() {
  const plans = PLANS.filter((p) => isPlanPurchasable(p.plan));

  return (
    <Spotlight className="group mx-auto grid max-w-sm items-stretch gap-6 lg:max-w-none lg:grid-cols-3">
      {plans.map((plan, index) => (
        <Reveal key={plan.plan} delay={index * 120} className="h-full">
          <div className="group/card relative h-full overflow-hidden rounded-2xl bg-gray-200 p-px before:pointer-events-none before:absolute before:-left-40 before:-top-40 before:z-10 before:h-80 before:w-80 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:rounded-full before:bg-indigo-500/80 before:opacity-0 before:blur-3xl before:transition-opacity before:duration-500 group-hover:before:opacity-100">
            <div className="relative z-20 flex h-full flex-col overflow-hidden rounded-[inherit] bg-white p-6">
              <div className="relative flex h-full flex-col">
                <h2 className="mb-1 text-base font-semibold text-gray-900">{plan.name}</h2>
                <p className="mb-4 text-sm text-gray-600">{plan.tagline}</p>

                <p className="mb-1 text-2xl font-extrabold text-gray-900">{plan.price}</p>
                <p className="mb-5 text-xs text-gray-500">{plan.billingNote}</p>

                <ul className="mb-6 flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <SubscribeButton
                    plan={plan.plan}
                    label={`Choisir cette formule — ${plan.price}/mois`}
                    showBrandingAddon={plan.showBrandingAddon}
                    variant="dark"
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      ))}
    </Spotlight>
  );
}
