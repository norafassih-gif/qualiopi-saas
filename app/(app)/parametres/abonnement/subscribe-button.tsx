"use client";

import { useState } from "react";
import { useActionState } from "react";
import type { BillingFormState } from "@/lib/actions/billing";
import { startCheckout } from "@/lib/actions/billing";

const initialState: BillingFormState = { error: null };

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
  const dark = variant === "dark";

  return (
    <form action={formAction}>
      <input type="hidden" name="plan" value={plan} />
      {showBrandingAddon && (
        <label
          className={`mb-3 flex items-start gap-2 text-sm ${dark ? "text-indigo-200/80" : "text-gray-700"}`}
        >
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
      {state.error && (
        <p className={`mb-2 text-sm ${dark ? "text-rose-400" : "text-red-600"}`}>{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={
          dark
            ? "flex w-full items-center justify-center rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:scale-105 hover:bg-indigo-400 disabled:opacity-50 disabled:hover:scale-100"
            : "rounded-md bg-blue-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        }
      >
        {pending ? "Redirection vers le paiement…" : label}
      </button>
    </form>
  );
}
