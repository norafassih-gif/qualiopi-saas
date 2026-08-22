import Image from "next/image";
import Link from "next/link";
import FooterIllustration from "@/public/images/footer-illustration.svg";
import { Logo, PLATFORM_NAME } from "./logo";

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    // Clip local (l'illustration ci-dessous, 1076px, déborde sur les petits
    // écrans) — plutôt qu'un clip posé plus haut sur la page, qui casserait
    // `position: sticky` pour les sections situées avant le footer dans le
    // DOM (cf. app/page.tsx). Sans risque ici : le footer n'est l'ancêtre de
    // rien d'autre.
    <footer className="relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -translate-x-1/2"
          aria-hidden="true"
        >
          <Image className="max-w-none" src={FooterIllustration} width={1076} height={378} alt="" />
        </div>

        <div className="flex flex-col items-center gap-3 py-8 text-center md:py-12">
          <Logo />
          <p className="max-w-md text-sm text-gray-600">
            Préparez votre certification Qualiopi sans connaissance préalable du référentiel —
            questionnaires guidés, documents générés automatiquement.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-600">
            <li>
              <Link href="/formations" className="transition hover:text-gray-900">
                Domaines de formation
              </Link>
            </li>
            <li>
              <Link href="/tarifs" className="transition hover:text-gray-900">
                Tarifs
              </Link>
            </li>
          </ul>
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-500">
            <li>
              <Link href="/mentions-legales" className="transition hover:text-gray-900">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/cgu" className="transition hover:text-gray-900">
                CGU
              </Link>
            </li>
            <li>
              <Link href="/cgv" className="transition hover:text-gray-900">
                CGV
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="transition hover:text-gray-900">
                Confidentialité
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="transition hover:text-gray-900">
                Cookies
              </Link>
            </li>
          </ul>
          <p className="text-xs text-gray-600">
            © {year} {PLATFORM_NAME}
          </p>
        </div>
      </div>
    </footer>
  );
}
