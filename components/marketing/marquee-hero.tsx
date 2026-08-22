import Link from "next/link";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { NoiseCtaButton } from "./noise-cta-button";

/**
 * Hero d'accueil (Phase 27bis, révisé le 23/08/2026 suite au retour de Nora
 * sur le premier rendu) : grille de vignettes en 3D (`ThreeDMarquee`,
 * Aceternity UI — cf. `components/ui/3d-marquee.tsx` pour la provenance) en
 * arrière-plan, avec le titre/CTA en surimpression — reproduit la mise en
 * page de référence que Nora a montrée (capture d'écran + code de démo
 * officiel `ThreeDMarqueeDemoSecond`), à la place du hero "scroll-reveal"
 * tenté juste avant dans la même conversation ("ce n'est pas du tout ça").
 *
 * Les vignettes ne sont PAS de vraies captures du logiciel (constat déjà
 * fait en Phase 26 : rien à montrer de présentable pour l'instant) ni les
 * images de démonstration d'Aceternity elles-mêmes (montrer les visuels
 * marketing d'un autre éditeur sur ce site n'aurait aucun sens) — ce sont
 * 16 vignettes générées pour ce projet (`public/images/marquee/doc-*.svg`),
 * une par type de document réellement généré par le logiciel (Programme,
 * Convention, Attestation, Émargement...).
 *
 * Premier essai (fond noir + voile sombre) rejeté par Nora : la démo
 * Aceternity originale est sombre, mais la Phase 23 avait acté un thème
 * clair partout ("j'aime pas le noir"). Son arbitrage : "il faut que le
 * fond soit blanc et les cartes qui défilent soient noires glassy/liquid"
 * — donc pas une exception sombre pour toute la section, mais un contraste
 * *à l'intérieur* du hero : fond blanc, voile clair translucide devant le
 * titre, et ce sont les 16 vignettes elles-mêmes qui portent l'esthétique
 * sombre "verre liquide" (dégradé quasi-noir, reflet flouté, liseré clair
 * en haut — voir le script qui les génère). Les vignettes restent donc
 * volontairement sombres — seul le fond de la section est devenu blanc,
 * cohérent avec la règle Phase 23.
 */
const DOC_TILES = Array.from(
  { length: 16 },
  (_, i) => `/images/marquee/doc-${String(i + 1).padStart(2, "0")}.svg`,
);

export function MarqueeHero() {
  return (
    <section className="relative mx-auto flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-white">
      <h1 className="relative z-20 mx-auto max-w-4xl px-4 text-center text-4xl font-extrabold text-balance text-gray-900 md:text-6xl">
        Qualiopi Pilote
      </h1>
      <p className="relative z-20 mx-auto max-w-2xl px-4 py-6 text-center text-base text-gray-600 md:text-lg">
        Votre organisme de formation, certifié Qualiopi sans prise de tête. Répondez à des questions
        simples : le logiciel construit votre programme et génère tous vos documents, prêts pour
        l&apos;audit.
      </p>

      <div className="relative z-20 flex flex-wrap items-center justify-center gap-4 pt-4">
        <NoiseCtaButton href="/signup">Créer mon compte</NoiseCtaButton>
        <Link
          href="/login"
          className="rounded-md border border-gray-300 bg-white/70 px-6 py-2.5 text-sm font-medium text-gray-700 backdrop-blur-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 focus:ring-offset-white"
        >
          Se connecter
        </Link>
      </div>

      {/* Voile clair entre le contenu et la grille — laisse deviner les vignettes sombres en mouvement tout en gardant le titre parfaitement lisible sur fond blanc. */}
      <div className="absolute inset-0 z-10 h-full w-full bg-white/75" />

      <ThreeDMarquee className="pointer-events-none absolute inset-0 h-full w-full" images={DOC_TILES} />
    </section>
  );
}
