"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Sparkles, ShieldCheck, FileText, Globe2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCENT_CARD, type AccentColor } from "./palette";
import { NoiseCtaButton } from "./noise-cta-button";
import { Glow } from "./glow";
import { PageIllustration } from "./page-illustration";

type Step = {
  num: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: AccentColor;
};

const STEPS: Step[] = [
  {
    num: "01",
    icon: Sparkles,
    title: "Sans IA à l'usage",
    description:
      "Des règles et une bibliothèque de contenus, pas un abonnement à une IA qui facture chaque document généré.",
    accent: "indigo",
  },
  {
    num: "02",
    icon: ShieldCheck,
    title: "100 % conforme Qualiopi",
    description: "Chaque document reprend les indicateurs attendus à l'audit — sans jargon à déchiffrer.",
    accent: "emerald",
  },
  {
    num: "03",
    icon: FileText,
    title: "Vos documents en un clic",
    description: "Programme, convention, émargement, attestation... générés en PDF, à vos couleurs.",
    accent: "amber",
  },
  {
    num: "04",
    icon: Globe2,
    title: "Votre site inclus",
    description: "Les informations de votre organisme génèrent aussi votre mini-site professionnel.",
    accent: "sky",
  },
];

/** Une fenêtre de scroll [from, to] par diapositive (titre + une par notion), réparties à parts égales sur [0, 1]. */
const SLIDE_COUNT = STEPS.length + 1;
const WINDOWS = Array.from({ length: SLIDE_COUNT }, (_, i) => ({
  from: i / SLIDE_COUNT,
  to: (i + 1) / SLIDE_COUNT,
}));

/**
 * Hero "scroll-reveal" : le titre + le CTA sont visibles en premier, puis
 * s'effacent au défilement pour laisser place, une à une, aux quatre
 * "notions" (les mêmes différenciateurs que la Phase 26) présentées sur des
 * plaquettes — sans ordinateur ni illustration 3D à côté.
 *
 * Remplace à la fois `MarketingHero` (titre + sphère de particules
 * "constellation" qui suivait la souris) et `RotatingDeviceHero` (Phase 26,
 * l'ordinateur qui tournait) : Nora a demandé de retirer les deux blocs et de
 * ne garder que "le titre, le texte et le CTA, puis les textes s'effacent
 * quand on scrolle et on voit les notions sur les plaquettes" (23/08/2026).
 *
 * Nora avait aussi repéré le "3D Marquee" d'Aceternity (grille d'images
 * inclinée en 3D, défilement continu) comme inspiration "plus dynamique".
 * Ce composant-là attend un tableau d'*images* (captures, photos) — or on
 * n'a ni captures réelles à montrer (produit encore en construction visuelle)
 * ni consigne sur leur contenu. Sa réponse à la question de clarification a
 * décrit un mécanisme différent (texte qui s'efface → plaquettes qui
 * apparaissent), qui correspond exactement au moteur de fondu au scroll déjà
 * construit et vérifié en Phase 26 (`fadeWindow`) — c'est celui-ci qui est
 * repris ici, sans les images. Le vrai marquee à images reste possible si
 * Nora le confirme once elle a du contenu visuel (captures du produit fini,
 * ou visuels de documents) à y mettre.
 */
