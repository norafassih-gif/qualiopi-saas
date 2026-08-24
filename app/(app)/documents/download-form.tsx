"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function DocumentDownloadForm({
  templateId,
  beneficiaries,
}: {
  templateId: string;
  beneficiaries: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const date = String(formData.get("date") || "").trim();
    if (date) params.set("date", date);
    const beneficiaryId = String(formData.get("beneficiary_id") || "").trim();
    if (beneficiaryId) params.set("beneficiary_id", beneficiaryId);

    const url = `/api/documents/${templateId}${params.toString() ? `?${params}` : ""}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        // Paywall "à l'usage" (décision de Nora, 24/08/2026) : cliquer sur
        // "Télécharger" sans abonnement actif amène directement vers la
        // page de paiement, plutôt que d'afficher un simple message
        // d'erreur inerte — c'est le moment "il clique quelque part, ça lui
        // fait payer" qu'elle a explicitement demandé.
        if (response.status === 402) {
          router.push("/onboarding/abonnement");
          return;
        }
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "La génération du document a échoué.");
        return;
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const match = /filename="([^"]+)"/.exec(disposition);
      const filename = match?.[1] ?? `${templateId}.pdf`;

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      router.refresh();
    } catch {
      setError("La génération du document a échoué. Réessayez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {beneficiaries.length > 1 && (
          <select
            name="beneficiary_id"
            aria-label="Apprenant pour lequel générer ce document"
            className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700"
            defaultValue={beneficiaries[0]?.id}
          >
            {beneficiaries.map((b) => (
              <option key={b.id} value={b.id}>
                {b.full_name}
              </option>
            ))}
          </select>
        )}
        <input
          type="date"
          name="date"
          aria-label="Date à afficher sur le document (optionnel — aujourd'hui par défaut)"
          className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-900 px-3 py-1.5 text-xs text-white disabled:opacity-50"
        >
          {pending ? "Génération…" : "Télécharger le PDF"}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
