import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { PageIllustration } from "@/components/marketing/page-illustration";
import { TrainingDomainPage } from "@/components/marketing/training-domain-page";
import { communityManagementContent } from "@/lib/marketing/training-domains";

export const metadata: Metadata = {
  title: "Formation Community Management & Qualiopi — Logiciel Qualiopi",
  description:
    "Programme, documents et évaluations Qualiopi pour une formation en Community Management / réseaux sociaux, générés automatiquement à partir de votre contenu.",
};

/**
 * Page publique 100 % statique (aucune dépendance Supabase) — cf. le même
 * principe que /tarifs. Contenu source : lib/marketing/training-domains/
 * community-management.ts, issu de la vraie banque de contenu du domaine.
 */
export default function CommunityManagementFormationPage() {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ backgroundColor: "#ffffff", color: "#111827" }}
    >
      <MarketingHeader />
      <main className="relative grow">
        <PageIllustration />
        <TrainingDomainPage content={communityManagementContent} />
      </main>
      <MarketingFooter />
    </div>
  );
}
