"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Sparkles, ShieldCheck, FileText, Globe2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCENT_CARD, type AccentColor } from "./palette";

type Step = {
  num: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: AccentColor;
  /** Fenêtre de progression du scroll (0-1) où cette carte est au premier plan. */
  from: number;
  to: number;
};

const STEPS: Step[] = [
  {
    num: "01",
    icon: Sparkles,
    title: "Sans IA à l'usage",
    description:
      "Des règles et une bibliothèque de contenus, pas un abonnement à une IA qui facture chaque document généré.",
    accent: "indigo",
    from: 0.02,
    to: 0.27,
  },
  {
    num: "02",
    icon: ShieldCheck,
    title: "100 % conforme Qualiopi",
    description: "Chaque document reprend les indicateurs attendus à l'audit — sans jargon à déchiffrer.",
    accent: "emerald",
    from: 0.27,
    to: 0.52,
  },
  {
    num: "03",
    icon: FileText,
    title: "Vos documents en un clic",
    description: "Programme, convention, émargement, attestation... générés en PDF, à vos couleurs.",
    accent: "amber",
    from: 0.52,
    to: 0.77,
  },
  {
    num: "04",
    icon: Globe2,
    title: "Votre site inclus",
    description: "Les informations de votre organisme génèrent aussi votre mini-site professionnel.",
    accent: "sky",
    from: 0.77,
    to: 1,
  },
];

/**
 * Section "hero produit" : un ordinateur stylisé tourne en 3D pendant que le
 * visiteur défile, son écran affiche une animation de données abstraite, et
 * des cartes en verre dépoli apparaissent à gauche au fil du défilement.
 *
 * Inspiré du composant "MacBook Neo Hero" (21st.dev, par Jean Duthil) que
 * Nora avait repéré dans un enregistrement d'écran (22/08/2026) — mais
 * reconstruit sans séquence d'images : l'original scrube 941 photos réelles
 * d'un MacBook, ce qui suppose un vrai objet photographié/rendu que nous
 * n'avons pas (Qualiopi Pilote n'a pas d'objet physique à mettre en scène).
 * Choix de Nora : la rotation vient d'un objet 3D en CSS (perspective +
 * rotateY/rotateX), et l'écran affiche une animation stylisée plutôt que de
 * vraies captures du logiciel.
 *
 * Le défilement pilote uniquement des `MotionValue` (useScroll/useTransform,
 * "motion") — jamais de `setState` par frame, cf. skill apple-style-website
 * ("garder l'animation hors du chemin de rendu React"). L'animation de
 * l'écran (barres, ligne, pastilles) est ambiante et tourne en CSS pur
 * (@keyframes déclarés dans app/globals.css), indépendamment du scroll.
 */
export function RotatingDeviceHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const rotateY = useTransform(scrollYProgress, [0, 1], [32, -10]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [8, 3]);
  const deviceScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.86, 1, 1.04]);

  return (
    // Le "scroll-jacking" (section très haute + panneau fixé à l'écran
    // pendant le défilement) n'est activé qu'à partir de `lg` : en dessous,
    // forcer 380vh de défilement pour au final n'afficher que du contenu
    // déjà statique (les 4 cartes empilées ci-dessous) serait juste une
    // perte de temps de scroll sur mobile, sans le bénéfice visuel du
    // panneau à deux colonnes. Sous `lg`, la section redevient un bloc
    // normal, de hauteur naturelle.
    <section ref={containerRef} className="relative lg:h-[380vh]">
      <div className="flex flex-col items-center gap-10 py-16 lg:sticky lg:top-0 lg:h-screen lg:flex-row lg:justify-center lg:overflow-hidden lg:py-0">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-16">
          {/* Cartes info à gauche (desktop uniquement — voir la version empilée plus bas) */}
          <div className="relative hidden h-[320px] lg:block" aria-label="Ce qui change avec Qualiopi Pilote">
            {STEPS.map((step) => (
              <StepCard key={step.num} step={step} progress={scrollYProgress} />
            ))}
          </div>

          {/* Ordinateur qui tourne (rotation liée au scroll seulement à partir de lg — cf. plus haut) */}
          <div className="flex justify-center" style={{ perspective: "1400px" }}>
            <motion.div
              className="relative"
              style={{ rotateY, rotateX, scale: deviceScale, transformStyle: "preserve-3d" }}
            >
              <DeviceScreen />
            </motion.div>
          </div>

          {/* Même contenu, empilé normalement, sous l'écran — en dessous de lg */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
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
    </section>
  );
}

/**
 * Construit les points [entrée, sortie] d'un fondu autour de [from, to], en
 * retirant les points consécutifs identiques (ex. quand `to` touche déjà la
 * borne 0 ou 1) — `useTransform` exige une séquence strictement croissante.
 */
