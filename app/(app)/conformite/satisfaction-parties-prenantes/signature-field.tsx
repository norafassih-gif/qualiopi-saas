"use client";

import { useEffect, useRef } from "react";

/**
 * Zone de signature du financeur ou de l'entreprise : il signe au doigt ou a
 * la souris, le trace est envoye avec le formulaire (champ cache
 * signature_data_url) et imprime dans le PDF du questionnaire.
 */
export function SignatureField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dataUrlRef = useRef<HTMLInputElement | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.5;
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
  }, []);

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (dataUrlRef.current) dataUrlRef.current.value = "";
  }

  return (
    <div className="text-sm">
      <span className="text-gray-700">Signature</span>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="mt-1 w-full max-w-md touch-none rounded-md border border-gray-300 bg-gray-50"
        style={{ aspectRatio: "600 / 200" }}
      />
      <input ref={dataUrlRef} type="hidden" name="signature_data_url" />
      <button type="button" onClick={clear} className="mt-1 text-xs text-gray-500 hover:text-gray-800">
        Effacer la signature
      </button>
    </div>
  );
}
