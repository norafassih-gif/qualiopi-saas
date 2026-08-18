import Image from "next/image";
import Illustration from "@/public/images/page-illustration.svg";
import BlurredShapeGray from "@/public/images/blurred-shape-gray.svg";
import BlurredShape from "@/public/images/blurred-shape.svg";

/**
 * Formes décoratives en arrière-plan (dégradés flous abstraits — aucune
 * capture d'écran, aucun contenu à tenir à jour). Purement visuel.
 */
export function PageIllustration({ multiple = false }: { multiple?: boolean }) {
  return (
    <>
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/4"
        aria-hidden="true"
      >
        <Image className="max-w-none" src={Illustration} width={846} height={594} alt="" />
      </div>
      {multiple && (
        <>
          <div
            className="pointer-events-none absolute left-1/2 top-[400px] -z-10 -mt-20 -translate-x-full opacity-50"
            aria-hidden="true"
          >
            <Image className="max-w-none" src={BlurredShapeGray} width={760} height={668} alt="" />
          </div>
          <div
            className="pointer-events-none absolute left-1/2 top-[440px] -z-10 -translate-x-1/3"
            aria-hidden="true"
          >
            <Image className="max-w-none" src={BlurredShape} width={760} height={668} alt="" />
          </div>
        </>
      )}
    </>
  );
}
