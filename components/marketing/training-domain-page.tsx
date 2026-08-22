import Link from "next/link";
import { Check } from "lucide-react";
import { Reveal } from "./reveal";
import { NoiseCtaButton } from "./noise-cta-button";
import type { TrainingDomainContent } from "@/lib/marketing/training-domains/types";

/**
 * Rendu partagé pour toutes les pages /formations/[slug]. Un seul
 * composant, une donnée différente par domaine (cf.
 * lib/marketing/training-domains/*.ts) — pas de page codée en dur par
 * domaine, dans le même esprit que le reste du moteur de contenu.
 */
export function TrainingDomainPage({ content }: { content: TrainingDomainContent }) {
  return (
    <>
      <section className="relative">
        <div className="mx-auto max-w-4xl px-4 pt-16 text-center sm:px-6 md:pt-24">
          <Reveal>
            <span className="inline-flex items-center gap-3 pb-5 text-sm text-gray-600 before:h-px before:w-6 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-6 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
              Domaine de formation
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="pb-6 text-4xl leading-tight text-gray-900 md:text-5xl">
              <span className="font-extrabold">{content.label}</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">{content.heroIntro}</p>
          </Reveal>
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
          <Reveal>
            <h2 className="mb-8 text-2xl font-extrabold text-gray-900">
              Objectifs pédagogiques couverts par la banque de contenu
            </h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2">
            {content.objectiveGroups.map((group, index) => (
              <Reveal key={group.title} delay={index * 80}>
                <div className="h-full rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <h3 className="mb-3 text-sm font-semibold text-indigo-700">{group.title}</h3>
                  <ul className="flex flex-col gap-2">
                    {group.objectives.map((objective) => (
                      <li key={objective} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
          <Reveal>
            <h2 className="mb-3 text-2xl font-extrabold text-gray-900">
              Un programme qui s&apos;adapte automatiquement
            </h2>
            <p className="mb-8 text-gray-600">{content.modulesStandard.label}</p>
          </Reveal>
          <div className="mb-10 flex flex-col gap-3">
            {content.modulesStandard.modules.map((module, index) => (
              <Reveal key={module.title} delay={index * 60}>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <span className="text-sm text-gray-700">{module.title}</span>
                  <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    {module.durationLabel}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          {content.modulesVariant ? (
            <>
              <Reveal>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{content.modulesVariant.label}</h3>
                <p className="mb-6 text-sm text-gray-600">{content.modulesVariant.context}</p>
              </Reveal>
              <div className="flex flex-col gap-3">
                {content.modulesVariant.modules.map((module, index) => (
                  <Reveal key={module.title} delay={index * 60}>
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                      <span className="text-sm text-gray-700">{module.title}</span>
                      <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                        {module.durationLabel}
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
          <Reveal>
            <h2 className="mb-6 text-2xl font-extrabold text-gray-900">Thèmes que vous pouvez cocher</h2>
          </Reveal>
          <Reveal delay={80}>
            <div className="flex flex-wrap gap-2">
              {content.checkableThemes.map((theme) => (
                <span
                  key={theme}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
                >
                  {theme}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 text-gray-600">{content.documentsNote}</p>
          </Reveal>
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
          <Reveal>
            <h2 className="mb-8 text-2xl font-extrabold text-gray-900">Questions fréquentes</h2>
          </Reveal>
          <div className="flex flex-col gap-4">
            {content.faqs.map((faq, index) => (
              <Reveal key={faq.question} delay={index * 80}>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">{faq.question}</h3>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-4xl px-4 pb-16 text-center sm:px-6 md:pb-24">
          <Reveal>
            <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
              <div>
                <NoiseCtaButton href="/signup" className="mb-4 w-full sm:mb-0 sm:w-auto">
                  Créer mon compte
                </NoiseCtaButton>
              </div>
              <div>
                <Link
                  href="/tarifs"
                  className="flex w-full items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-600 transition duration-300 hover:scale-105 hover:border-gray-400 hover:text-gray-900 sm:ml-4 sm:w-auto"
                >
                  Voir les tarifs
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
