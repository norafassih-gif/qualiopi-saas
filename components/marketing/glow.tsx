/**
 * Halo coloré en arrière-plan qui pulse doucement (fondu + zoom très lent,
 * en boucle) — donne de la profondeur et du mouvement continu derrière le
 * titre du Hero, indépendamment du défilement. Pur CSS (dégradé radial +
 * animation), aucune dépendance externe. Désactivé si l'utilisateur préfère
 * moins d'animations.
 */
export function Glow({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[620px] rounded-full bg-[radial-gradient(closest-side,var(--color-indigo-500),transparent)] blur-3xl animate-glow-pulse motion-reduce:animate-none motion-reduce:opacity-40 ${className}`}
    />
  );
}
