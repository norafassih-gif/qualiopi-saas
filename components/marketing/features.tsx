import Image from "next/image";
import {
  FileStack,
  Layers,
  ListChecks,
  FolderArchive,
  ShieldCheck,
  Settings2,
} from "lucide-react";
import BlurredShapeGray from "@/public/images/blurred-shape-gray.svg";
import BlurredShape from "@/public/images/blurred-shape.svg";
import { PLATFORM_NAME } from "./logo";
import { Reveal } from "./reveal";
import { ACCENT_ICON, accentAt } from "./palette";

// Couleurs tirées de la même palette que le couloir de cartes du hero
// (Phase 24) — une teinte différente par carte plutôt qu'un indigo unique,
// pour créer une harmonie avec le hero (retour de Nora).
const FEATURES = [
  {
    icon: FileStack,
    title: "Documents générés automatiquement",
    description:
      "Programme, convention, feuilles d'émargement, attestations... rédigés à partir de vos réponses et prêts à télécharger en PDF.",
    color: accentAt(1),
  },
  {
    icon: Layers,
    title: "Bibliothèque par domaine de formation",
    description:
      "Objectifs, modules et questionnaires adaptés à votre spécialité : langues, community management, vente, management, RH...",
    color: accentAt(3),
  },
  {
    icon: ListChecks,
    title: "Questionnaire guidé",
    description:
      "Aucune connaissance de Qualiopi requise : des questions simples, un parcours étape par étape, sans jargon administratif.",
    color: accentAt(5),
  },
  {
    icon: FolderArchive,
    title: "Dossier prêt pour l'audit",
    description:
      "Téléchargez l'ensemble de vos documents classés et organisés, prêts à être présentés à votre auditeur.",
    color: accentAt(7),
  },
  {
    icon: ShieldCheck,
    title: "Conforme au référentiel",
    description:
      "Des contenus construits à partir des exigences du référentiel national qualité, sans que vous ayez à les maîtriser vous-même.",
    color: accentAt(9),
  },
  {
    icon: Settings2,
    title: "Personnalisable",
    description:
      "Vos informations, votre logo, vos couleurs : chaque document généré porte l'identité de votre organisme.",
    color: accentAt(10),
  },
];

export function Features() {
  return (
    <section className="relative">
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 -mt-20 -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="animate-float motion-reduce:animate-none">
          <Image className="max-w-none" src={BlurredShapeGray} width={760} height={668} alt="" />
        </div>
      </div>
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -mb-80 -translate-x-[120%] opacity-50"
        aria-hidden="true"
      >
        <div className="animate-float-delayed motion-reduce:animate-none">
          <Image className="max-w-none" src={BlurredShape} width={760} height={668} alt="" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-t border-gray-200 py-12 md:py-20">
          <Reveal>
            <div className="mx-auto max-w-3xl pb-12 text-center md:pb-16">
              <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
                <span className="bg-linear-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
                  Ce que fait {PLATFORM_NAME}
                </span>
              </div>
              <h2 className="pb-4 text-3xl text-gray-900 md:text-4xl">
                <span className="font-extrabold">Tout ce qu&apos;il faut</span>{" "}
                <span className="font-light text-gray-500">
                  pour réussir votre certification
                </span>
              </h2>
              <p className="text-lg text-gray-600">
                Pensé pour les personnes qui créent leur organisme de formation, pas pour les
                experts qualité.
              </p>
            </div>
          </Reveal>

          <div className="mx-auto grid max-w-sm gap-12 sm:max-w-none sm:grid-cols-2 md:gap-x-14 md:gap-y-16 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.title} delay={(index % 3) * 120}>
                <article>
                  <feature.icon className={`mb-3 h-6 w-6 ${ACCENT_ICON[feature.color]}`} aria-hidden="true" />
                  <h3 className="mb-1 text-base font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
