import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { PageIllustration } from "@/components/marketing/page-illustration";
import { Reveal } from "@/components/marketing/reveal";
import { trainingDomainIndex } from "@/lib/marketing/training-domains";

export const metadata: Metadata = {
  title: "Domaines de formation couverts — Logiciel Qualiopi",
  description:
    "Les 10 domaines de formation pour lesquels Qualiopi Pilote dispose d'une banque de contenu dédiée (objectifs, modules, évaluations).",
};

/**
 * Page publique 100 % statique. Les 10 catégories réelles de
 * training_categories sont toutes listées ; seules celles avec une page
 * dédiée déjà écrite (slug non-nul) sont cliquables — pas de lien mort ni
 * de survente de contenu qui n'existe pas encore.
 */
export default function FormationsIndexPage() {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ backgroundColor: "#ffffff", color: "#111827" }}
    >
      <MarketingHeader />
      <main className="relative grow">
        <PageIllustration />
        <section className="relative">
          <div className="mx-auto max-w-4xl px-4 pt-16 text-center sm:px-6 md:pt-24">
            <Reveal>
              <h1 className="pb-6 text-4xl leading-tight text-gray-900 md:text-5xl">
                <span className="font-extrabold">Un dossier Qualiopi adapté</span>{" "}
                <span className="font-light text-gray-500">à votre domaine de formation</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                Qualiopi Pilote construit une banque de contenu dédiée par domaine — objectifs
                pédagogiques, modules, questionnaires de positionnement et évaluations écrits pour
                votre métier, pas des généralités interchangeables.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="relative">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
            <div className="grid gap-4 sm:grid-cols-2">
              {trainingDomainIndex.map((domain, index) => {
                const card = (
                  <div
                    className={`h-full rounded-2xl border border-gray-200 bg-gray-50 p-5 transition ${
                      domain.slug ? "hover:border-indigo-300 hover:bg-white hover:shadow-sm" : ""
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h2 className="text-base font-semibold text-gray-900">{domain.label}</h2>
                      {domain.slug ? (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          Page détaillée
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-600">{domain.description}</p>
                  </div>
                );

                return (
                  <Reveal key={domain.categoryId} delay={index * 60}>
                    {domain.slug ? (
                      <Link href={`/formations/${domain.slug}`}>{card}</Link>
                    ) : (
                      card
                    )}
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
