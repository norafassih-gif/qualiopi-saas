"use client";

import { useActionState } from "react";
import type { BillingFormState } from "@/lib/actions/billing";
import { startCheckout } from "@/lib/actions/billing";

const initialState: BillingFormState = { error: null };

export function SubscribeButton({ plan, label }: { plan: string; label: string }) {
  const [state, formAction, pending] = useActionState(startCheckout, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="plan" value={plan} />
      {state.error && <p className="mb-2 text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Redirection vers le paiement…" : label}
      </button>
    </form>
  );
}
