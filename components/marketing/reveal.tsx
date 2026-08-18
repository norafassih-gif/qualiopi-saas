"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fait apparaître son contenu en fondu + flou + décalage vertical dès qu'il
 * entre dans l'écran (au chargement pour le Hero, au défilement pour le
 * reste) — donne du mouvement à la page sans dépendance externe (juste
 * IntersectionObserver + une transition CSS). Respecte "prefers-reduced-motion".
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:blur-none ${
        visible ? "opacity-100 translate-y-0 blur-none" : "opacity-0 translate-y-8 blur-sm"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
