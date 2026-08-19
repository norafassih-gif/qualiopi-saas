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

const POINTS = fibonacciSpherePoints(110);

export function ParticleSphere({
  size = 220,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const radius = size / 2;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 top-1/2 z-0 animate-sphere-breathe motion-reduce:animate-none ${className}`}
      style={{ width: size, height: size, perspective: 700 }}
    >
      <div
        className="absolute inset-0 animate-sphere-spin motion-reduce:animate-none"
        style={{ transformStyle: "preserve-3d" }}
      >
        {POINTS.map((p, i) => {
          const depth = (p.z + 1) / 2; // 0 (loin) -> 1 (proche)
          const dotSize = 2 + depth * 2.5;
          return (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 rounded-full bg-indigo-300"
              style={{
                width: dotSize,
                height: dotSize,
                marginLeft: -dotSize / 2,
                marginTop: -dotSize / 2,
                opacity: 0.25 + depth * 0.65,
                boxShadow: "0 0 6px 1px rgba(129,140,248,0.55)",
                transform: `translate3d(${p.x * radius}px, ${p.y * radius}px, ${p.z * radius}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
