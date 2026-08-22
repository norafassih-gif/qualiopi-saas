import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { PageIllustration } from "@/components/marketing/page-illustration";
import { TrainingDomainPage } from "@/components/marketing/training-domain-page";
import { communicationContent } from "@/lib/marketing/training-domains";

export const metadata: Metadata = {
  title: "Formation Communication & Qualiopi — Logiciel Qualiopi",
  description:
    "Programme, documents et évaluations Qualiopi pour une formation en communication (stratégie éditoriale, brand voice, e-réputation), générés automatiquement à partir de votre contenu.",
};

export default function CommunicationFormationPage() {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ backgroundColor: "#ffffff", color: "#111827" }}
    >
      <MarketingHeader />
      <main className="relative grow">
        <PageIllustration />
        <TrainingDomainPage content={communicationContent} />
      </main>
      <MarketingFooter />
    </div>
  );
}
