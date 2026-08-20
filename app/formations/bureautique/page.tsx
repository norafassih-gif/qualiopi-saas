import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { PageIllustration } from "@/components/marketing/page-illustration";
import { TrainingDomainPage } from "@/components/marketing/training-domain-page";
import { bureautiqueContent } from "@/lib/marketing/training-domains";

export const metadata: Metadata = {
  title: "Formation Bureautique & Qualiopi — Logiciel Qualiopi",
  description:
    "Programme, documents et évaluations Qualiopi pour une formation bureautique (Word, Excel, PowerPoint, outils collaboratifs), générés automatiquement à partir de votre contenu.",
};

export default function BureautiqueFormationPage() {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ backgroundColor: "#030712", color: "#e5e7eb" }}
    >
      <MarketingHeader />
      <main className="relative grow">
        <PageIllustration />
        <TrainingDomainPage content={bureautiqueContent} />
      </main>
      <MarketingFooter />
    </div>
  );
}
