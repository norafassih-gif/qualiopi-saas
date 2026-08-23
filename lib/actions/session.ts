"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyFirstTraining } from "@/lib/actions/training";

export type TrainingSession = {
  id: string;
  training_id: string;
  trainer_name: string | null;
  start_date: string | null;
  end_date: string | null;
  // Horaires (cf. migration 0046, demande de Nora suite aux retours du test
  // client ACP, 23/08/2026 : "il faut pouvoir mettre... les horaires").
  // Texte libre plutôt qu'un type time strict — une session peut avoir
  // plusieurs créneaux dans la journée (ex. "9h00 / 13h30").
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  status: "planned" | "in_progress" | "done" | "cancelled";
  price_amount: number | null;
  price_unit: "gratuit" | "total_ttc" | "total_ht" | "per_participant_ht" | "per_hour_ht";
  funding_type: "autofinancement" | "opco" | "pole_emploi" | "entreprise" | "region" | "cpf" | "autre" | null;
  funding_details: string | null;
  payment_terms: string | null;
  quote_reference: string | null;
  convention_reference: string | null;
};

export type Beneficiary = {
  id: string;
  session_id: string;
  full_name: string;
  company: string | null;
  email: string | null;
  role: string | null;
  signature_name: string | null;
  signature_accepted: boolean;
  signature_date: string | null;
};

/**
 * La première session de la première formation — suffisant pour préparer le
 * dossier Qualiopi (parcours prioritaire).
 */
export async function getMyFirstSession(): Promise<TrainingSession | null> {
  const training = await getMyFirstTraining();
  if (!training) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("training_id", training.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getMyFirstSession", error);
    return null;
  }
  return data as TrainingSession | null;
}

/**
 * Le premier bénéficiaire d'une session — reste utilisé comme valeur par
 * défaut pour tout document qui ne précise pas explicitement pour quel
 * bénéficiaire il est généré (ex. un organisme mono-apprenant qui ne voit
 * jamais de sélecteur). Depuis la Phase 29 (24/08/2026, demande de Nora : "il
 * faut que je sois capable de rajouter plusieurs apprenants sur une session"),
 * une session peut avoir plusieurs bénéficiaires — voir listMyBeneficiaries()
 * ci-dessous pour la vraie liste.
 */
export async function getMyFirstBeneficiary(sessionId: string): Promise<Beneficiary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("beneficiaries")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getMyFirstBeneficiary", error);
    return null;
  }
  return data as Beneficiary | null;
}

/**
 * Tous les bénéficiaires d'une session, du plus ancien au plus récent —
 * alimente le gestionnaire d'apprenants (/parametres/session) et le
 * sélecteur de bénéficiaire sur "Mes documents" pour les modèles qui
 * utilisent les variables {{student_*}} (convention, convocation,
 * attestation...). La table `beneficiaries` supporte déjà plusieurs lignes
 * par session_id depuis 0001_init.sql — aucune migration nécessaire pour
 * cette fonction elle-même.
 */
export async function listMyBeneficiaries(sessionId: string): Promise<Beneficiary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("beneficiaries")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("listMyBeneficiaries", error);
    return [];
  }
  return (data ?? []) as Beneficiary[];
}

export type BeneficiaryFormState = { error: string | null };

/**
 * Ajoute un apprenant supplémentaire à la session en cours — demande
 * explicite de Nora (24/08/2026) : "ça arrive très souvent que les
 * organismes de formation, avant d'ouvrir, [ajoutent plusieurs apprenants]".
 * Ne fait confiance à aucun session_id envoyé par le formulaire : la session
 * est retrouvée côté serveur via getMyFirstSession(), même principe de
 * sécurité que updateSession() ci-dessous.
 */
export async function addBeneficiary(
  _prevState: BeneficiaryFormState,
  formData: FormData
): Promise<BeneficiaryFormState> {
  const session = await getMyFirstSession();
  if (!session) {
    redirect("/onboarding/session");
  }

  const full_name = String(formData.get("full_name") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "").trim();

  if (!full_name) {
    return { error: "Le nom de l'apprenant est requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("beneficiaries").insert({
    session_id: session.id,
    full_name,
    company: company || null,
    email: email || null,
    role: role || null,
  });

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  redirect("/parametres/session?saved=1");
}

/**
 * Modifie un apprenant déjà ajouté. `beneficiary_id` est vérifié côté
 * serveur : on ne met à jour que s'il appartient bien à la session courante
 * de l'organisme (retrouvée via getMyFirstSession(), pas via le formulaire),
 * en plus de la policy RLS "beneficiaries_all_member" déjà en place.
 */
