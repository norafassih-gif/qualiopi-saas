"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";

/**
 * Zone de signature tactile/souris — dessin au doigt (tablette) ou à la
 * souris, capturé en PNG (data URL) via canvas.toDataURL(). Pas de
 * bibliothèque externe : Pointer Events natifs, suffisant pour un tracé
 * simple. Premier composant du logiciel à utiliser un <canvas> (cf. journal,
 * Phase 33) — les signatures d'organisme (cachet/signature) restent, elles,
 * de simples fichiers importés (lib/actions/branding.ts).
 */
export function SignaturePad({
  signerLabel,
  onCancel,
  onSubmit,
}: {
  signerLabel: string;
  onCancel: () => void;
  onSubmit: (dataUrl: string) => Promise<void>;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getContext() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }

  function pointerPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // Le canvas peut être affiché plus grand/petit que sa résolution interne
    // (largeur/hauteur CSS vs attributs width/height) — on remet les
    // coordonnées à l'échelle pour que le tracé suive fidèlement le doigt.
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = getContext();
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const { x, y } = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = pointerPos(e);
    ctx.lineTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1f2937";
    ctx.stroke();
    if (!hasDrawn) setHasDrawn(true);
  }

  function handlePointerUp() {
    drawingRef.current = false;
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setError(null);
  }

  async function handleValidate() {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    setSubmitting(true);
    setError(null);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      await onSubmit(dataUrl);
    } catch {
      setError("Une erreur est survenue — merci de réessayer.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">Signature de {signerLabel}</p>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-2 text-xs text-gray-500">Signez ci-dessous avec le doigt ou la souris.</p>

        <canvas
          ref={canvasRef}
          width={600}
          height={220}
          className="w-full touch-none rounded-md border border-gray-300 bg-gray-50"
          style={{ aspectRatio: "600 / 220" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={submitting}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 disabled:opacity-50"
          >
            Effacer le tracé
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="rounded-md px-3 py-1.5 text-xs text-gray-500 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleValidate}
              disabled={!hasDrawn || submitting}
              className="rounded-md bg-blue-900 px-3 py-1.5 text-xs text-white disabled:opacity-50"
            >
              {submitting ? "Enregistrement…" : "Valider la signature"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
