import { Sparkles, ShieldCheck, FileText, Globe2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCENT_CARD, type AccentColor } from "./palette";

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
 */
export function NotionsGrid() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {NOTIONS.map((notion) => {
            const Icon = notion.icon;
            return (
              <div
                key={notion.num}
                className={cn(
                  "rounded-2xl border bg-linear-to-br p-6 shadow-sm",
                  ACCENT_CARD[notion.accent],
                )}
              >
                <div className="mb-3 flex items-center gap-2 text-xs font-medium opacity-70">
                  <span>{notion.num}</span>
                  <span>/ 04</span>
                </div>
                <Icon className="mb-3 h-6 w-6" aria-hidden="true" />
                <h3 className="mb-1.5 text-base font-semibold">{notion.title}</h3>
                <p className="text-sm opacity-80">{notion.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
