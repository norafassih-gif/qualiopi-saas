// Découpe une session de formation en demi-journées (matin / après-midi),
// du premier au dernier jour — une feuille d'émargement Qualiopi doit être
// signée par chaque participant à CHAQUE demi-journée, pas une seule fois
// pour toute la formation (cf. le texte d'en-tête du modèle "feuille_emargement"
// en base : "une page est générée automatiquement pour chaque demi-journée").
//
// Fonction pure (pas de "use server") : utilisée à la fois côté serveur
// (lib/engine/document-builder.ts, pour générer le PDF) et côté page serveur
// (app/(app)/emargement/page.tsx, pour afficher l'écran de signature) — cf.
// lib/actions/beneficiary-dedup.ts pour la même raison de découpage.
export type AttendanceSlot = "matin" | "apres_midi";

export type AttendancePeriod = { date: string; slot: AttendanceSlot };

export const ATTENDANCE_SLOT_LABELS: Record<AttendanceSlot, string> = {
  matin: "Matin",
  apres_midi: "Après-midi",
};

// Garde-fou : pas plus de 60 jours (~ largement au-delà d'une formation
// courte comme longue) pour éviter une génération démesurée si une date de
// fin erronée était saisie très loin dans le futur.
const MAX_DAYS = 60;

export function computeAttendancePeriods(
  startDate: string | null,
  endDate: string | null
): AttendancePeriod[] {
  if (!startDate) return [];
  const start = new Date(startDate + "T00:00:00Z");
  if (Number.isNaN(start.getTime())) return [];

  const end = endDate ? new Date(endDate + "T00:00:00Z") : start;
  const effectiveEnd = Number.isNaN(end.getTime()) || end < start ? start : end;

  const periods: AttendancePeriod[] = [];
  const cursor = new Date(start);
  let days = 0;
  while (cursor <= effectiveEnd && days < MAX_DAYS) {
    const iso = cursor.toISOString().slice(0, 10);
    periods.push({ date: iso, slot: "matin" });
    periods.push({ date: iso, slot: "apres_midi" });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    days += 1;
  }
  return periods;
}

export function formatPeriodLabel(period: AttendancePeriod): string {
  const date = new Date(period.date + "T00:00:00Z");
  const dateLabel = Number.isNaN(date.getTime())
    ? period.date
    : date.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" });
  return `${dateLabel} — ${ATTENDANCE_SLOT_LABELS[period.slot]}`;
}
