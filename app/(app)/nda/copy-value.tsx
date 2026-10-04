"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

/** Valeur prête à copier-coller dans le formulaire Mon Activité Formation. */
export function CopyValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className="inline-flex items-center gap-2">
      <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-sm text-gray-900">{value}</span>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* presse-papiers indisponible : la valeur reste lisible à l'écran */
          }
        }}
        className="inline-flex items-center gap-1 text-xs text-blue-900 hover:underline"
        aria-label="Copier"
      >
        {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
        {copied ? "Copié" : "Copier"}
      </button>
    </span>
  );
}
