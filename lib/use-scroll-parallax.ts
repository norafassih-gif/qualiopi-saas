"use client";

import { useEffect, useState } from "react";

/**
 * Décalage vertical proportionnel au défilement de la page — utilisé pour un
 * effet de parallaxe discret sur les formes décoratives en arrière-plan
 * (elles dérivent un peu plus ou moins vite que le contenu, pour donner de
 * la profondeur pendant le scroll, pas seulement au chargement). `factor`
 * contrôle l'intensité et le sens (ex. 0.12 = dérive vers le bas à 12 % de
 * la vitesse de scroll, -0.08 = dérive vers le haut). Désactivé si
 * l'utilisateur préfère moins d'animations.
 */
export function useScrollParallax(factor: number): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function handleScroll() {
      setOffset(window.scrollY * factor);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [factor]);

  return offset;
}
