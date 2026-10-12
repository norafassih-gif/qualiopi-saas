import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyBilling, startNdaCheckout } from "@/lib/actions/billing";
import { NDA_PRICE_EUR } from "@/lib/engine/tracks";

export const dynamic = "force-dynamic";

/**
 * Paiement unique de l'accompagnement NDA (200 €, hors abonnement Qualiopi).
 * Le logiciel reste librement consultable ; ce paiement n'est demandé qu'au
 * moment de générer un PDF de la déclaration d'activité.
 */
export default async function NdaPaiementPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; error?: string }>;
}) {
  const params = await searchParams;
  const org = await getMyOrganization();
  if (!org) redirect("/onboarding/parcours");

  const billing = await getMyBilling();
  if (billing?.nda_paid || billing?.subscription_status === "active") redirect("/nda");

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Accompagnement déclaration d&apos;activité (NDA)</h1>
      <p className="mt-2 text-sm text-gray-600">
        Un paiement unique pour obtenir tous les documents de votre déclaration d&apos;activité, prêts à
        déposer sur Mon Activité Formation.
      </p>

      {params.canceled === "1" ? (
        <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Paiement annulé : rien n&apos;a été débité.
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {params.error === "config"
            ? "Le paiement n'est pas encore disponible. Écrivez-nous via le bouton WhatsApp, nous vous répondons sous 12 h."
            : "Le paiement n'a pas pu démarrer. Réessayez dans un instant."}
        </p>
      ) : null}

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-4xl font-extrabold text-gray-900">
          {NDA_PRICE_EUR} €{" "}
          <span className="text-base font-normal text-gray-500">paiement unique</span>
        </p>
        <ul className="mt-4 space-y-2 text-sm text-gray-800">
          {[
            "Les pièces de la déclaration d'activité, générées en PDF avec votre identité",
            "Programme, convention ou contrat de formation, devis",
            "Le guide pas à pas du formulaire officiel, champ par champ",
            "Aucun abonnement, aucun renouvellement",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <form action={startNdaCheckout} className="mt-6">
          <button
            type="submit"
            className="w-full rounded-md bg-blue-900 px-4 py-3 text-sm font-medium text-white hover:bg-blue-800"
          >
            Payer {NDA_PRICE_EUR} € et débloquer mes documents
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Paiement sécurisé par Stripe
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Aucune coordonnée bancaire stockée chez nous
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        Vous préparez aussi la certification Qualiopi ?{" "}
        <Link href="/onboarding/abonnement" className="underline">
          Voir l&apos;abonnement Qualiopi
        </Link>
        .
      </p>
    </div>
  );
}
