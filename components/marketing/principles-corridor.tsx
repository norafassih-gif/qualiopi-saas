import { Reveal } from "./reveal";
import { ACCENT_CARD, accentAt } from "./palette";

type Principle = {
  text: string;
};

// Les mêmes 11 principes existent à deux endroits : ici (cartes colorées,
// décoratives) et dans la liste juste en dessous (texte normal, accessible —
// masquée visuellement avec "sr-only" depuis la Phase 24 à la demande de
// Nora, jugée redondante avec les cartes qui défilent, mais conservée pour
// les lecteurs d'écran/moteurs de recherche). Ne modifier qu'ici suffit : la
// couleur de chaque carte est dérivée automatiquement de sa position dans le
// tableau (palette partagée `./palette`, mêmes teintes réutilisées ailleurs
// sur le site — cf. how-it-works.tsx / features.tsx).
const PRINCIPLES: Principle[] = [
  { text: "Sans IA à l'usage" },
  { text: "100 % conforme Qualiopi" },
  { text: "Zéro jargon" },
  { text: "PDF en un clic" },
  { text: "Contenu prêt à l'emploi" },
  { text: "Programme automatique" },
  { text: "Prêt pour l'audit" },
  { text: "Vos couleurs, votre logo" },
  { text: "Sans coût caché" },
  { text: "Accompagnement sur mesure" },
  { text: "Site internet inclus" },
];

// 3 couloirs verticaux (gauche / centre / droite) — les cartes y sont
// réparties à tour de rôle (index % 3) pour qu'un couloir donné ne reçoive
// une nouvelle carte que toutes les ~3 cartes, cf. commentaire de DURATION_S
// plus bas pour pourquoi cet espacement est important.
const LANES = [
  { x: -300, y: -10, rot: -7 },
  { x: 0, y: 15, rot: 0 },
  { x: 300, y: -5, rot: 7 },
];

// Durée d'un aller complet (fond → face au visiteur → sortie), en secondes —
// DOIT être strictement identique à la durée déclarée dans globals.css
// (--animate-corridor-stream) : le décalage de chaque carte est calculé en
// fraction de cette même durée pour rester synchronisé avec le keyframe.
//
// Repensé en Phase 24 suite au retour de Nora ("tout s'enchaîne, ce n'est
// pas très organisé") : avec 11 cartes et 3 couloirs, deux cartes d'un même
// couloir démarrent à ~3/11ᵉ de DURATION_S d'écart (~6 s à 22 s). Le keyframe
// (voir globals.css) garde une carte pleinement visible pendant une fenêtre
// volontairement plus courte que cet écart, pour qu'une seule carte par
// couloir soit lisible à la fois plutôt que plusieurs qui se chevauchent.
const DURATION_S = 22;

/**
 * Couloir 3D de cartes qui défilent en profondeur vers le visiteur — inspiré
 * d'un template "ImageStreamHero" que Nora a trouvé et aimé. 100 % CSS (une
 * seule animation @keyframes définie dans globals.css, aucun JS) — dans le
 * même esprit que ParticleSphere : léger, aucune dépendance 3D.
 *
 * Cartes au format portrait (Phase 24) — le format paysage d'origine ne
 * correspondait pas à la référence de Nora, où les cartes "partent du fond
 * et arrivent vers l'avant" et se lisent une fois proches.
 *
 * Purement décoratif (aria-hidden) : le contenu réel et accessible est le
 * texte simple juste en dessous (masqué visuellement, `sr-only`), qui
 * reprend exactement les mêmes principes.
 */
export function PrinciplesCorridor() {
  return (
    <section className="relative py-8 md:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="mx-auto mb-8 max-w-xl text-center text-sm text-gray-500">
            Ce qui change avec {"Qualiopi Pilote"}
          </p>
        </Reveal>

        <div
          aria-hidden="true"
          className="relative h-[420px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] md:h-[500px]"
          style={{ perspective: "1000px" }}
        >
          <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
            {PRINCIPLES.map((principle, i) => {
              const lane = LANES[i % LANES.length];
              const delay = -((i / PRINCIPLES.length) * DURATION_S);
              const color = accentAt(i);
              return (
                <div
                  key={principle.text}
                  className="animate-corridor-stream motion-reduce:[animation-play-state:paused] absolute left-1/2 top-1/2 -ml-[100px] -mt-[140px] w-[200px]"
                  style={{
                    "--lane-x": `${lane.x}px`,
                    "--lane-y": `${lane.y}px`,
                    "--lane-rot": `${lane.rot}deg`,
                    animationDelay: `${delay}s`,
                  } as React.CSSProperties}
                >
                  <div
                    className={`flex h-[280px] items-center justify-center rounded-2xl border bg-linear-to-br px-5 text-center text-xl font-semibold shadow-lg ${ACCENT_CARD[color]}`}
                  >
                    {principle.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Doublon accessible et statique — voir commentaire du composant.
            Masqué visuellement (Phase 24, retour de Nora : redondant avec
            les cartes) mais conservé pour les lecteurs d'écran. */}
        <ul className="sr-only">
          {PRINCIPLES.map((principle) => (
            <li key={principle.text}>{principle.text}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
