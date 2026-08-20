import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { PageIllustration } from "@/components/marketing/page-illustration";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { MarketingCta } from "@/components/marketing/cta";

export const metadata: Metadata = {
  title: "Tarifs — Logiciel Qualiopi",
  description:
    "Documents de preuve Qualiopi, site internet, accompagnement à l'audit et plateforme de formation en ligne : les formules disponibles.",
};

/**
 * Page publique de tarifs — volontairement sans dépendance à Supabase
 * (page 100 % statique, accessible que l'utilisateur soit connecté ou non).
 * Grille tarifaire détaillée et sourcée dans claude/roadmap-produit-et-tarifs.md.
 */
export default function TarifsPage() {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ backgroundColor: "#030712", color: "#e5e7eb" }}
    >
      <MarketingHeader />
      <main className="relative grow">
        <PageIllustration />
        <PricingPlans />
        <MarketingCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
