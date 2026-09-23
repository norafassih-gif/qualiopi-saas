"use client";

import { useActionState } from "react";
import type { ResendLinkFormState } from "@/lib/actions/admin";
import { resendClientLoginLink } from "@/lib/actions/admin";

const initialState: ResendLinkFormState = { error: null };

/**
 * Bouton "Travailler sur ce dossier" place directement sur chaque ligne de
 * la liste des clients — demande de Nora (23/09/2026) : passer par la fiche
 * de l'organisme, generer le lien, le copier puis le coller faisait quatre
 * gestes pour une action qu'elle repete a chaque dossier qu'elle produit
 * pour un client.
 *
 * Le lien connecte directement au compte du client. Ouvert dans le meme
 * navigateur, il REMPLACE la session admin : ouvrir dans une fenetre de
 * navigation privee pour garder les deux en parallele. Le vrai mode
 * "dossier actif" (bandeau + retour en un clic, sans perdre la session
 * admin) reste a construire.
 */
export function ClientSessionButton({ organizationId }: { organizationId: string }) {
  const [state, formAction, pending] = useActionState(resendClientLoginLink, initialState);

  if (state.link) {
    return (
      <a
        href={state.link}
        target="_blank"
        rel="noreferrer"
        className="rounded-md bg-blue-900 px-3 py-1 text-xs font-medium text-white hover:bg-blue-800"
        title="Astuce : clic droit puis ouvrir dans une fenetre de navigation privee pour garder votre session admin"
      >
        Ouvrir la session client →
      </a>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="organization_id" value={organizationId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-blue-900 px-3 py-1 text-xs font-medium text-blue-900 hover:bg-blue-50 disabled:opacity-50"
      >
        {pending ? "Generation…" : "Travailler sur ce dossier"}
      </button>
      {state.error ? <p className="mt-1 text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}
