import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarqueeHero } from "@/components/marketing/marquee-hero";
import { NotionsGrid } from "@/components/marketing/notions-grid";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Features } from "@/components/marketing/features";
import { MarketingCta } from "@/components/marketing/cta";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ backgroundColor: "#ffffff", color: "#111827" }}
    >
      <MarketingHeader />
      <main className="relative grow">
        {/*
          Phase 27bis : remplace le hero "scroll-reveal" (Phase 27,
          hero-scroll-notions.tsx) par une grille de vignettes en 3D
          (`MarqueeHero`), sur demande de Nora avec référence visuelle
          explicite ("ce n'est pas du tout ça... ça doit ressembler à ça").
          hero-scroll-notions.tsx, rotating-device-hero.tsx et hero.tsx
          restent dans le dépôt, inutilisés, plutôt que supprimés (au cas
          où) — même logique reconduite phase après phase depuis la 25.

          `MarqueeHero` est la seule section volontairement sombre du site
          (cf. le commentaire dans ce composant) — le header au-dessus
          garde son propre fond blanc/90 flottant, donc reste lisible
          quel que soit ce qu'il y a derrière lui.

          `NotionsGrid` reprend statiquement (sans scroll ni animation) les
          4 mêmes notions déjà utilisées dans les héros précédents, pour ne
          pas perdre ce contenu déjà rédigé au fil des changements de
          mécanisme visuel.
        */}
        <MarqueeHero />
        <NotionsGrid />
        <HowItWorks />
        <Features />
        <MarketingCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
