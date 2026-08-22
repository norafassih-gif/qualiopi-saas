import { Reveal } from "./reveal";

type Principle = {
  text: string;
  from: string; // couleur Tailwind (ex. "indigo") utilisée pour le dégradé + le texte de la carte
};

// Les mêmes 9 principes existent à deux endroits : ici (cartes colorées,
// décoratives) et dans la liste juste en dessous (texte normal, lisible par
// tout le monde — lecteurs d'écran, moteurs de recherche, utilisateurs qui
// préfèrent moins d'animations). Ne modifier qu'ici suffit : la liste
// accessible est générée à partir du même tableau, cf. plus bas.
const PRINCIPLES: Principle[] = [
  { text: "Sans IA à l'usage", from: "indigo" },
  { text: "100 % conforme Qualiopi", from: "emerald" },
  { text: "Zéro jargon", from: "amber" },
  { text: "PDF en un clic", from: "rose" },
  { text: "Contenu prêt à l'emploi", from: "sky" },
  { text: "Programme automatique", from: "violet" },
  { text: "Prêt pour l'audit", from: "teal" },
  { text: "Vos couleurs, votre logo", from: "fuchsia" },
  { text: "Sans coût caché", from: "orange" },
];

// Répartition sur 3 "couloirs" (gauche / centre / droite), légèrement
// inclinés pour un effet d'éventail — cf. commentaire dans globals.css
// (@keyframes corridor-stream) pour le détail de l'animation elle-même.
const LANES = [
  { x: -230, y: -20, rot: -12 },
  { x: 0, y: 10, rot: 0 },
  { x: 230, y: -10, rot: 12 },
];

const CARD_COLOR_CLASSES: Record<string, string> = {
  indigo: "from-indigo-500/25 to-indigo-500/5 text-indigo-100 shadow-indigo-500/20",
  emerald: "from-emerald-500/25 to-emerald-500/5 text-emerald-100 shadow-emerald-500/20",
  amber: "from-amber-500/25 to-amber-500/5 text-amber-100 shadow-amber-500/20",
  rose: "from-rose-500/25 to-rose-500/5 text-rose-100 shadow-rose-500/20",
  sky: "from-sky-500/25 to-sky-500/5 text-sky-100 shadow-sky-500/20",
  violet: "from-violet-500/25 to-violet-500/5 text-violet-100 shadow-violet-500/20",
  teal: "from-teal-500/25 to-teal-500/5 text-teal-100 shadow-teal-500/20",
  fuchsia: "from-fuchsia-500/25 to-fuchsia-500/5 text-fuchsia-100 shadow-fuchsia-500/20",
  orange: "from-orange-500/25 to-orange-500/5 text-orange-100 shadow-orange-500/20",
};

const DURATION_S = 15;

/**
 * Corridor 3D de cartes qui défilent en profondeur vers le visiteur — inspiré
 * d'un template "ImageStreamHero" que Nora a trouvé et aimé, adapté ici pour
 * afficher des cartes de texte coloré (les principes du logiciel) plutôt que
 * des images, comme elle l'a demandé le 22/08/2026. 100 % CSS (une seule
 * animation @keyframes définie dans globals.css, aucun JS) — dans le même
 * esprit que ParticleSphere : léger, aucune dépendance 3D.
 *
 * Purement décoratif (aria-hidden) : le contenu réel et accessible est le
 * texte simple juste en dessous, qui reprend exactement les mêmes principes.
 */
export function PrinciplesCorridor() {
  return (
    <section className="relative py-8 md:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="mx-auto mb-8 max-w-xl text-center text-sm text-indigo-200/50">
            Ce qui change avec {"Qualiopi Pilote"}
          </p>
        </Reveal>

        <div
          aria-hidden="true"
          className="relative h-[280px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] md:h-[340px]"
          style={{ perspective: "900px" }}
        >
          <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
            {PRINCIPLES.map((principle, i) => {
              const lane = LANES[i % LANES.length];
              const delay = -((i / PRINCIPLES.length) * DURATION_S);
              return (
                <div
                  key={principle.text}
                  className="animate-corridor-stream motion-reduce:[animation-play-state:paused] absolute left-1/2 top-1/2 -ml-[130px] -mt-[45px] w-[260px]"
                  style={{
                    "--lane-x": `${lane.x}px`,
                    "--lane-y": `${lane.y}px`,
                    "--lane-rot": `${lane.rot}deg`,
                    animationDelay: `${delay}s`,
                  } as React.CSSProperties}
                >
                  <div
                    className={`flex h-[90px] items-center justify-center rounded-2xl border border-white/10 bg-linear-to-br px-5 text-center text-lg font-semibold shadow-xl ${CARD_COLOR_CLASSES[principle.from]}`}
                  >
                    {principle.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Doublon accessible et statique — voir commentaire du composant. */}
        <ul className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-indigo-200/60">
          {PRINCIPLES.map((principle) => (
            <li key={principle.text} className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-indigo-400" aria-hidden="true" />
              {principle.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
