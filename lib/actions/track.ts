"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";
import { NDA_STEPS, TRACKS, type Track } from "@/lib/engine/tracks";

/**
 * Choix du parcours (NDA / audit initial / audit de surveillance). Crée un
 * organisme minimal si le compte n'en a pas encore (même mécanisme que
 * startCheckout, cf. migration 0039), sinon met simplement à jour le
 * parcours. Le formulaire « Mon entreprise » vient ensuite compléter cet
 * organisme.
 */
export async function chooseTrack(formData: FormData): Promise<void> {
  const track = String(formData.get("track") ?? "") as Track;
  if (!TRACKS.some((t) => t.id === track)) {
    redirect("/onboarding/parcours");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const org = await getMyOrganization();
  if (org) {
    const { error } = await supabase.from("organizations").update({ current_track: track }).eq("id", org.id);
    if (error) {
      console.error("chooseTrack update", error);
      redirect("/onboarding/parcours?error=1");
    }
  } else {
    const { error } = await supabase
      .from("organizations")
      .insert({ owner_user_id: user.id, company_name: "Organisme à compléter", current_track: track });
    if (error) {
      console.error("chooseTrack insert", error);
      redirect("/onboarding/parcours?error=1");
    }
  }

  revalidatePath("/", "layout");
  if (!org || !org.onboarding_company_completed) redirect("/onboarding/entreprise");
  redirect(track === "nda" ? "/nda" : "/dashboard");
}

/** Coche ou décoche une étape du parcours guidé NDA. */
export async function toggleNdaStep(formData: FormData): Promise<void> {
  const org = await getMyOrganization();
  if (!org) redirect("/onboarding/parcours");
  const step = String(formData.get("step") ?? "");
  if (!NDA_STEPS.some((s) => s.key === step)) redirect("/nda");

  const progress = { ...((org.nda_progress ?? {}) as Record<string, boolean>) };
  progress[step] = !progress[step];

  const supabase = await createClient();
  const { error } = await supabase.from("organizations").update({ nda_progress: progress }).eq("id", org.id);
  if (error) console.error("toggleNdaStep", error);

  revalidatePath("/nda");
  redirect(`/nda#${step}`);
}

/** Informations propres au parcours NDA (forme juridique, seuil de CA, numéro reçu). */
export async function saveNdaInfo(formData: FormData): Promise<void> {
  const org = await getMyOrganization();
  if (!org) redirect("/onboarding/parcours");

  const update: Record<string, unknown> = {};
  if (formData.has("legal_form")) {
    const v = String(formData.get("legal_form") ?? "").trim();
    update.legal_form = v || null;
  }
  if (formData.has("nda_revenue_over_threshold")) {
    const v = String(formData.get("nda_revenue_over_threshold") ?? "");
    update.nda_revenue_over_threshold = v === "oui" ? true : v === "non" ? false : null;
  }
  if (formData.has("nda_number")) {
    const v = String(formData.get("nda_number") ?? "").replace(/\s/g, "");
    update.nda_number = v || null;
  }
  if (formData.has("nda_filed_on")) {
    const v = String(formData.get("nda_filed_on") ?? "").trim();
    update.nda_filed_on = v || null;
  }
  const anchor = String(formData.get("anchor") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.from("organizations").update(update).eq("id", org.id);
  if (error) {
    console.error("saveNdaInfo", error);
    redirect("/nda?error=1");
  }
  revalidatePath("/", "layout");
  redirect(`/nda?saved=1${anchor ? `#${anchor}` : ""}`);
}
