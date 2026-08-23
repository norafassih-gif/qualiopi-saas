"use client";

import { useActionState, useState } from "react";
import { Copy, Check } from "lucide-react";
import type { ResendLinkFormState } from "@/lib/actions/admin";
import { resendClientLoginLink } from "@/lib/actions/admin";

const initialState: ResendLinkFormState = { error: null };

function CopyableLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 p-2">
      <code className="flex-1 overflow-x-auto whitespace-nowrap text-xs text-gray-700">{link}</code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(link);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="shrink-0 rounded-md border border-gray-300 p-1.5 text-gray-600 hover:bg-white"
        aria-label="Copier le lien"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

/**
 * Se connecter en tant que ce client (back-office admin) — demande de Nora
 * (24/08/2026) après avoir buté sur l'ancien flux "définir votre mot de
 * passe" (bug de fragment d'URL, corrigé côté serveur, cf.
 * app/auth/confirm/route.ts) : elle veut pouvoir "rentrer dedans" en un
 * clic, sans mot de passe ni étape intermédiaire. Le lien généré connecte
 * directement — ouvre-le toi-même pour agir à la place du client, ou
 * copie-le pour le lui transmettre s'il en a besoin lui-même.
 *
 * Attention : ouvrir ce lien dans le même navigateur remplace ta session
 * admin actuelle par celle du client dans cet onglet — utilise une fenêtre
 * de navigation privée si tu veux garder ta session admin active en
 * parallèle dans un autre onglet.
 */
export function ResendLinkForm({ organizationId }: { organizationId: string }) {
  const [state, formAction, pending] = useActionState(resendClientLoginLink, initialState);

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h2 className="mb-1 text-sm font-semibold text-gray-900">Se connecter en tant que ce client</h2>
      <p className="mb-3 text-xs text-gray-500">
        Génère un lien qui te connecte directement au compte de ce client (aucun mot de passe requis) —
        utile pour l&apos;aider, faire une démo, ou lui renvoyer un accès s&apos;il a perdu son lien
        initial. Ouvre-le dans une fenêtre privée pour garder ta session admin active ailleurs.
      </p>

      {state.link ? (
        <div className="flex flex-col gap-2">
          <a
            href={state.link}
            target="_blank"
            rel="noreferrer"
            className="inline-block self-start rounded-md bg-blue-900 px-3 py-1.5 text-xs font-medium text-white"
          >
            Ouvrir la session client →
          </a>
          <CopyableLink link={state.link} />
        </div>
      ) : (
        <form action={formAction}>
          <input type="hidden" name="organization_id" value={organizationId} />
          {state.error && <p className="mb-2 text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-50"
          >
            {pending ? "Génération…" : "Générer le lien de connexion"}
          </button>
        </form>
      )}
    </div>
  );
}
