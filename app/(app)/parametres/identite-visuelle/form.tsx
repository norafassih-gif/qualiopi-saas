"use client";

import { useActionState, useRef } from "react";
import { updateBranding, type BrandingFormState } from "@/lib/actions/branding";
import type { Organization } from "@/lib/actions/organization";
import { FONT_OPTIONS } from "@/lib/engine/branding-fonts";

const initialState: BrandingFormState = { error: null };

export function BrandingForm({ org }: { org: Organization }) {
  const [state, formAction, pending] = useActionState(updateBranding, initialState);

  const formRef = useRef<HTMLFormElement>(null);
  const intentRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureDataUrlRef = useRef<HTMLInputElement>(null);
  const isDrawingRef = useRef(false);
  const hasDrawnRef = useRef(false);

  // Les boutons "Retirer" ne doivent pas être de simples <button type="submit">
  // dans ce même formulaire : avec plusieurs boutons de soumission portant
  // des intentions différentes, la touche Entrée dans un champ déclenche par
  // défaut le PREMIER bouton submit du formulaire dans l'ordre du DOM — donc
  // potentiellement "Retirer le logo" plutôt que "Enregistrer". On force
  // l'intention voulue dans un champ caché puis on soumet manuellement.
  function submitWithIntent(intent: string) {
    if (intentRef.current) intentRef.current.value = intent;
    formRef.current?.requestSubmit();
  }

  function getCanvasPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const { x, y } = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { x, y } = getCanvasPos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1f2937";
    ctx.lineTo(x, y);
    ctx.stroke();
    hasDrawnRef.current = true;
  }

  function handlePointerUp() {
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas && hasDrawnRef.current && signatureDataUrlRef.current) {
      signatureDataUrlRef.current.value = canvas.toDataURL("image/png");
    }
  }

  function clearSignaturePad() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    hasDrawnRef.current = false;
    if (signatureDataUrlRef.current) signatureDataUrlRef.current.value = "";
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-6" encType="multipart/form-data">
      <input ref={intentRef} type="hidden" name="intent" defaultValue="save" />

      <fieldset className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <legend className="mb-1 text-sm font-semibold text-gray-900">Logo</legend>

        {org.logo_url ? (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- image hébergée sur Supabase Storage, hors domaine de l'appli : next/image exigerait de le déclarer dans next.config, pas justifié pour une simple prévisualisation d'un fichier téléversé par l'utilisateur. */}
            <img src={org.logo_url} alt="Logo actuel" className="h-16 w-auto rounded border border-gray-200 bg-white p-1" />
            <button
              type="button"
              onClick={() => submitWithIntent("remove_logo")}
              disabled={pending}
              className="text-sm text-red-700 underline disabled:opacity-50"
            >
              Retirer le logo
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500">Aucun logo envoyé pour l&apos;instant.</p>
        )}

        <label className="flex flex-col gap-1 text-sm">
          {org.logo_url ? "Remplacer le logo" : "Envoyer un logo"}
          <input type="file" name="logo" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="text-sm" />
          <span className="text-xs text-gray-500">PNG, JPEG, SVG ou WebP — 2 Mo maximum.</span>
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <legend className="mb-1 text-sm font-semibold text-gray-900">Cachet de l&apos;entreprise</legend>
        <p className="text-xs text-gray-500">
          Ajouté automatiquement à côté de la signature sur les documents qui en comportent une
          (convention, contrat, attestations…).
        </p>

        {org.stamp_url ? (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- même raison que pour le logo ci-dessus. */}
            <img src={org.stamp_url} alt="Cachet actuel" className="h-16 w-auto rounded border border-gray-200 bg-white p-1" />
            <button
              type="button"
              onClick={() => submitWithIntent("remove_stamp")}
              disabled={pending}
              className="text-sm text-red-700 underline disabled:opacity-50"
            >
              Retirer le cachet
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500">Aucun cachet envoyé pour l&apos;instant.</p>
        )}

        <label className="flex flex-col gap-1 text-sm">
          {org.stamp_url ? "Remplacer le cachet" : "Envoyer un cachet"}
          <input type="file" name="stamp" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="text-sm" />
          <span className="text-xs text-gray-500">
            Idéalement en PNG avec fond transparent — PNG, JPEG, SVG ou WebP, 2 Mo maximum.
          </span>
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <legend className="mb-1 text-sm font-semibold text-gray-900">Signature électronique</legend>
        <p className="text-xs text-gray-500">
          Dessinez votre signature ci-dessous à la souris ou au doigt, ou envoyez directement une
          image (scan de votre signature manuscrite, par exemple).
        </p>

        {org.signature_url && (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- même raison que pour le logo ci-dessus. */}
            <img
              src={org.signature_url}
              alt="Signature actuelle"
              className="h-16 w-auto rounded border border-gray-200 bg-white p-1"
            />
            <button
              type="button"
              onClick={() => submitWithIntent("remove_signature")}
              disabled={pending}
              className="text-sm text-red-700 underline disabled:opacity-50"
            >
              Retirer la signature
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-sm">Dessiner ma signature</span>
          <canvas
            ref={canvasRef}
            width={400}
            height={150}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full max-w-[400px] cursor-crosshair rounded border border-gray-300 bg-white"
            style={{ touchAction: "none" }}
          />
          <button
            type="button"
            onClick={clearSignaturePad}
            className="self-start text-xs text-gray-600 underline"
          >
            Effacer le dessin
          </button>
          <input ref={signatureDataUrlRef} type="hidden" name="signature_data_url" defaultValue="" />
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Ou envoyer une image de signature
          <input
            type="file"
            name="signature_file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            className="text-sm"
          />
          <span className="text-xs text-gray-500">
            PNG, JPEG, SVG ou WebP — 2 Mo maximum. Prioritaire sur le dessin si les deux sont fournis.
          </span>
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <legend className="mb-1 text-sm font-semibold text-gray-900">Couleurs</legend>
        <div className="flex gap-6">
          <label className="flex flex-col gap-1 text-sm">
            Couleur principale
            <input
              type="color"
              name="brand_color_primary"
              defaultValue={org.brand_color_primary || "#1e3a8a"}
              className="h-10 w-16 rounded border border-gray-300"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Couleur secondaire
            <input
              type="color"
              name="brand_color_secondary"
              defaultValue={org.brand_color_secondary || "#64748b"}
              className="h-10 w-16 rounded border border-gray-300"
            />
          </label>
        </div>
        <span className="text-xs text-gray-500">
          Utilisées pour les titres et tableaux des documents générés (la couleur principale pour les
          titres, la secondaire pour les sous-titres et libellés).
        </span>
      </fieldset>

      <fieldset className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <legend className="mb-1 text-sm font-semibold text-gray-900">Police</legend>
        <label className="flex flex-col gap-1 text-sm">
          Police des documents
          <select
            name="font_family"
            defaultValue={org.font_family || "helvetica"}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="mt-2 rounded-md bg-blue-900 px-4 py-2 text-white disabled:opacity-50">
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
