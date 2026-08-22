import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { PageIllustration } from "@/components/marketing/page-illustration";
import { MarketingHero } from "@/components/marketing/hero";
import { RotatingDeviceHero } from "@/components/marketing/rotating-device-hero";
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
          Zone clippée localement (illustrations/halo qui débordent
          volontairement de chaque côté) — le clip n'est PLUS posé sur ce
          <div> ni sur <main>/le conteneur racine ci-dessus : un ancêtre en
          `overflow: hidden`/`auto`/`scroll` casse `position: sticky` pour
          TOUS ses descendants (y compris loin en dessous), même si cet
          ancêtre ne déborde jamais lui-même. C'est exactement ce qui rendait
          RotatingDeviceHero non collant (Phase 26) : le clip qui vivait ici
          au niveau de la page entière empêchait son <div className="sticky">
          de se fixer à l'écran pendant le scroll. Chaque section qui a
          besoin de clipper son propre débordement décoratif le fait
          désormais elle-même (footer.tsx, features.tsx) plutôt que de
          compter sur un clip posé plus haut.
        */}
        <div className="relative overflow-hidden">
          <PageIllustration multiple />
          <MarketingHero />
        </div>
        <RotatingDeviceHero />
        <HowItWorks />
        <Features />
        <MarketingCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
