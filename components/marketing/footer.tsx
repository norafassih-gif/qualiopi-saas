import Image from "next/image";
import Link from "next/link";
import FooterIllustration from "@/public/images/footer-illustration.svg";
import { Logo, PLATFORM_NAME } from "./logo";

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -translate-x-1/2"
          aria-hidden="true"
        >
          <Image className="max-w-none" src={FooterIllustration} width={1076} height={378} alt="" />
        </div>

        <div className="flex flex-col items-center gap-3 py-8 text-center md:py-12">
          <Logo />
          <p className="max-w-md text-sm text-indigo-200/65">
            Préparez votre certification Qualiopi sans connaissance préalable du référentiel —
            questionnaires guidés, documents générés automatiquement.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-indigo-200/65">
            <li>
              <Link href="/formations" className="transition hover:text-white">
                Domaines de formation
              </Link>
            </li>
            <li>
              <Link href="/tarifs" className="transition hover:text-white">
                Tarifs
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
