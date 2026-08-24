"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, PenLine } from "lucide-react";
import { recordAttendanceSignature, clearAttendanceSignature, type AttendanceSignature } from "@/lib/actions/attendance";
import { formatPeriodLabel, type AttendancePeriod } from "@/lib/engine/attendance-periods";
import { SignaturePad } from "./signature-pad";

type BeneficiaryLite = { id: string; full_name: string };

/**
 * Choisit la demi-journée à afficher par défaut : celle d'aujourd'hui si la
 * session est en cours, sinon la première demi-journée non encore
 * intégralement signée, sinon la première tout court.
 */
function pickDefaultPeriodIndex(periods: AttendancePeriod[], signedKeys: Set<string>, beneficiaryCount: number): number {
  if (periods.length === 0) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const todayIndex = periods.findIndex((p) => p.date === today);
  if (todayIndex !== -1) return todayIndex;

  const firstIncomplete = periods.findIndex((p) => {
    const signedCount = [...signedKeys].filter((k) => k.endsWith(`|${p.date}|${p.slot}`)).length;
    return signedCount < beneficiaryCount;
  });
  return firstIncomplete !== -1 ? firstIncomplete : 0;
}

export function AttendanceSheet({
  sessionId,
  beneficiaries,
  periods,
  signatures,
}: {
  sessionId: string;
  beneficiaries: BeneficiaryLite[];
  periods: AttendancePeriod[];
  signatures: AttendanceSignature[];
}) {
  const router = useRouter();

  const signatureByKey = useMemo(() => {
    const map = new Map<string, AttendanceSignature>();
    for (const sig of signatures) {
      map.set(`${sig.beneficiary_id}|${sig.period_date}|${sig.period_slot}`, sig);
    }
    return map;
  }, [signatures]);

  const [periodIndex, setPeriodIndex] = useState(() =>
    pickDefaultPeriodIndex(periods, new Set(signatureByKey.keys()), beneficiaries.length)
  );
  const [signingBeneficiary, setSigningBeneficiary] = useState<BeneficiaryLite | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (beneficiaries.length === 0) {
    return (
      <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Aucun apprenant enregistré pour cette session —{" "}
        <a href="/parametres/session" className="underline">
          ajoutez-les d&apos;abord
        </a>
        .
      </p>
    );
  }
  if (periods.length === 0) {
    return (
      <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Dates de session manquantes —{" "}
        <a href="/parametres/session" className="underline">
          complétez les dates de début/fin
        </a>{" "}
        pour générer les demi-journées à signer.
      </p>
    );
  }

  const period = periods[periodIndex];

  async function handleSubmitSignature(dataUrl: string) {
    if (!signingBeneficiary) return;
    setError(null);
    const result = await recordAttendanceSignature(
      sessionId,
      signingBeneficiary.id,
      period.date,
      period.slot,
      signingBeneficiary.full_name,
      dataUrl
    );
    if (result.error) {
      setError(result.error);
      throw new Error(result.error);
    }
    setSigningBeneficiary(null);
    router.refresh();
  }

  async function handleClear(beneficiaryId: string) {
    setPending(beneficiaryId);
    setError(null);
    const result = await clearAttendanceSignature(sessionId, beneficiaryId, period.date, period.slot);
    setPending(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {periods.map((p, index) => {
          const signedCount = beneficiaries.filter((b) =>
            signatureByKey.has(`${b.id}|${p.date}|${p.slot}`)
          ).length;
          const complete = signedCount === beneficiaries.length;
          const active = index === periodIndex;
          return (
            <button
              key={`${p.date}-${p.slot}`}
              type="button"
              onClick={() => setPeriodIndex(index)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                active
                  ? "border-blue-900 bg-blue-900 text-white"
                  : complete
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-gray-300 bg-white text-gray-700"
              }`}
            >
              {formatPeriodLabel(p)} ({signedCount}/{beneficiaries.length})
            </button>
          );
        })}
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="flex flex-col gap-2">
        {beneficiaries.map((b) => {
          const sig = signatureByKey.get(`${b.id}|${period.date}|${period.slot}`);
          return (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
            >
              <p className="text-sm font-medium text-gray-900">{b.full_name}</p>
              {sig ? (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Signé
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URL locale, pas une image distante à optimiser */}
                  <img src={sig.signature_data_url} alt="" className="h-8 w-20 object-contain" />
                  <button
                    type="button"
                    onClick={() => handleClear(b.id)}
                    disabled={pending === b.id}
                    className="text-xs text-gray-400 underline hover:text-gray-600 disabled:opacity-50"
                  >
                    Effacer
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSigningBeneficiary(b)}
                  className="flex items-center gap-1.5 rounded-md bg-blue-900 px-3 py-1.5 text-xs text-white"
                >
                  <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
                  Signer
                </button>
              )}
            </div>
          );
        })}
      </div>

      {signingBeneficiary && (
        <SignaturePad
          signerLabel={signingBeneficiary.full_name}
          onCancel={() => setSigningBeneficiary(null)}
          onSubmit={handleSubmitSignature}
        />
      )}
    </div>
  );
}
