"use client";

import { useEffect, useState } from "react";

/**
 * Barre de progression qui se remplit dès son affichage (petite animation de
 * montée en charge) — construite à la main (pas de dépendance Radix) pour
 * rester légère : juste une transition CSS déclenchée après le montage.
 */
export function ProgressBar({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(clamped));
    return () => cancelAnimationFrame(id);
  }, [clamped]);

  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-gray-100 ${className}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-blue-900 transition-all duration-700 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
