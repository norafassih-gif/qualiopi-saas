"use client";

import { useTransition } from "react";
import { ShieldQuestion } from "lucide-react";
import { respondToAccessGrant } from "@/lib/actions/access-grants";
import type { PendingAccessGrant } from "@/lib/actions/access-grants";

// Bannière affichée sur le dashboard tant qu'une demande d'accès support
// (migration 0036) est en attente de réponse du client — la politique
// RLS "access_grants_update" garantit côté base qu'il ne peut approuver que
// ses propres demandes.
export function AccessGrantBanner({ grant }: { grant: PendingAccessGrant }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mb-6 flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2">
        <ShieldQuestion className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-amber-900">
            L&apos;équipe support demande à consulter vos données pour vous aider.
          </p>
          {grant.reason && <p className="mt-0.5 text-sm text-amber-800">{grant.reason}</p>}
          <p className="mt-1 text-xs text-amber-700">
            Vous pouvez refuser à tout moment ; l&apos;accès accordé expire automatiquement au bout de 30 jours.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => respondToAccessGrant(grant.id, true))}
          className="rounded-md bg-blue-900 px-3 py-1.5 text-xs text-white disabled:opacity-50"
        >
          Autoriser
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => respondToAccessGrant(grant.id, false))}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 disabled:opacity-50"
        >
          Refuser
        </button>
      </div>
    </div>
  );
}
