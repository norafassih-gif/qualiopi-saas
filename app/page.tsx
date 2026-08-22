import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { HeroScrollNotions } from "@/components/marketing/hero-scroll-notions";
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
          Phase 27 : remplace à la fois `MarketingHero` (titre + sphère de
          particules "constellation" qui suivait la souris) et
          `RotatingDeviceHero` (Phase 26, l'ordinateur qui tournait) par un
          seul hero "scroll-reveal" — titre/CTA d'abord, qui s'efface au
          scroll pour laisser place aux 4 plaquettes (cf.
          hero-scroll-notions.tsx pour le détail et le contexte de la
          demande). Les deux anciens composants restent dans le dépôt,
          inutilisés, plutôt que supprimés (au cas où) — même logique que
          `principles-corridor.tsx`/`stream-corridor.tsx` en Phase 25/26.

          `PageIllustration`/`Glow` (halo + formes floues décoratives) sont
          désormais rendus À L'INTÉRIEUR de `HeroScrollNotions`, sur
          l'élément qui porte lui-même `overflow-hidden` — pas ici sur un
          ancêtre du panneau sticky, ce qui casserait `position: sticky`
          (cf. la note laissée dans ce composant).
        */}
        <HeroScrollNotions />
        <HowItWorks />
        <Features />
        <MarketingCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
