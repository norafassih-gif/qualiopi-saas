import Link from "next/link";
import { Check, GraduationCap } from "lucide-react";
import { Reveal } from "./reveal";
import { Spotlight } from "./spotlight";

type Plan = {
  name: string;
  tagline: string;
  price: string;
  billingNote: string;
  features: string[];
  cta: { label: string; href: string } | null;
  available: boolean;
};

// Lien de contact pour l'offre "Accompagnement — sur devis" — en attendant
// que Nora crée un lien de prise de rendez-vous (Calendly ou équivalent), on
// pointe vers un mailto pré-rempli. À remplacer par le lien de calendrier dès
// qu'il existe (cf. claude/roadmap-produit-et-tarifs.md, tâche en cours).
const ACCOMPAGNEMENT_CONTACT_HREF =
  "mailto:nora.littlecreatrice@gmail.com?subject=Accompagnement%20Qualiopi%20%E2%80%94%20demande%20de%20devis";

const PLANS: Plan[] = [
  {
    name: "Documents",
    tagline: "Votre dossier de preuve Qualiopi, généré automatiquement.",
    price: "29 €",
    billingNote: "par mois, engagement 12 mois",
    features: [
      "Questionnaire guidé, sans jargon Qualiopi",
      "Bibliothèque de contenu pour votre domaine de formation",
      "Programme, convention, émargement, procédures, évaluations…",
      "Identité visuelle : logo, couleurs, police sur tous vos documents",
      "Téléchargement du dossier complet, classé et prêt pour l'audit",
      "Option : document personnalisé (logo, cachet, signature) +5 €/mois",
    ],
    cta: { label: "Créer mon compte", href: "/signup" },
    available: true,
  },
  {
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
    cta: { label: "Créer mon compte", href: "/signup" },
    available: true,
  },
  {
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
    cta: { label: "Créer mon compte", href: "/signup" },
    available: true,
  },
  {
    name: "Accompagnement Qualiopi",
    tagline: "Un référent vous accompagne jusqu'à la certification, sur-mesure.",
    price: "Sur devis",
    billingNote: "en complément de l'abonnement de votre choix ci-dessus",
    features: [
      "Mise en relation avec un référent Qualiopi",
      "Relecture personnalisée de votre dossier",
      "Accompagnement jusqu'à l'obtention de la certification",
    ],
    cta: { label: "Nous contacter", href: ACCOMPAGNEMENT_CONTACT_HREF },
    available: true,
  },
];

export function PricingPlans() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-16 md:py-20">
          <Reveal>
            <div className="mx-auto max-w-3xl pb-12 text-center md:pb-16">
              <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
                <span className="bg-linear-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
                  Tarifs
                </span>
              </div>
              <h1 className="pb-4 text-3xl text-gray-900 md:text-4xl">
                <span className="font-extrabold">Une formule pour chaque étape</span>{" "}
                <span className="font-light text-gray-500">de votre organisme de formation</span>
              </h1>
              <p className="text-lg text-gray-600">
                Commencez par vos documents de preuve, puis ajoutez votre site internet,
                l&apos;accompagnement à l&apos;audit et votre plateforme de formation en ligne
                quand vous en avez besoin.
              </p>
            </div>
          </Reveal>

          <Spotlight className="group mx-auto grid max-w-sm items-stretch gap-6 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((plan, index) => (
              <Reveal key={plan.name} delay={index * 120} className="h-full">
                <div className="group/card relative h-full overflow-hidden rounded-2xl bg-gray-200 p-px before:pointer-events-none before:absolute before:-left-40 before:-top-40 before:z-10 before:h-80 before:w-80 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:rounded-full before:bg-indigo-500/80 before:opacity-0 before:blur-3xl before:transition-opacity before:duration-500 group-hover:before:opacity-100">
                  <div className="relative z-20 flex h-full flex-col overflow-hidden rounded-[inherit] bg-white p-6">
                    <div className="relative flex h-full flex-col">
                      <div className="mb-3">
                        {plan.available ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            Disponible maintenant
                          </span>
                        ) : (
                          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                            Bientôt disponible
                          </span>
                        )}
                      </div>

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

                      {plan.cta ? (
                        <Link
                          href={plan.cta.href}
                          className="mt-auto flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:scale-105 hover:bg-indigo-400"
                        >
                          {plan.cta.label}
                        </Link>
                      ) : (
                        <span className="mt-auto flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-500">
                          {plan.name === "Tout compris + LMS" ? (
                            <GraduationCap className="mr-1.5 h-4 w-4" aria-hidden="true" />
                          ) : null}
                          Bientôt disponible
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </Spotlight>

          <Reveal delay={520}>
            <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-gray-500">
              Le coût de l&apos;audit Qualiopi lui-même, payé à l&apos;organisme certificateur,
              n&apos;est inclus dans aucune formule — il varie selon la taille de votre structure
              (environ 990 € à 2 500 € HT sur 3 ans pour un petit organisme).
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
