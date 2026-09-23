"use client";

import { useEffect, useRef, useState } from "react";

type SignatureBeneficiary = {
  signature_accepted?: boolean | null;
  signature_name?: string | null;
  signature_date?: string | null;
  signature_mode?: string | null;
  signature_data_url?: string | null;
} | null;

/**
 * Signature du stagiaire, recueillie par l'organisme.
 *
 * Le stagiaire n'a jamais de compte : il signe sur l'ecran de la personne
 * connectee, le jour de la formation, ou il a signe sur papier et l'organisme
 * enregistre la date reelle.
 *
 * Remplace l'ancienne case a cocher "Lu et approuve" qui suffisait a faire
 * ecrire "signature electronique enregistree le {date du jour}" dans les PDF
 * alors que personne n'avait signe (defaut releve le 23/09/2026).
 *
 * La date est toujours libre : les dossiers sont souvent produits en decale
 * par rapport a la session.
 */
export function BeneficiarySignature({ beneficiary }: { beneficiary: SignatureBeneficiary }) {
  const initialMode =
    beneficiary?.signature_mode === "drawn" || beneficiary?.signature_mode === "paper"
      ? beneficiary.signature_mode
      : beneficiary?.signature_accepted
        ? "paper"
        : "none";

  const [mode, setMode] = useState<string>(initialMode);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dataUrlRef = useRef<HTMLInputElement | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mode !== "drawn") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";

    const point = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height),
      };
    };
    const down = (event: PointerEvent) => {
      drawing.current = true;
      const p = point(event);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      canvas.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!drawing.current) return;
      const p = point(event);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };
    const up = () => {
      if (!drawing.current) return;
      drawing.current = false;
      if (dataUrlRef.current) dataUrlRef.current.value = canvas.toDataURL("image/png");
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointerleave", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointerleave", up);
    };
  }, [mode]);

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (dataUrlRef.current) dataUrlRef.current.value = "";
  }

  return (
    <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-3">
      <p className="text-sm font-medium text-gray-800">Signature du stagiaire</p>

      <div className="mt-2 flex flex-col gap-1 text-sm text-gray-700">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="signature_mode"
            value="none"
            checked={mode === "none"}
            onChange={() => setMode("none")}
          />
          Pas encore signé — le document sortira avec une ligne à signer
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="signature_mode"
            value="paper"
            checked={mode === "paper"}
            onChange={() => setMode("paper")}
          />
          Signé sur papier — j&apos;indique la date réelle
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="signature_mode"
            value="drawn"
            checked={mode === "drawn"}
            onChange={() => setMode("drawn")}
          />
          Il signe maintenant sur mon écran
        </label>
      </div>

      {mode !== "none" ? (
        <label className="mt-3 flex flex-col gap-1 text-sm text-gray-700">
          Date de signature
          <input
            type="date"
            name="signature_date"
            defaultValue={beneficiary?.signature_date ?? ""}
            className="w-48 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <span className="text-xs text-gray-500">
            Libre : indiquez la date à laquelle le stagiaire a réellement signé, même si elle est
            antérieure au jour où vous produisez le dossier.
          </span>
        </label>
      ) : null}

      {mode === "drawn" ? (
        <div className="mt-3 flex flex-col gap-2">
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="h-[160px] w-full max-w-[520px] cursor-crosshair rounded border border-gray-300 bg-white"
            style={{ touchAction: "none" }}
          />
          <button type="button" onClick={clearCanvas} className="self-start text-xs text-gray-600 underline">
            Effacer le dessin
          </button>
          {beneficiary?.signature_data_url ? (
            <span className="text-xs text-gray-500">
              Une signature est déjà enregistrée. Dessinez uniquement si vous voulez la remplacer.
            </span>
          ) : null}
        </div>
      ) : null}

      <input ref={dataUrlRef} type="hidden" name="signature_data_url" defaultValue="" />
      {mode !== "none" ? <input type="hidden" name="signature_accepted" value="on" /> : null}
    </div>
  );
}
