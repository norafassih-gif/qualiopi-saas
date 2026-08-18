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

const FEATURES = [
  {
    icon: FileStack,
    title: "Documents générés automatiquement",
    description:
      "Programme, convention, feuilles d'émargement, attestations... rédigés à partir de vos réponses et prêts à télécharger en PDF.",
  },
  {
    icon: Layers,
    title: "Bibliothèque par domaine de formation",
    description:
      "Objectifs, modules et questionnaires adaptés à votre spécialité : langues, community management, vente, management, RH...",
  },
  {
    icon: ListChecks,
    title: "Questionnaire guidé",
    description:
      "Aucune connaissance de Qualiopi requise : des questions simples, un parcours étape par étape, sans jargon administratif.",
  },
  {
    icon: FolderArchive,
    title: "Dossier prêt pour l'audit",
    description:
      "Téléchargez l'ensemble de vos documents classés et organisés, prêts à être présentés à votre auditeur.",
  },
  {
    icon: ShieldCheck,
    title: "Conforme au référentiel",
    description:
      "Des contenus construits à partir des exigences du référentiel national qualité, sans que vous ayez à les maîtriser vous-même.",
  },
  {
    icon: Settings2,
    title: "Personnalisable",
    description:
      "Vos informations, votre logo, vos couleurs : chaque document généré porte l'identité de votre organisme.",
  },
];

export function Features() {
  return (
    <section className="relative">
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 -mt-20 -translate-x-1/2"
        aria-hidden="true"
      >
        <Image className="max-w-none" src={BlurredShapeGray} width={760} height={668} alt="" />
      </div>
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -mb-80 -translate-x-[120%] opacity-50"
        aria-hidden="true"
      >
        <Image className="max-w-none" src={BlurredShape} width={760} height={668} alt="" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-t border-gray-800 py-12 md:py-20">
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-16">
            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
              <span className="bg-linear-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
                Ce que fait {PLATFORM_NAME}
              </span>
            </div>
            <h2 className="pb-4 text-3xl font-semibold text-gray-100 md:text-4xl">
              Tout ce qu&apos;il faut pour réussir votre certification
            </h2>
            <p className="text-lg text-indigo-200/65">
              Pensé pour les personnes qui créent leur organisme de formation, pas pour les
              experts qualité.
            </p>
          </div>

          <div className="mx-auto grid max-w-sm gap-12 sm:max-w-none sm:grid-cols-2 md:gap-x-14 md:gap-y-16 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <article key={feature.title}>
                <feature.icon className="mb-3 h-6 w-6 text-indigo-500" aria-hidden="true" />
                <h3 className="mb-1 text-base font-semibold text-gray-100">{feature.title}</h3>
                <p className="text-indigo-200/65">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
