"use client";

import { useEffect, useRef } from "react";
import { ParticleSphere } from "./particle-sphere";

/**
 * Calque interactif superposé au bloc de titre du Hero : la sphère de points
 * traverse d'abord "Qualiopi Pilote" de gauche à droite (entrée en scène,
 * ~2,8s), puis se met à suivre le curseur de la souris dans la zone du Hero.
 * Au passage, elle fait "grossir" progressivement le mot (Qualiopi, en un
 * bloc, pour ne pas casser son dégradé animé) ou la lettre (Pilote, lettre
 * par lettre) qui se trouve sous elle — l'intensité dépend en continu de la
 * distance à la sphère, ce qui donne un zoom fluide plutôt qu'un "pop" brusque.
 *
 * Composant client, piloté par requestAnimationFrame (aucune dépendance
 * externe). Repère les mots/lettres à faire grossir via des attributs
 * data-sphere-word / data-sphere-letter posés sur les <span> du titre —
 * ça évite de faire remonter des refs entre deux fichiers, et ça garde le
 * titre lui-même en rendu serveur normal.
 */
export function InteractiveSphereLayer() {
  const layerRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const modeRef = useRef<"intro" | "follow">("intro");
  const introStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layer = layerRef.current;
    if (!layer) return;

    function handleMouseMove(e: MouseEvent) {
      const rect = layer!.getBoundingClientRect();
      targetRef.current = {
        x: Math.min(Math.max(e.clientX - rect.left, 0), rect.width),
        y: Math.min(Math.max(e.clientY - rect.top, 0), rect.height),
      };
      modeRef.current = "follow";
    }
    window.addEventListener("mousemove", handleMouseMove);

    let rafId: number;

    function frame(ts: number) {
      const rect = layer!.getBoundingClientRect();
      const titleEl = layer!.parentElement?.querySelector("h1");
      const titleRect = titleEl?.getBoundingClientRect();
      const introY = titleRect ? titleRect.top + titleRect.height / 2 - rect.top : rect.height * 0.3;

      if (modeRef.current === "intro") {
        if (introStartRef.current === null) introStartRef.current = ts;
        const elapsed = ts - introStartRef.current;
        const duration = 2800;
        const t = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        targetRef.current = { x: -60 + eased * (rect.width + 120), y: introY };
        if (t >= 1) modeRef.current = "follow";
      }

      // Lissage (lerp) vers la cible : donne un mouvement fluide plutôt que
      // de "sauter" instantanément sur la position de la souris.
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.08;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.08;

      if (sphereRef.current) {
        sphereRef.current.style.transform = `translate(calc(${posRef.current.x}px - 50%), calc(${posRef.current.y}px - 50%))`;
      }

      const sphereViewportX = rect.left + posRef.current.x;
      const sphereViewportY = rect.top + posRef.current.y;

      const wordEl = document.querySelector('[data-sphere-word="qualiopi"]') as HTMLElement | null;
      if (wordEl) {
        const wRect = wordEl.getBoundingClientRect();
        const cx = wRect.left + wRect.width / 2;
        const cy = wRect.top + wRect.height / 2;
        const dist = Math.hypot(sphereViewportX - cx, sphereViewportY - cy);
        const influence = Math.max(0, 1 - dist / (wRect.width * 0.8));
        wordEl.style.transform = `scale(${1 + influence * 0.4})`;
      }

      const letterEls = layer!.parentElement?.querySelectorAll("[data-sphere-letter]");
      letterEls?.forEach((el) => {
        const lRect = (el as HTMLElement).getBoundingClientRect();
        const cx = lRect.left + lRect.width / 2;
        const cy = lRect.top + lRect.height / 2;
        const dist = Math.hypot(sphereViewportX - cx, sphereViewportY - cy);
        const influence = Math.max(0, 1 - dist / 60);
        (el as HTMLElement).style.transform = `scale(${1 + influence * 0.75})`;
      });

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <div ref={sphereRef} className="absolute left-0 top-0">
        <ParticleSphere size={420} />
      </div>
    </div>
  );
}
