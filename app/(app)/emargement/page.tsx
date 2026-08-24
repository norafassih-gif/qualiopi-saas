import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstTraining } from "@/lib/actions/training";
import { getMyFirstSession, getSessionBeneficiaries } from "@/lib/actions/session";
import { dedupeBeneficiaries } from "@/lib/actions/beneficiary-dedup";
import { getAttendanceSignatures } from "@/lib/actions/attendance";
import { computeAttendancePeriods } from "@/lib/engine/attendance-periods";
import { AttendanceSheet } from "./attendance-sheet";

/**
 * Écran de signature de l'émargement sur l'écran — demande explicite de
 * Nora (25/08/2026) : "avoir plusieurs apprenants, pouvoir leur faire signer
 * directement les émargements sur l'écran." Pensé pour un appareil unique
 * (tablette/ordinateur) passé de main en main pendant la formation : on
 * choisit la demi-journée, puis chaque apprenant signe à son tour dans une
 * fenêtre de signature tactile/souris. Les tracés alimentent ensuite
 * directement le PDF "Feuille d'émargement" (cf. lib/engine/document-builder.ts,
 * section "attendance_grid").
 */
export default async function EmargementPage() {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }
  const training = await getMyFirstTraining();
  if (!training) {
    redirect("/onboarding/activite");
  }
  const session = await getMyFirstSession();
  if (!session) {
    redirect("/onboarding/session");
  }

  const allBeneficiaries = await getSessionBeneficiaries(session.id);
  const beneficiaries = dedupeBeneficiaries(allBeneficiaries);
  const periods = computeAttendancePeriods(session.start_date, session.end_date);
  const signatures = await getAttendanceSignatures(session.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Émargement sur l&apos;écran</h1>
      <p className="mb-6 text-sm text-gray-600">
        Choisissez la demi-journée en cours, puis faites signer chaque apprenant directement ici
        (au doigt sur tablette, ou à la souris). Les signatures apparaissent automatiquement sur la
        feuille d&apos;émargement PDF, demi-journée par demi-journée.
      </p>

      <AttendanceSheet
        sessionId={session.id}
        beneficiaries={beneficiaries.map((b) => ({ id: b.id, full_name: b.full_name }))}
        periods={periods}
        signatures={signatures}
      />

      <a href="/documents" className="mt-8 inline-block text-sm text-blue-900 underline">
        ← Retour à mes documents
      </a>
    </div>
  );
}
