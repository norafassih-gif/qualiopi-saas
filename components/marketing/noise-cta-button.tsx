"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NoiseBackground } from "@/components/ui/noise-background";
import { cn } from "@/lib/utils";

/**
 * Couleurs du halo animé : nos trois teintes de marque (indigo, violet, sky)
 * plutôt que le dégradé générique de démo (rose/bleu/jaune) — pour que
 * l'effet reste identifiable "Qualiopi Pilote" et pas "exemple copié tel quel".
 */
const BRAND_GLOW = ["rgb(99, 102, 241)", "rgb(139, 92, 246)", "rgb(56, 189, 248)"];

/**
 * CTA principal "vivant" — pastille glossy neutre entourée d'un halo dégradé
 * qui dérive doucement + grain léger (moteur : components/ui/noise-background.tsx,
 * porté du composant public "Noise Background" d'Aceternity UI que Nora avait
 * trouvé le 22/08/2026).
 *
 * Volontairement réservé aux CTA "moment fort" des pages publiques (hero,
 * section CTA de fin de page, pages formation) — jamais aux boutons de
 * l'application (tableau de bord, formulaires, abonnement) ni à la barre de
 * navigation : cf. skill apple-style-website §0, une action vue/cliquée très
 * souvent ne doit pas devenir un spectacle permanent. Le bouton "Se connecter"
 * à côté reste sobre exprès, pour que ce CTA-ci garde toute son attention.
 *
 * `className` porte les classes de mise en page (largeur, marges) — la forme
 * (pilule, ombre, halo) est fixe.
 */
export function NoiseCtaButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  // Respecte prefers-reduced-motion : on fige le halo plutôt que de le
  // démonter (la pastille reste identique, juste immobile). Lazy initializer
  // (pas de setState synchrone dans l'effet) : la valeur de départ est déjà
  // correcte au premier rendu client ; l'effet ne fait que s'abonner aux
  // changements ultérieurs de préférence.
  const [animating, setAnimating] = useState(
    () => typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setAnimating(!e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <NoiseBackground
      containerClassName={cn("inline-flex rounded-full p-1.5", className)}
      gradientColors={BRAND_GLOW}
      animating={animating}
    >
      <Link
        href={href}
        className="flex h-full min-w-max items-center justify-center whitespace-nowrap rounded-full bg-linear-to-b from-white to-neutral-100 px-6 py-3 text-sm font-semibold text-gray-900 shadow-[0px_2px_0px_0px_var(--color-white)_inset,0px_0.5px_1px_0px_var(--color-neutral-300)] transition-transform duration-150 active:scale-97"
      >
        {children}
      </Link>
    </NoiseBackground>
  );
}
