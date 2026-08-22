/**
 * Sphère de points en arrière-plan, positionnée derrière un mot du titre
 * (ex. "Pilote") — donne un effet "futuriste" : les points tournent
 * lentement en 3D et l'ensemble respire (léger gonflement continu).
 *
 * Rendu 100 % CSS : les points sont répartis sur une sphère avec l'algorithme
 * de Fibonacci (déterministe, pas de Math.random), puis positionnés avec
 * `translate3d` et animés avec `rotateY`/`scale` en CSS pur. Aucune librairie
 * 3D (pas de three.js/WebGL) — juste des `<span>` et deux animations CSS,
 * dans l'esprit "site léger, sans dépendance inutile" du projet. Composant
 * serveur : aucun JS n'est envoyé au navigateur pour l'afficher.
 *
 * Couleurs recalibrées en Phase 23 (passage du site au thème clair) : les
 * points étaient à l'origine un indigo pâle avec un halo lumineux, pensés
 * pour se détacher sur fond noir — invisibles sur fond blanc. Points plus
 * saturés (indigo-500/600) avec une ombre douce plutôt qu'un halo lumineux.
 */
function fibonacciSpherePoints(count: number) {
  const points: { x: number; y: number; z: number }[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    points.push({
      x: Math.cos(theta) * radiusAtY,
      y,
      z: Math.sin(theta) * radiusAtY,
    });
  }
  return points;
}

const POINTS = fibonacciSpherePoints(150);
const REFERENCE_SIZE = 220; // taille pour laquelle les points ci-dessous sont calibrés

export function ParticleSphere({
  size = 220,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const radius = size / 2;
  const scaleFactor = size / REFERENCE_SIZE; // les points grossissent avec la sphère

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 top-1/2 z-0 animate-sphere-breathe motion-reduce:animate-none ${className}`}
      style={{ width: size, height: size, perspective: Math.max(700, size * 3) }}
    >
      <div
        className="absolute inset-0 animate-sphere-spin motion-reduce:animate-none"
        style={{ transformStyle: "preserve-3d" }}
      >
        {POINTS.map((p, i) => {
          const depth = (p.z + 1) / 2; // 0 (loin) -> 1 (proche)
          const dotSize = (2 + depth * 3) * scaleFactor;
          return (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 rounded-full bg-indigo-600"
              style={{
                width: dotSize,
                height: dotSize,
                marginLeft: -dotSize / 2,
                marginTop: -dotSize / 2,
                opacity: 0.45 + depth * 0.5,
                boxShadow: "0 1px 4px 0 rgba(67,56,202,0.35)",
                transform: `translate3d(${p.x * radius}px, ${p.y * radius}px, ${p.z * radius}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
