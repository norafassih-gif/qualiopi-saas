"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ── le couloir ──────────────────────────────────────────────────
 * Portage fidèle du composant "ImageStreamHero" que Nora avait trouvé et
 * envoyé (dépôt tiers, licence non précisée par l'auteur d'origine — code
 * fourni directement par Nora). Seule différence avec l'original : chaque
 * carte affiche un bloc de texte (`content`) au lieu d'une `<img>`. Toute la
 * géométrie/mathématique de la Phase 24 (accessoire, approximative) est
 * remplacée par celle-ci, qui est la vraie référence de Nora.
 *
 * Deux rails de cartes remontent depuis loin derrière l'écran vers le
 * visiteur. La perspective seule produit ce qui ressemble à deux animations
 * à la fois : quand le z d'une carte augmente, elle grossit *et* son x à
 * l'écran s'écarte du point de fuite, parce que la projection met à l'échelle
 * la position et la taille par le même facteur.
 *
 * Trois choses façonnent la courbe, chacune corrigeant un artefact précis :
 *
 * 1. La profondeur est pensée en *taille apparente*, géométriquement — chaque
 *    carte est un ratio constant plus grande que celle derrière elle, sur
 *    toute la distance. Espacer une plage de z de façon linéaire ferait au
 *    contraire éclater les cartes proches les unes des autres à mesure que la
 *    projection s'emballe.
 * 2. Les rails s'écartent fort sur le premier tronçon puis se stabilisent
 *    (`fan` > 1). Cette ouverture annule la croissance — encore lente — du
 *    début, si bien que le ruban quitte le centre en bande plate, plie une
 *    fois, puis file en diagonale seulement ensuite. Des rails parallèles
 *    donneraient un cône droit, sans le pli.
 * 3. Aucune des deux extrémités du cycle n'est jamais à l'écran. Une carte
 *    meurt quand son bord intérieur dépasse 50cqw, loin du bord du
 *    conteneur. Et elle naît *de l'autre côté* de l'axe — `railBirth` est
 *    négatif, donc la carte la plus récente démarre du côté opposé et
 *    traverse le centre en balayant. Cela bouche le "goulot" : l'axe reste
 *    couvert à chaque instant, et une carte qui naît atterrit derrière des
 *    cartes qui couvrent déjà cette zone, donc elle n'a pas besoin d'un
 *    fondu d'entrée. La faire naître de son propre côté laisserait un trou
 *    au centre qui s'ouvrirait à chaque cycle.
 *
 * Toutes les longueurs sont en `cqw` — un pourcentage de la largeur du
 * conteneur — pour que le couloir garde ses proportions à n'importe quelle
 * taille. Les valeurs par défaut viennent de l'original, ajustées
 * numériquement contre un enregistrement de référence, pas au jugé.
 * ─────────────────────────────────────────────────────────────── */

/**
 * Géométrie du couloir. Toutes les longueurs sont en `cqw`, un pourcentage de
 * la largeur du conteneur, donc la forme est indépendante de la résolution.
 *
 * Ces valeurs interagissent entre elles : le ruban ne reste solide que tant
 * que des cartes consécutives se chevauchent, ce qui demande un ratio
 * `exitHeight / birthHeight` étalé sur assez de `cards`. Augmenter
 * `exitHeight`, réduire `cards`, ou resserrer `railExit` poussent tous vers
 * une déchirure visible près du bord du cadre.
 */
export type CorridorPath = {
  /** Force de la projection. Plus bas = angle plus large, plus spectaculaire. @default 30 */
  perspective?: number;
  /** Largeur de carte en unités du monde. @default 18 */
  cardWidth?: number;
  /** Hauteur de carte en unités du monde. @default 25 */
  cardHeight?: number;
  /** Rayon de coin appliqué à chaque carte. @default 0.4 */
  cardRadius?: number;
  /** Hauteur à l'écran à la naissance, au niveau de la taille. @default 2.6 */
  birthHeight?: number;
  /** Hauteur à l'écran quand une carte sort du cadre. @default 46 */
  exitHeight?: number;
  /**
   * Décalage latéral à la naissance. Négatif = la carte démarre de l'autre
   * côté de l'axe pour que le centre ne s'ouvre jamais — voir note 3 ci-dessus.
   * @default -11
   */
  railBirth?: number;
  /** Décalage latéral une fois les rails complètement ouverts. @default 44 */
  railExit?: number;
  /** À quel point l'ouverture est précoce. >1 ouvre tôt puis tient. @default 3.3 */
  fan?: number;
  /** Rotation Y à la naissance, en degrés. @default 6 */
  turnBirth?: number;
  /** Rotation Y à la sortie, en degrés. @default 28 */
  turnExit?: number;
  /** Nombre de points utilisés pour tracer la courbe. À monter seulement si le mouvement paraît facetté. @default 24 */
  stops?: number;
};

const PATH: Required<CorridorPath> = {
  perspective: 30,
  cardWidth: 18,
  cardHeight: 25,
  cardRadius: 0.4,
  birthHeight: 2.6,
  exitHeight: 46,
  railBirth: -11,
  railExit: 44,
  fan: 3.3,
  turnBirth: 6,
  turnExit: 28,
  stops: 24,
};

