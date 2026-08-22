import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { PageIllustration } from "@/components/marketing/page-illustration";
import { InteractiveSphereLayer } from "@/components/marketing/interactive-sphere-layer";
import { PLATFORM_NAME } from "@/components/marketing/logo";

const PILOTE_LETTERS = "Pilote".split("");

/**
 * Habillage commun aux pages /login et /signup — refonte demandée par Nora le
 * 22/08/2026 (elle a partagé un template "split panel" qu'elle trouvait
 * sympa) avec une exigence explicite : garder quelque part la "constellation"
 * qui agrandit le titre au survol (cf. components/marketing/hero.tsx et
 * interactive-sphere-layer.tsx). Plutôt que l'image de marque statique du
 * template original (nous n'avons pas de photo produit), le panneau gauche
 * rejoue une version compacte du Hero de la page d'accueil : même dégradé
 * animé sur "Qualiopi", même sphère de particules qui suit la souris et fait
 * grossir les lettres — familier pour un visiteur qui vient de la page
 * d'accueil, sans dupliquer un tout nouvel effet.
 *
 * Le panneau gauche est masqué sous lg (le formulaire seul suffit sur
 * mobile/tablette) — un petit en-tête mobile avec le logo et le lien retour
 * est affiché à la place, en haut du panneau de formulaire.
 */
export function AuthSplitLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panneau gauche — habillage "hero" compact, visible à partir de lg */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:flex-col"
        style={{ backgroundColor: "#030712", color: "#e5e7eb" }}
      >
        <PageIllustration />

        <Link
          href="/"
          className="relative z-20 m-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-gray-300 backdrop-blur-xs transition hover:border-white/30 hover:text-white"
          aria-label="Retour à l'accueil"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>

        <div className="relative flex flex-1 flex-col items-center justify-center px-10 text-center">
          <InteractiveSphereLayer />

          <Reveal>
            <h1 className="relative z-10 pb-4 text-4xl leading-none tracking-tight">
              <span
                data-sphere-word="qualiopi"
                className="inline-block animate-gradient bg-[linear-gradient(to_right,var(--color-indigo-300),var(--color-gray-50),var(--color-indigo-400),var(--color-gray-50))] bg-[length:200%_auto] bg-clip-text font-extrabold text-transparent motion-reduce:animate-none"
              >
                Qualiopi
              </span>{" "}
              <span className="inline-block font-extralight text-gray-400">
                {PILOTE_LETTERS.map((letter, i) => (
                  <span key={i} data-sphere-letter className="inline-block">
                    {letter}
                  </span>
                ))}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={150}>
            <p className="relative z-10 max-w-sm text-lg text-indigo-200/65">
              Votre organisme de formation, certifié Qualiopi sans prise de tête.
            </p>
          </Reveal>
        </div>

        <p className="relative z-20 m-6 text-xs text-indigo-200/40">
          © {new Date().getFullYear()} {PLATFORM_NAME} — sans IA à l&apos;usage
        </p>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex flex-col justify-center bg-white px-6 py-10 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 transition hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm">Accueil</span>
            </Link>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
              <span className="h-2 w-2 rounded-full bg-indigo-500" aria-hidden="true" />
              {PLATFORM_NAME}
            </span>
          </div>

          <Link href="/" className="hidden items-center gap-2 lg:inline-flex" aria-label={PLATFORM_NAME}>
            <ShieldCheck className="h-6 w-6 text-indigo-500" aria-hidden="true" />
            <span className="text-sm tracking-wide text-gray-900">
              <span className="font-extrabold">Qualiopi</span>{" "}
              <span className="font-light text-gray-500">Pilote</span>
            </span>
          </Link>

          <h2 className="mb-2 mt-6 text-2xl font-bold text-gray-900 lg:mt-8">{title}</h2>
          <p className="mb-8 text-sm text-gray-500">{subtitle}</p>

          {children}
        </div>
      </div>
    </div>
  );
}
