import { Sparkles, ShieldCheck, FileText, Globe2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCENT_GLASS, type AccentColor } from "./palette";

type Notion = {
  num: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: AccentColor;
};

const NOTIONS: Notion[] = [
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

/**
 * Grille statique des 4 mêmes "notions" utilisées dans les héros précédents
 * (Phase 26 : cartes au fil du scroll à côté de l'ordinateur ; Phase 27 :
 * plaquettes qui se succèdent au fondu) — reprises ici telles quelles, mais
 * simplement affichées côte à côte, sans aucune animation liée au scroll.
 * Conserve le message déjà construit/validé sans le lier à un mécanisme de
 * héro particulier, qui a changé plusieurs fois dans la même conversation.
 *
 * Phase 27ter (24/08/2026) : cartes restylées en "verre liquide" sombre
 * (`ACCENT_GLASS`, cf. palette.ts) pour reprendre l'esthétique des vignettes
 * du hero (`MarqueeHero`), suite au retour de Nora ("cas doivent être
 * flottantes et en glacis liquide") — remplace l'ancien fond pastel clair
 * (`ACCENT_CARD`). Léger flottement vertical continu (`animate-float-card`,
 * défini dans `app/globals.css`) avec un décalage différent par carte pour
 * un mouvement organique plutôt que synchronisé ; mis en pause si
 * `prefers-reduced-motion` (cf. skill `apple-style-website`, § 5).
 */
export function NotionsGrid() {
  return (
    <section className="relative bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {NOTIONS.map((notion, index) => {
            const Icon = notion.icon;
            return (
              <div
                key={notion.num}
                style={{ animationDelay: `${index * 350}ms` }}
                className={cn(
                  "animate-float-card relative overflow-hidden rounded-2xl border p-6 shadow-xl transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:animate-none",
                  ACCENT_GLASS[notion.accent],
                )}
              >
                {/* Liseré clair en haut — même effet "matériau" que les vignettes du hero. */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/25" />
                <div className="mb-3 flex items-center gap-2 text-xs font-medium text-white/50">
                  <span>{notion.num}</span>
                  <span>/ 04</span>
                </div>
                <Icon className="mb-3 h-6 w-6 text-white" aria-hidden="true" />
                <h3 className="mb-1.5 text-base font-semibold text-white">{notion.title}</h3>
                <p className="text-sm text-white/70">{notion.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
