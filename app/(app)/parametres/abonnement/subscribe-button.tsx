"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Check, FileText, Sparkles } from "lucide-react";
import type { BillingFormState } from "@/lib/actions/billing";
import { startCheckout } from "@/lib/actions/billing";

const initialState: BillingFormState = { error: null };

type PersonalizationOption = "standard" | "personalized";

/**
 * Choix "document standard" / "document personnalisé (+5 €/mois)" —
 * Phase 27quater (24/08/2026), demande explicite de Nora : deux cartes
 * flottantes présentées côte à côte au moment de choisir un forfait, plutôt
 * qu'une case à cocher discrète comme pour l'add-on branding ci-dessous.
 * Habillage "verre liquide" repris de la refonte du hero et des cartes
 * NotionsGrid faite dans la même conversation, pour rester cohérent avec le
 * reste du site plutôt que d'introduire un 3ᵉ style de carte — SANS le
 * flottement continu (`animate-float-card`) de ces deux composants,
 * volontairement : ce sont ici de vraies cartes cliquables (choix binaire
 * standard/personnalisé), et un mouvement perpétuel sur un élément
 * interactif nuit à la précision du clic (constaté concrètement : Playwright
 * refuse de cliquer dessus tant que la position n'est pas stable) — remplacé
 * par un simple lever au survol (`hover:-translate-y-1`), cohérent avec la
 * règle du skill apple-style-website de réserver le flottement perpétuel aux
 * éléments décoratifs non interactifs.
 *
 * Choix définitif au moment du paiement (pas modifiable ensuite depuis
 * cet écran) — conforme à la demande de Nora ("le client choisisse
 * définitivement +5 euros pour personnaliser le document"). Un changement
 * ultérieur passera par le portail Stripe / une future page dédiée, pas par
 * ce formulaire d'abonnement.
 */
function PersonalizationChoice({
  value,
  onChange,
}: {
  value: PersonalizationOption;
  onChange: (value: PersonalizationOption) => void;
}) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-medium text-gray-500">Format des documents générés</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange("standard")}
          aria-pressed={value === "standard"}
          className={`relative overflow-hidden rounded-2xl border p-4 text-left shadow-lg transition-transform duration-300 ease-out hover:-translate-y-1 ${
            value === "standard" ? "border-white/30 ring-2 ring-indigo-400" : "border-white/10 opacity-80"
          }`}
          style={{
            background:
              "radial-gradient(120% 140% at 20% 15%, rgba(148,163,184,0.28), transparent 60%), linear-gradient(160deg, #1b1e24, #050607)",
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/25" />
          <div className="mb-2 flex items-center justify-between">
            <FileText className="h-5 w-5 text-white" aria-hidden="true" />
            {value === "standard" && <Check className="h-4 w-4 text-indigo-300" aria-hidden="true" />}
          </div>
          <p className="text-sm font-semibold text-white">Document standard</p>
          <p className="mt-1 text-xs text-white/70">
            PDF à imprimer, signer à la main et tamponner vous-même.
          </p>
          <p className="mt-2 text-xs font-medium text-white/50">Inclus</p>
        </button>

        <button
          type="button"
          onClick={() => onChange("personalized")}
          aria-pressed={value === "personalized"}
          className={`relative overflow-hidden rounded-2xl border p-4 text-left shadow-lg transition-transform duration-300 ease-out hover:-translate-y-1 ${
            value === "personalized" ? "border-white/30 ring-2 ring-indigo-400" : "border-white/10 opacity-80"
          }`}
          style={{
            background:
              "radial-gradient(120% 140% at 20% 15%, rgba(99,102,241,0.35), transparent 60%), linear-gradient(160deg, #101018, #020204)",
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/25" />
          <div className="mb-2 flex items-center justify-between">
            <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
            {value === "personalized" && <Check className="h-4 w-4 text-indigo-300" aria-hidden="true" />}
          </div>
          <p className="text-sm font-semibold text-white">Document personnalisé</p>
          <p className="mt-1 text-xs text-white/70">
            Daté automatiquement, émargement en ligne, votre logo, votre charte graphique, cachet et
            signature électronique intégrés.
          </p>
          <p className="mt-2 text-xs font-medium text-indigo-300">+5 €/mois</p>
        </button>
      </div>
    </div>
  );
}

export function SubscribeButton({
  plan,
  label,
  showBrandingAddon = false,
  variant = "light",
}: {
  plan: string;
  label: string;
  /** Affiche la case à cocher optionnelle "Logo + charte graphique" (+18 €/mois). */
  showBrandingAddon?: boolean;
  /**
   * "light" (défaut, inchangé) : habillage utilisé sur /parametres/abonnement,
   * page interne claire. "dark" : habillage utilisé sur le nouvel écran
   * commercial /onboarding/abonnement (fond sombre, cf. Phase 21) — mêmes
   * champs de formulaire et même action serveur, seul le style change.
   */
  variant?: "light" | "dark";
}) {
  const [state, formAction, pending] = useActionState(startCheckout, initialState);
  const [addon, setAddon] = useState(false);
  const [personalization, setPersonalization] = useState<PersonalizationOption>("standard");
  const dark = variant === "dark";

  return (
    <form action={formAction}>
      <input type="hidden" name="plan" value={plan} />
      <input type="hidden" name="personalization_addon" value={personalization === "personalized" ? "on" : "off"} />

      <PersonalizationChoice value={personalization} onChange={setPersonalization} />

      {showBrandingAddon && (
        <label className="mb-3 flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="branding_addon"
            checked={addon}
            onChange={(e) => setAddon(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Ajouter <span className="font-medium">Logo + charte graphique</span> — création
            sur-mesure par notre équipe (+18 €/mois)
          </span>
        </label>
      )}
      {state.error && <p className="mb-2 text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className={
          dark
            ? "flex w-full items-center justify-center rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:scale-105 hover:bg-indigo-400 disabled:opacity-50 disabled:hover:scale-100"
            : "rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        }
      >
        {pending ? "Redirection vers le paiement…" : label}
      </button>
    </form>
  );
}