export function HeroScrollNotions() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    // Scroll-jacking réservé à `lg` (cf. Phase 26) : sous `lg`, la section
    // redevient un bloc statique de hauteur naturelle (titre, puis les 4
    // plaquettes empilées normalement).
    <section ref={containerRef} className="relative lg:h-[440vh]">
      <div className="relative flex flex-col items-center justify-center overflow-hidden py-16 lg:sticky lg:top-0 lg:h-screen lg:py-0">
        {/*
          Décor (halo + formes floues) posé ici, sur l'élément qui porte déjà
          `overflow-hidden` — jamais sur un ancêtre du panneau sticky, cf. la
          note de app/page.tsx : `overflow-hidden` sur un ancêtre casse
          `position: sticky` pour tous ses descendants, même sans déborder
          lui-même. Ici l'élément qui clippe EST l'élément sticky, donc aucun
          conflit (une sticky peut clipper son propre contenu sans se
          casser elle-même).
        */}
        <PageIllustration multiple />
        <Glow />

        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          {/* Desktop : titre puis 4 plaquettes, empilés au même endroit, fondus au scroll */}
          <div className="relative hidden lg:block lg:h-[420px]">
            <TitleSlide progress={scrollYProgress} window={WINDOWS[0]} />
            {STEPS.map((step, i) => (
              <StepSlide key={step.num} step={step} progress={scrollYProgress} window={WINDOWS[i + 1]} />
            ))}
          </div>

          {/* Mobile/tablette : contenu statique, pas de fondu ni de scroll-jacking */}
          <div className="lg:hidden">
            <TitleBlock />
            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.num}
                    className={cn(
                      "rounded-2xl border bg-linear-to-br p-4 shadow-sm",
                      ACCENT_CARD[step.accent],
                    )}
                  >
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium opacity-70">
                      <span>{step.num}</span>
                      <span>/ 04</span>
                    </div>
                    <Icon className="mb-2 h-5 w-5" aria-hidden="true" />
                    <h3 className="mb-1 text-sm font-semibold">{step.title}</h3>
                    <p className="text-xs opacity-80">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Construit les points [entrée, sortie] d'un fondu autour de [from, to] —
 * `useTransform` exige une séquence strictement croissante (cf. bug NaN de
 * la Phase 26 : deux points à la même abscisse produisent une opacité NaN,
 * que le navigateur affiche comme pleinement opaque).
 *
 * Les points "tampon" (from-0.06 / to+0.06) ne sont ajoutés que s'ils
 * tombent strictement à l'intérieur de [0, 1] : à `from = 0` (la toute
 * première diapositive) le point tampon collision­nerait avec `from`
 * lui-même — inutile de toute façon, rien ne doit s'estomper *avant* le
 * tout début du scroll. Même logique en miroir à `to = 1` (la dernière
 * diapositive doit rester visible jusqu'à la fin, pas de fondu de sortie).
 */
function fadeWindow(from: number, to: number) {
  const input: number[] = [];
  const output: number[] = [];
  if (from > 0) {
    input.push(Math.max(0, from - 0.06));
    output.push(0);
  }
  input.push(from);
  output.push(1);
  input.push(to);
  output.push(1);
  if (to < 1) {
    input.push(Math.min(1, to + 0.06));
    output.push(0);
  }
  return { input, output };
}

function TitleSlide({
  progress,
  window,
}: {
  progress: MotionValue<number>;
  window: { from: number; to: number };
}) {
  const { input, output } = fadeWindow(window.from, window.to);
  const opacity = useTransform(progress, input, output);
  // Désactive les clics sur le titre/CTA une fois effacé, pour ne pas
  // bloquer les plaquettes qui apparaissent au même endroit derrière lui.
  const pointerEvents = useTransform(opacity, (v) => (v > 0.05 ? "auto" : "none"));

  return (
    <motion.div style={{ opacity, pointerEvents }} className="absolute inset-0 flex items-center justify-center">
      <TitleBlock />
    </motion.div>
  );
}

function TitleBlock() {
  return (
    <div className="text-center">
      <span className="inline-flex items-center gap-3 pb-5 text-sm text-gray-600 before:h-px before:w-6 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-6 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
        Sans IA, sans jargon Qualiopi
      </span>
      <h1 className="pb-6 text-5xl leading-none tracking-tight md:text-7xl">
        <span className="inline-block animate-gradient bg-[linear-gradient(to_right,var(--color-indigo-600),var(--color-gray-900),var(--color-indigo-500),var(--color-gray-900))] bg-[length:200%_auto] bg-clip-text font-extrabold text-transparent motion-reduce:animate-none">
          Qualiopi
        </span>{" "}
        <span className="inline-block font-extralight text-gray-500">Pilote</span>
      </h1>
      <p className="mx-auto max-w-2xl text-xl font-medium text-gray-700 md:text-2xl">
        Votre organisme de formation, certifié Qualiopi sans prise de tête.
      </p>
      <p className="mx-auto mb-8 mt-4 max-w-2xl text-lg text-gray-600">
        Répondez à des questions simples : le logiciel construit automatiquement votre programme de
        formation et génère tous les documents de votre dossier, prêts pour l&apos;audit.
      </p>
      <div className="mx-auto flex max-w-xs flex-col items-center sm:max-w-none sm:flex-row sm:justify-center">
        <NoiseCtaButton href="/signup" className="mb-4 w-full sm:mb-0 sm:w-auto">
          Créer mon compte
        </NoiseCtaButton>
        <Link
          href="/login"
          className="flex w-full items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-600 transition duration-300 hover:scale-105 hover:border-gray-400 hover:text-gray-900 sm:ml-4 sm:w-auto"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}

function StepSlide({
  step,
  progress,
  window,
}: {
  step: Step;
  progress: MotionValue<number>;
  window: { from: number; to: number };
}) {
  const Icon = step.icon;
  const { input, output } = fadeWindow(window.from, window.to);
  const opacity = useTransform(progress, input, output);
  const pointerEvents = useTransform(opacity, (v) => (v > 0.05 ? "auto" : "none"));
  const y = useTransform(progress, [Math.max(0, window.from - 0.06), window.from], [16, 0]);

  return (
    <motion.div
      style={{ opacity, pointerEvents, y }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div
        className={cn(
          "w-full max-w-xl rounded-2xl border bg-linear-to-br p-8 text-center shadow-lg backdrop-blur-md",
          ACCENT_CARD[step.accent],
        )}
      >
        <div className="mb-4 flex items-center justify-center gap-2 text-xs font-medium opacity-70">
          <span>{step.num}</span>
          <span>/ 04</span>
        </div>
        <Icon className="mx-auto mb-4 h-8 w-8" aria-hidden="true" />
        <h3 className="mb-2 text-2xl font-semibold">{step.title}</h3>
        <p className="text-base opacity-80">{step.description}</p>
      </div>
    </motion.div>
  );
}
