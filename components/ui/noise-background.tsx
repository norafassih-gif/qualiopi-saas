"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
} from "motion/react";
import { useEffect, useRef } from "react";

/**
 * Halo dégradé qui dérive doucement + léger grain (bruit) par-dessus —
 * portage fidèle du composant public "Noise Background" d'Aceternity UI
 * (https://ui.aceternity.com/components/noise-background, code source lu
 * directement sur le site le 22/08/2026 — composant libre, pensé pour être
 * copié-collé). Seuls changements par rapport à l'original : commentaires en
 * français, et suppression des classes `dark:` (le site n'a volontairement
 * qu'un seul thème, cf. app/globals.css).
 *
 * Ne pas utiliser ce composant directement pour un CTA de marque — passer
 * par `components/marketing/noise-cta-button.tsx`, qui fixe nos couleurs et
 * respecte `prefers-reduced-motion`.
 */

// Composant interne : une couche de dégradé radial qui suit un point animé.
function GradientLayer({
  springX,
  springY,
  gradientColor,
  opacity,
  multiplier,
}: {
  springX: MotionValue<number>;
  springY: MotionValue<number>;
  gradientColor: string;
  opacity: number;
  multiplier: number;
}) {
  const x = useTransform(springX, (val) => val * multiplier);
  const y = useTransform(springY, (val) => val * multiplier);
  const background = useMotionTemplate`radial-gradient(circle at ${x}px ${y}px, ${gradientColor} 0%, transparent 50%)`;

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        opacity,
        background,
      }}
    />
  );
}

interface NoiseBackgroundProps {
  /** Contenu affiché par-dessus le halo (typiquement un bouton). */
  children?: React.ReactNode;
  /** Classes pour le conteneur du contenu (z-index déjà géré). */
  className?: string;
  /** Classes pour le conteneur externe (taille, marges, arrondi...). */
  containerClassName?: string;
  /** Couleurs du dégradé animé, dans l'ordre des trois couches. */
  gradientColors?: string[];
  /** Intensité du grain superposé (0-1). */
  noiseIntensity?: number;
  /** Vitesse de déplacement du dégradé. */
  speed?: number;
  /** Applique un flou d'arrière-plan supplémentaire. */
  backdropBlur?: boolean;
  /** Coupe l'animation (ex. prefers-reduced-motion) sans démonter le halo. */
  animating?: boolean;
}

export const NoiseBackground = ({
  children,
  className,
  containerClassName,
  gradientColors = ["rgb(255, 100, 150)", "rgb(100, 150, 255)", "rgb(255, 200, 100)"],
  noiseIntensity = 0.2,
  speed = 0.1,
  backdropBlur = false,
  animating = true,
}: NoiseBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring pour un déplacement lissé plutôt qu'un suivi 1:1.
  const springX = useSpring(x, { stiffness: 100, damping: 30 });
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  // Bande de dégradé tout en haut du conteneur.
  const topGradientX = useTransform(springX, (val) => val * 0.1 - 50);

  const velocityRef = useRef({ x: 0, y: 0 });
  const lastDirectionChangeRef = useRef(0);

  // Position de départ : le centre du conteneur.
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    x.set(centerX);
    y.set(centerY);
  }, [x, y]);

  // Génère une vélocité aléatoire (direction + magnitude).
  const generateRandomVelocityRef = useRef(() => {
    const angle = Math.random() * Math.PI * 2;
    const magnitude = speed * (0.5 + Math.random() * 0.5); // entre 0.5x et 1x
    return {
      x: Math.cos(angle) * magnitude,
      y: Math.sin(angle) * magnitude,
    };
  });

  // Régénère la fonction si `speed` change.
  useEffect(() => {
    generateRandomVelocityRef.current = () => {
      const angle = Math.random() * Math.PI * 2;
      const magnitude = speed * (0.5 + Math.random() * 0.5);
      return {
        x: Math.cos(angle) * magnitude,
        y: Math.sin(angle) * magnitude,
      };
    };
    velocityRef.current = generateRandomVelocityRef.current();
  }, [speed]);

  useAnimationFrame((time) => {
    if (!animating || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const maxX = rect.width;
    const maxY = rect.height;

    // Change de direction aléatoirement toutes les 1,5 à 3 secondes.
    if (time - lastDirectionChangeRef.current > 1500 + Math.random() * 1500) {
      velocityRef.current = generateRandomVelocityRef.current();
      lastDirectionChangeRef.current = time;
    }

    const deltaTime = 16; // ~16ms par frame à 60fps
    const currentX = x.get();
    const currentY = y.get();

    let newX = currentX + velocityRef.current.x * deltaTime;
    let newY = currentY + velocityRef.current.y * deltaTime;

    // En touchant un bord, repart dans une direction 100% aléatoire (360°)
    // plutôt que de simplement "rebondir" horizontalement/verticalement.
    const padding = 20;

    if (newX < padding || newX > maxX - padding || newY < padding || newY > maxY - padding) {
      const angle = Math.random() * Math.PI * 2;
      const magnitude = speed * (0.5 + Math.random() * 0.5);
      velocityRef.current = {
        x: Math.cos(angle) * magnitude,
        y: Math.sin(angle) * magnitude,
      };
      lastDirectionChangeRef.current = time;
      newX = Math.max(padding, Math.min(maxX - padding, newX));
      newY = Math.max(padding, Math.min(maxY - padding, newY));
    }

    x.set(newX);
    y.set(newY);
  });

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-neutral-200 p-2 backdrop-blur-xs",
        "shadow-[0px_0.5px_1px_0px_var(--color-neutral-400)_inset,0px_1px_0px_0px_var(--color-neutral-100)]",
        backdropBlur && "after:absolute after:inset-0 after:h-full after:w-full after:backdrop-blur-lg after:content-['']",
        containerClassName,
      )}
      style={
        {
          "--noise-opacity": noiseIntensity,
        } as React.CSSProperties
      }
    >
      {/* Couches de dégradé mobiles */}
      <GradientLayer springX={springX} springY={springY} gradientColor={gradientColors[0]} opacity={0.4} multiplier={1} />
      <GradientLayer springX={springX} springY={springY} gradientColor={gradientColors[1]} opacity={0.3} multiplier={0.7} />
      <GradientLayer
        springX={springX}
        springY={springY}
        gradientColor={gradientColors[2] || gradientColors[0]}
        opacity={0.25}
        multiplier={1.2}
      />

      {/* Bande de dégradé tout en haut */}
      <motion.div
        className="absolute inset-x-0 top-0 h-1 rounded-t-2xl opacity-80 blur-xs"
        style={{
          background: `linear-gradient(to right, ${gradientColors.join(", ")})`,
          x: animating ? topGradientX : 0,
        }}
      />

      {/* Grain statique */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src="https://assets.aceternity.com/noise.webp"
          alt=""
          className="h-full w-full object-cover opacity-[var(--noise-opacity)]"
          style={{ mixBlendMode: "overlay" }}
        />
      </div>

      {/* Contenu */}
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};

export default NoiseBackground;