function fadeWindow(from: number, to: number) {
  const input = [Math.max(0, from - 0.06), from, to, Math.min(1, to + 0.06)];
  const output = [0, 1, 1, 0];
  const dedupedInput: number[] = [];
  const dedupedOutput: number[] = [];
  input.forEach((value, i) => {
    if (i === 0 || value > dedupedInput[dedupedInput.length - 1]) {
      dedupedInput.push(value);
      dedupedOutput.push(output[i]);
    }
  });
  return { input: dedupedInput, output: dedupedOutput };
}

function StepCard({ step, progress }: { step: Step; progress: MotionValue<number> }) {
  const Icon = step.icon;
  // Fondu + léger décalage horizontal : la carte est au premier plan sur sa
  // fenêtre [from, to], invisible ailleurs. Les quatre cartes occupent le
  // même emplacement (empilées) — c'est le fondu qui fait "défiler" l'info,
  // pas une position qui change.
  //
  // `useTransform` exige des points strictement croissants : pour la
  // dernière carte, `to` vaut déjà 1, donc "to + 0.06" plafonné à 1 dupliquait
  // le dernier point (1, 1) — Motion produisait alors une opacité NaN, que le
  // navigateur affiche comme pleinement opaque. Résultat : la carte 04/04
  // restait visible en permanence, y compris tout en haut du scroll. On
  // filtre ici les points en double avant de les passer à useTransform.
  const { input: opacityInput, output: opacityOutput } = fadeWindow(step.from, step.to);
  const opacity = useTransform(progress, opacityInput, opacityOutput);
  const x = useTransform(progress, [Math.max(0, step.from - 0.06), step.from], [-16, 0]);

  return (
    <motion.div
      style={{ opacity, x }}
      className={cn(
        "absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-2xl border bg-linear-to-br p-5 shadow-lg backdrop-blur-md",
        ACCENT_CARD[step.accent],
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-medium opacity-70">
        <span>{step.num}</span>
        <span>/ 04</span>
      </div>
      <Icon className="mb-3 h-6 w-6" aria-hidden="true" />
      <h3 className="mb-1.5 text-lg font-semibold">{step.title}</h3>
      <p className="text-sm opacity-80">{step.description}</p>
    </motion.div>
  );
}

/**
 * Silhouette d'ordinateur stylisée (pas de vraie photo) + écran affichant une
 * animation de données abstraite (barres, ligne, pastilles) en boucle
 * continue — purement décoratif, mis en pause via `motion-reduce` (cf. §5 du
 * skill apple-style-website).
 */
function DeviceScreen() {
  const bars = [0.5, 0.85, 0.4, 0.95, 0.6, 0.75];

  return (
    <div className="w-[min(80vw,480px)]">
      {/* Écran */}
      <div className="rounded-t-2xl border-[10px] border-gray-900 bg-gray-900 shadow-2xl">
        <div className="aspect-16/10 overflow-hidden rounded-lg bg-white">
          {/* Barre de fenêtre */}
          <div className="flex items-center gap-1.5 border-b border-gray-100 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>

          <div className="flex h-[calc(100%-2.5rem)] flex-col justify-center gap-5 px-6 py-4">
            {/* Lignes "squelette" */}
            <div className="space-y-2">
              <div className="animate-data-pulse h-2 w-2/3 rounded-full bg-indigo-100 motion-reduce:[animation-play-state:paused]" />
              <div
                className="animate-data-pulse h-2 w-1/2 rounded-full bg-gray-100 motion-reduce:[animation-play-state:paused]"
                style={{ animationDelay: "0.4s" }}
              />
            </div>

            {/* Mini graphique en barres */}
            <div className="flex h-16 items-end gap-2">
              {bars.map((h, i) => (
                <span
                  key={i}
                  className="animate-data-bar w-full origin-bottom rounded-t-sm bg-linear-to-t from-indigo-400 to-sky-300 motion-reduce:[animation-play-state:paused]"
                  style={{ height: `${h * 100}%`, animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </div>

            {/* Ligne de données animée */}
            <svg viewBox="0 0 300 40" className="h-8 w-full overflow-visible" aria-hidden="true">
              <path
                d="M0,30 C40,10 80,45 120,20 C160,-5 200,35 240,15 C270,3 285,20 300,12"
                fill="none"
                stroke="url(#device-line-gradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="320"
                className="animate-data-line motion-reduce:[animation-play-state:paused]"
              />
              <defs>
                <linearGradient id="device-line-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--color-indigo-500)" />
                  <stop offset="100%" stopColor="var(--color-sky-400)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Socle */}
      <div className="mx-auto h-3 w-[104%] -translate-x-[2%] rounded-b-xl bg-gray-800 shadow-lg" />
      <div className="mx-auto h-1.5 w-1/4 rounded-b-md bg-gray-700" />
    </div>
  );
}
