"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";

export type PendingAccessGrant = {
  id: string;
  reason: string | null;
  requested_at: string;
};

/**
 * Demande d'accès support en attente de réponse pour l'organisme du client
 * connecté (migration 0036) — affichée en bannière sur le dashboard. Un
 * client ne voit ici QUE ses propres demandes, quel que soit l'admin qui les
 * a créées (policy RLS "access_grants_select", is_org_member).
 */
export async function getPendingAccessGrant(): Promise<PendingAccessGrant | null> {
  const org = await getMyOrganization();
  if (!org) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_access_grants")
    .select("id, reason, requested_at")
    .eq("organization_id", org.id)
    .eq("status", "pending")
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getPendingAccessGrant", error);
    return null;
  }
  return data;
}

/**
 * Le client approuve ou refuse une demande d'accès support qui le concerne.
 * La policy RLS "access_grants_update" garantit qu'il ne peut répondre qu'à
 * une demande liée à SON organisme.
 */
export async function respondToAccessGrant(grantId: string, approve: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("support_access_grants")
    .update({ status: approve ? "approved" : "denied", responded_at: new Date().toISOString() })
    .eq("id", grantId);
  if (error) {
    console.error("respondToAccessGrant", error);
    return;
  }
  revalidatePath("/dashboard");
}
