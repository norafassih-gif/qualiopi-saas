import { Reveal } from "./reveal";
import { StreamCorridor, type StreamCard } from "./stream-corridor";
import { ACCENT_CARD, accentAt } from "./palette";

type Principle = {
  text: string;
};

// Les mêmes 11 principes existent à deux endroits : ici (cartes colorées,
// décoratives, moteur "stream-corridor") et dans la liste juste en dessous
// (texte normal, accessible — masquée visuellement avec "sr-only" depuis la
// Phase 24 à la demande de Nora, jugée redondante avec les cartes qui
// défilent, mais conservée pour les lecteurs d'écran/moteurs de recherche).
// Ne modifier qu'ici suffit : la couleur de chaque carte est dérivée
// automatiquement de sa position dans le tableau (palette partagée
// `./palette`, mêmes teintes réutilisées ailleurs sur le site — cf.
// how-it-works.tsx / features.tsx).
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

/**
 * Couloir 3D de cartes qui remontent en profondeur vers le visiteur —
 * portage fidèle (Phase 25) du template "ImageStreamHero" que Nora avait
 * trouvé et envoyé : même géométrie/mathématique de perspective, seule la
 * carte change (texte au lieu d'image). Le moteur générique vit dans
 * `./stream-corridor.tsx` ; ce fichier ne fait que lui fournir le contenu
 * (nos 11 principes, colorés via la palette partagée du site).
 *
 * Purement décoratif (aria-hidden, géré par le moteur) : le contenu réel et
 * accessible est le texte simple juste en dessous (masqué visuellement,
 * `sr-only`), qui reprend exactement les mêmes principes.
 */
export function PrinciplesCorridor() {
  const items: StreamCard[] = PRINCIPLES.map((principle, i) => ({
    content: principle.text,
    className: ACCENT_CARD[accentAt(i)],
  }));

  return (
    <section className="relative py-8 md:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="mx-auto mb-8 max-w-xl text-center text-sm text-gray-500">
            Ce qui change avec {"Qualiopi Pilote"}
          </p>
        </Reveal>

        <StreamCorridor
          items={items}
          cards={PRINCIPLES.length}
          speed={20}
          className="h-[420px] md:h-[500px]"
        />

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