/** Échantillonne la courbe une fois pour que les @keyframes CSS suivent la vraie trajectoire. */
function keyframes(dir: 1 | -1, name: string, p: Required<CorridorPath>) {
  const steps: string[] = [];
  for (let s = 0; s <= p.stops; s++) {
    const u = s / p.stops;
    // Géométrique en taille apparente, pour que des cartes consécutives
    // gardent un ratio de taille constant et que le ruban reste solide aux
    // deux extrémités.
    const scale = (p.birthHeight / p.cardHeight) * Math.pow(p.exitHeight / p.birthHeight, u);
    const z = p.perspective * (1 - 1 / scale);
    const rail = p.railExit - (p.railExit - p.railBirth) * Math.pow(1 - u, p.fan);
    const turn = p.turnBirth + (p.turnExit - p.turnBirth) * u;
    steps.push(
      `${(u * 100).toFixed(2)}%{transform:translate3d(${(dir * rail).toFixed(2)}cqw,0,${z.toFixed(2)}cqw) rotateY(${(-dir * turn).toFixed(2)}deg)}`,
    );
  }
  return `@keyframes ${name}{${steps.join("")}}`;
}

export type StreamCard = {
  /** Contenu affiché sur la carte (texte, badge, icône...). Le couloir est aria-hidden : ce contenu est purement décoratif. */
  content: React.ReactNode;
  /** Classes Tailwind pour l'habillage de la carte (fond, texte, bordure, ombre) — typiquement une entrée de `ACCENT_CARD`. */
  className?: string;
};

export type StreamCorridorProps = {
  /**
   * Cartes cyclées sur les rails. Les deux rails suivent la même séquence,
   * donc le couloir se lit comme un flux unique mis en miroir. Moins de
   * cartes que `cards` fait simplement se répéter la séquence.
   */
  items: StreamCard[];
  /**
   * Cartes par rail, en simultané. Plus de cartes = un couloir plus dense,
   * pas plus rapide — l'espacement se déduit de cette valeur et de `speed`.
   * Descendre très en dessous de la valeur par défaut fait grossir trop vite
   * des cartes consécutives, qui perdent leur chevauchement près de la
   * sortie et déchirent le ruban.
   * @default 9
   */
  cards?: number;
  /**
   * Secondes pour qu'une carte parcoure tout le couloir.
   * @default 18
   */
  speed?: number;
  /**
   * Position verticale de l'axe du couloir, en pourcentage de la hauteur.
   * @default 55
   */
  axis?: number;
  /** Surcharge une partie de la géométrie du couloir. Fusionnée avec les valeurs par défaut. */
  path?: CorridorPath;
  /** Contenu affiché par-dessus le couloir. */
  children?: React.ReactNode;
  className?: string;
};

export function StreamCorridor({
  items,
  cards = 9,
  speed = 18,
  axis = 55,
  path,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & StreamCorridorProps) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const right = `sc-r-${id}`;
  const left = `sc-l-${id}`;
  const card = `sc-c-${id}`;
  const p = React.useMemo(() => ({ ...PATH, ...path }), [path]);
  const css = React.useMemo(
    () =>
      `${keyframes(1, right, p)}${keyframes(-1, left, p)}` +
      // Mettre en pause plutôt que désactiver garde le couloir complet :
      // chaque carte est déjà lâchée en plein vol par son délai négatif,
      // donc elle se fige comme une image arrêtée finie au lieu de
      // s'effondrer sur l'axe.
      `@media(prefers-reduced-motion:reduce){.${card}{animation-play-state:paused}}`,
    [right, left, card, p],
  );

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      {...props}
      style={{ containerType: "inline-size", ...props.style }}
    >
      <style>{css}</style>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          perspective: `${p.perspective}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
        }}
      >
        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {[right, left].map((name) =>
            Array.from({ length: cards }, (_, i) => {
              // Les deux rails suivent la même séquence, donc le côté gauche
              // reflète le côté droit à chaque profondeur.
              const item = items[i % Math.max(items.length, 1)];
              return (
                <div
                  key={`${name}-${i}`}
                  className={cn(card, "absolute overflow-hidden border bg-linear-to-br shadow-lg", item?.className)}
                  style={{
                    left: "50%",
                    top: `${axis}%`,
                    width: `${p.cardWidth}cqw`,
                    height: `${p.cardHeight}cqw`,
                    marginLeft: `${-p.cardWidth / 2}cqw`,
                    marginTop: `${-p.cardHeight / 2}cqw`,
                    borderRadius: `${p.cardRadius}cqw`,
                    animation: `${name} ${speed}s linear infinite`,
                    // Un délai négatif lâche chaque carte en plein vol, donc
                    // le couloir est déjà plein dès la première image.
                    animationDelay: `${-(i * speed) / cards}s`,
                    backfaceVisibility: "hidden",
                  }}
                >
                  {item ? (
                    <div className="flex h-full w-full items-center justify-center p-[6cqw] text-center font-semibold [font-size:1.5cqw]">
                      {item.content}
                    </div>
                  ) : null}
                </div>
              );
            }),
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export default StreamCorridor;
