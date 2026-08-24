"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMyFirstSession } from "@/lib/actions/session";
import type { AttendanceSlot } from "@/lib/engine/attendance-periods";

/**
 * Signature d'un apprenant pour une demi-journée précise d'une session —
 * demande explicite de Nora (25/08/2026) : "avoir plusieurs apprenants,
 * pouvoir leur faire signer directement les émargements sur l'écran."
 * Contrairement à beneficiaries.signature_name/signature_accepted (un simple
 * "Lu et approuvé" coché une fois pour toute la formation), une même
 * personne signe ICI une fois PAR demi-journée, et sa signature est un tracé
 * dessiné (data URL PNG capturée au doigt/à la souris), pas juste un nom
 * tapé — cf. app/(app)/emargement/signature-pad.tsx.
 */
export type AttendanceSignature = {
  id: string;
  session_id: string;
  beneficiary_id: string;
  period_date: string;
  period_slot: AttendanceSlot;
  signer_name: string;
  signature_data_url: string;
  signed_at: string;
};

export async function getAttendanceSignatures(sessionId: string): Promise<AttendanceSignature[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attendance_signatures")
    .select("*")
    .eq("session_id", sessionId);

  if (error) {
    console.error("getAttendanceSignatures", error);
    return [];
  }
  return (data ?? []) as AttendanceSignature[];
}

export type AttendanceActionState = { error: string | null };

/**
 * Enregistre (ou remplace) le tracé de signature d'un bénéficiaire pour une
 * demi-journée donnée — un upsert sur la contrainte unique
 * (session_id, beneficiary_id, period_date, period_slot) : re-signer la même
 * demi-journée remplace simplement le tracé précédent plutôt que de créer
 * une seconde ligne.
 *
 * Vérifie que sessionId correspond bien à la session de l'utilisateur
 * connecté avant d'écrire — en plus de la RLS (ceinture et bretelles, comme
 * le reste des actions de ce module).
 */
export async function recordAttendanceSignature(
  sessionId: string,
  beneficiaryId: string,
  periodDate: string,
  periodSlot: AttendanceSlot,
  signerName: string,
  signatureDataUrl: string
): Promise<AttendanceActionState> {
  const session = await getMyFirstSession();
  if (!session || session.id !== sessionId) {
    return { error: "Session introuvable." };
  }
  if (!signatureDataUrl.startsWith("data:image/")) {
    return { error: "Signature invalide — merci de réessayer." };
  }
  if (!signerName.trim()) {
    return { error: "Nom manquant." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("attendance_signatures").upsert(
    {
      session_id: sessionId,
      beneficiary_id: beneficiaryId,
      period_date: periodDate,
      period_slot: periodSlot,
      signer_name: signerName.trim(),
      signature_data_url: signatureDataUrl,
      signed_at: new Date().toISOString(),
    },
    { onConflict: "session_id,beneficiary_id,period_date,period_slot" }
  );

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  revalidatePath("/emargement");
  revalidatePath("/documents");
  return { error: null };
}

/**
 * Efface une signature déjà enregistrée (erreur de manipulation, mauvais
 * apprenant sélectionné...) pour permettre de la refaire.
 */
export async function clearAttendanceSignature(
  sessionId: string,
  beneficiaryId: string,
  periodDate: string,
  periodSlot: AttendanceSlot
): Promise<AttendanceActionState> {
  const session = await getMyFirstSession();
  if (!session || session.id !== sessionId) {
    return { error: "Session introuvable." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("attendance_signatures")
    .delete()
    .eq("session_id", sessionId)
    .eq("beneficiary_id", beneficiaryId)
    .eq("period_date", periodDate)
    .eq("period_slot", periodSlot);

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  revalidatePath("/emargement");
  revalidatePath("/documents");
  return { error: null };
}
