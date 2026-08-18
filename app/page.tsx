import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { PageIllustration } from "@/components/marketing/page-illustration";
import { MarketingHero } from "@/components/marketing/hero";
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
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ backgroundColor: "#030712", color: "#e5e7eb" }}
    >
      <MarketingHeader />
      <main className="relative grow">
        <PageIllustration multiple />
        <MarketingHero />
        <HowItWorks />
        <Features />
        <MarketingCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
