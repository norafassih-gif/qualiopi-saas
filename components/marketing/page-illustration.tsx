"use client";

import Image from "next/image";
import Illustration from "@/public/images/page-illustration.svg";
import BlurredShapeGray from "@/public/images/blurred-shape-gray.svg";
import BlurredShape from "@/public/images/blurred-shape.svg";
import { useScrollParallax } from "@/lib/use-scroll-parallax";

/**
 * Formes décoratives en arrière-plan (dégradés flous abstraits — aucune
 * capture d'écran, aucun contenu à tenir à jour). Un léger flottement
 * continu (translation + zoom + rotation discrets) leur donne de la vie au
 * repos, et une parallaxe au défilement (chaque forme dérive à sa propre
 * vitesse) fait qu'il se passe aussi quelque chose quand on scrolle, pas
 * seulement au chargement — désactivé automatiquement si l'utilisateur
 * préfère moins d'animations.
 */
export function PageIllustration({ multiple = false }: { multiple?: boolean }) {
  const parallax1 = useScrollParallax(0.12);
  const parallax2 = useScrollParallax(-0.08);
  const parallax3 = useScrollParallax(0.18);

  return (
    <>
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10"
        style={{ transform: `translate(-25%, ${parallax1}px)` }}
        aria-hidden="true"
      >
        <div className="animate-float motion-reduce:animate-none">
          <Image className="max-w-none" src={Illustration} width={846} height={594} alt="" />
        </div>
      </div>
      {multiple && (
        <>
          <div
            className="pointer-events-none absolute left-1/2 top-[400px] -z-10 -mt-20 opacity-50"
            style={{ transform: `translate(-100%, ${parallax2}px)` }}
            aria-hidden="true"
          >
            <div className="animate-float-delayed motion-reduce:animate-none">
              <Image className="max-w-none" src={BlurredShapeGray} width={760} height={668} alt="" />
            </div>
          </div>
          <div
            className="pointer-events-none absolute left-1/2 top-[440px] -z-10"
            style={{ transform: `translate(-33.333%, ${parallax3}px)` }}
            aria-hidden="true"
          >
            <div className="animate-float motion-reduce:animate-none">
              <Image className="max-w-none" src={BlurredShape} width={760} height={668} alt="" />
            </div>
          </div>
        </>
      )}
    </>
  );
}