export async function updateBeneficiary(
  _prevState: BeneficiaryFormState,
  formData: FormData
): Promise<BeneficiaryFormState> {
  const session = await getMyFirstSession();
  if (!session) {
    redirect("/onboarding/session");
  }

  const beneficiary_id = String(formData.get("beneficiary_id") || "").trim();
  const full_name = String(formData.get("full_name") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "").trim();

  if (!beneficiary_id) {
    return { error: "Apprenant introuvable." };
  }
  if (!full_name) {
    return { error: "Le nom de l'apprenant est requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("beneficiaries")
    .update({
      full_name,
      company: company || null,
      email: email || null,
      role: role || null,
    })
    .eq("id", beneficiary_id)
    .eq("session_id", session.id);

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  redirect("/parametres/session?saved=1");
}

/**
 * Retire un apprenant de la session. Volontairement pas de garde-fou "au
 * moins un bénéficiaire restant" : un organisme qui vide temporairement sa
 * liste verra simplement des documents "par apprenant" vides à générer,
 * cohérent avec le reste du moteur (placeholders visibles plutôt qu'un
 * blocage). Les documents déjà générés pour cet apprenant restent en Storage
 * (le lien PDF n'est pas retiré) — seule la fiche apprenant disparaît.
 */
export async function deleteBeneficiary(
  _prevState: BeneficiaryFormState,
  formData: FormData
): Promise<BeneficiaryFormState> {
  const session = await getMyFirstSession();
  if (!session) {
    redirect("/onboarding/session");
  }

  const beneficiary_id = String(formData.get("beneficiary_id") || "").trim();
  if (!beneficiary_id) {
    return { error: "Apprenant introuvable." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("beneficiaries")
    .delete()
    .eq("id", beneficiary_id)
    .eq("session_id", session.id);

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  redirect("/parametres/session?saved=1");
}

export type SessionFormState = { error: string | null };

export async function createSession(
  _prevState: SessionFormState,
  formData: FormData
): Promise<SessionFormState> {
  const training = await getMyFirstTraining();
  if (!training) {
    redirect("/onboarding/activite");
  }

  const existing = await getMyFirstSession();
  if (existing) {
    redirect("/dashboard");
  }

  const trainer_name = String(formData.get("trainer_name") || "").trim();
  const start_date = String(formData.get("start_date") || "");
  const end_date = String(formData.get("end_date") || "");
  const start_time = String(formData.get("start_time") || "").trim();
  const end_time = String(formData.get("end_time") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const beneficiary_name = String(formData.get("beneficiary_name") || "").trim();
  const beneficiary_company = String(formData.get("beneficiary_company") || "").trim();
  const beneficiary_email = String(formData.get("beneficiary_email") || "").trim();
  const beneficiary_role = String(formData.get("beneficiary_role") || "").trim();

  const price_unit = String(formData.get("price_unit") || "total_ttc").trim();
  const price_amount_raw = String(formData.get("price_amount") || "").trim();
  // Une formation "gratuite" n'a pas de montant à saisir — on ignore le champ
  // montant dans ce cas plutôt que d'exiger un 0 explicite.
  const price_amount = price_unit === "gratuit" || !price_amount_raw ? null : Number(price_amount_raw.replace(",", "."));
  const funding_type = String(formData.get("funding_type") || "").trim();
  const funding_details = String(formData.get("funding_details") || "").trim();
  const payment_terms = String(formData.get("payment_terms") || "").trim();

  if (!trainer_name) {
    return { error: "Le nom du formateur est requis." };
  }
  if (!start_date || !end_date) {
    return { error: "Les dates de début et de fin sont requises." };
  }
  if (!beneficiary_name) {
    return { error: "Le nom du bénéficiaire est requis." };
  }
  if (price_unit !== "gratuit" && price_amount_raw && Number.isNaN(price_amount)) {
    return { error: "Le tarif doit être un nombre." };
  }

  const supabase = await createClient();

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      training_id: training.id,
      trainer_name,
      start_date,
      end_date,
      start_time: start_time || null,
      end_time: end_time || null,
      location: location || null,
      status: "planned",
      price_amount,
      price_unit,
      funding_type: funding_type || null,
      funding_details: funding_details || null,
      payment_terms: payment_terms || null,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    return { error: "Une erreur est survenue : " + (sessionError?.message ?? "session non créée") };
  }

  const { error: beneficiaryError } = await supabase.from("beneficiaries").insert({
    session_id: session.id,
    full_name: beneficiary_name,
    company: beneficiary_company || null,
    email: beneficiary_email || null,
    role: beneficiary_role || null,
  });

  if (beneficiaryError) {
    return { error: "Une erreur est survenue : " + beneficiaryError.message };
  }

  redirect("/dashboard");
}

/**
 * Modifie la session déjà créée — jusqu'ici seule la création existait
 * (createSession ci-dessus), ce qui empêchait de corriger la moindre erreur
 * de saisie après coup (cf. Phase 7bis : le poste du bénéficiaire de test de
 * Nora n'a pas pu être corrigé rétroactivement).
 *
 * Depuis la Phase 29 (24/08/2026), cette fonction ne gère plus que les champs
 * "de session" (formateur, dates, lieu, statut, tarif/financement) — les
 * bénéficiaires (potentiellement plusieurs) ont leur propre gestion dédiée
 * ci-dessus (addBeneficiary/updateBeneficiary/deleteBeneficiary), affichée
 * juste en dessous de ce formulaire sur /parametres/session.
 *
 * On ne fait volontairement confiance à aucun identifiant envoyé par le
 * formulaire : la session à modifier est retrouvée côté serveur via
 * getMyFirstSession() (scoping identique à tout le reste de l'appli, RLS
 * "sessions_all_member" en plus), donc impossible de modifier la session
 * d'un autre organisme même en falsifiant le formulaire.
 */
export async function updateSession(_prevState: SessionFormState, formData: FormData): Promise<SessionFormState> {
  const session = await getMyFirstSession();
  if (!session) {
    redirect("/onboarding/session");
  }

  const beneficiary = await getMyFirstBeneficiary(session.id);

  const trainer_name = String(formData.get("trainer_name") || "").trim();
  const start_date = String(formData.get("start_date") || "");
  const end_date = String(formData.get("end_date") || "");
  const start_time = String(formData.get("start_time") || "").trim();
  const end_time = String(formData.get("end_time") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const beneficiary_name = String(formData.get("beneficiary_name") || "").trim();
  const beneficiary_company = String(formData.get("beneficiary_company") || "").trim();
  const beneficiary_email = String(formData.get("beneficiary_email") || "").trim();
  const beneficiary_role = String(formData.get("beneficiary_role") || "").trim();

  const price_unit = String(formData.get("price_unit") || "total_ttc").trim();
  const price_amount_raw = String(formData.get("price_amount") || "").trim();
  const price_amount = price_unit === "gratuit" || !price_amount_raw ? null : Number(price_amount_raw.replace(",", "."));
  const funding_type = String(formData.get("funding_type") || "").trim();
  const funding_details = String(formData.get("funding_details") || "").trim();
  const payment_terms = String(formData.get("payment_terms") || "").trim();
  const status = String(formData.get("status") || session.status).trim();
  const signature_accepted = formData.get("signature_accepted") === "on";

  if (!trainer_name) {
    return { error: "Le nom du formateur est requis." };
  }
  if (!start_date || !end_date) {
    return { error: "Les dates de début et de fin sont requises." };
  }
  if (!beneficiary_name) {
    return { error: "Le nom du bénéficiaire est requis." };
  }
  if (price_unit !== "gratuit" && price_amount_raw && Number.isNaN(price_amount)) {
    return { error: "Le tarif doit être un nombre." };
  }
  if (!["planned", "in_progress", "done", "cancelled"].includes(status)) {
    return { error: "Statut de session invalide." };
  }

  const was_signed = beneficiary?.signature_accepted ?? false;
  const signature_name = signature_accepted ? beneficiary_name : null;
  const signature_date = signature_accepted
    ? was_signed && beneficiary?.signature_date
      ? beneficiary.signature_date
      : new Date().toISOString().slice(0, 10)
    : null;

  const supabase = await createClient();

  const { error: sessionError } = await supabase
    .from("sessions")
    .update({
      trainer_name,
      start_date,
      end_date,
      start_time: start_time || null,
      end_time: end_time || null,
      location: location || null,
      status,
      price_amount,
      price_unit,
      funding_type: funding_type || null,
      funding_details: funding_details || null,
      payment_terms: payment_terms || null,
    })
    .eq("id", session.id);

  if (sessionError) {
    return { error: "Une erreur est survenue : " + sessionError.message };
  }

  if (beneficiary) {
    const { error: beneficiaryError } = await supabase
      .from("beneficiaries")
      .update({
        full_name: beneficiary_name,
        company: beneficiary_company || null,
        email: beneficiary_email || null,
        role: beneficiary_role || null,
        signature_name,
        signature_accepted,
        signature_date,
      })
      .eq("id", beneficiary.id);

    if (beneficiaryError) {
      return { error: "Une erreur est survenue : " + beneficiaryError.message };
    }
  } else {
    const { error: beneficiaryError } = await supabase.from("beneficiaries").insert({
      session_id: session.id,
      full_name: beneficiary_name,
      company: beneficiary_company || null,
      email: beneficiary_email || null,
      role: beneficiary_role || null,
      signature_name,
      signature_accepted,
      signature_date,
    });

    if (beneficiaryError) {
      return { error: "Une erreur est survenue : " + beneficiaryError.message };
    }
  }

  redirect("/parametres/session?saved=1");
}
