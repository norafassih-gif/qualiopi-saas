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
 * Renvoyer le lien de connexion (back-office admin) — utile quand un client
 * a perdu le lien initial ou n'a jamais défini son mot de passe. Génère un
 * lien de réinitialisation frais via Supabase (à usage unique), à transmettre
 * soi-même — aucun envoi d'email automatique n'est configuré.
 */
export function ResendLinkForm({ organizationId }: { organizationId: string }) {
  const [state, formAction, pending] = useActionState(resendClientLoginLink, initialState);

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h2 className="mb-1 text-sm font-semibold text-gray-900">Lien de connexion</h2>
      <p className="mb-3 text-xs text-gray-500">
        Génère un nouveau lien pour que ce client définisse (ou redéfinisse) son mot de passe.
      </p>

      {state.link ? (
        <CopyableLink link={state.link} />
      ) : (
        <form action={formAction}>
          <input type="hidden" name="organization_id" value={organizationId} />
          {state.error && <p className="mb-2 text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-50"
          >
            {pending ? "Génération…" : "Renvoyer le lien de connexion"}
          </button>
        </form>
      )}
    </div>
  );
}
