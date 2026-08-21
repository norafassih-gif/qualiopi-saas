import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";

/**
 * Habillage commun aux pages légales (mentions légales, CGU, CGV,
 * confidentialité, cookies) — même thème sombre que le reste du site
 * public (cf. app/tarifs/page.tsx), pour que ces pages ne détonnent pas
 * visuellement du reste du site.
 */
export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ backgroundColor: "#030712", color: "#e5e7eb" }}
    >
      <MarketingHeader />
      <main className="relative grow">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-indigo-200/65">Dernière mise à jour : {updated}</p>
          <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-gray-300 sm:text-base">
            {children}
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-10 text-xl font-semibold text-white sm:text-2xl">{children}</h2>;
}

export function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

export function Ul({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-6 marker:text-indigo-400">{children}</ul>;
}

/** Met en évidence un point encore à confirmer par Nora avant mise en ligne définitive. */
export function TODO({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-amber-300 ring-1 ring-inset ring-amber-400/30">
      {children}
    </span>
  );
}

export function InternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-indigo-300 underline underline-offset-2 hover:text-indigo-200">
      {children}
    </Link>
  );
}
