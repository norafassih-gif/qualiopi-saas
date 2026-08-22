"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Back-office admin (cf. migration 0034, section "ADMINISTRATION" de la
 * conception initiale) — un statut "administrateur plateforme", distinct du
 * rôle "owner" d'un organisme, qui autorise l'écriture sur les tables
 * référentielles GLOBALES (partagées par tous les organismes de la
 * plateforme) : content_blocks, training_categories, modules, questions,
 * answer_options, rules, document_templates, document_template_sections.
 *
 * requireAdmin() est appelé en tête de chaque page /admin/* et de chaque
 * action de ce fichier — la vérification finale reste de toute façon
 * imposée par les policies RLS "*_admin_write" (is_platform_admin()) côté
 * base, ce garde-fou applicatif n'est qu'un raccourci pour rediriger
 * proprement plutôt que de laisser échouer silencieusement une requête.
 */
export async function isPlatformAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("isPlatformAdmin", error);
    return false;
  }
  return !!data;
}

export async function requireAdmin() {
  const admin = await isPlatformAdmin();
  if (!admin) {
    redirect("/dashboard");
  }
}

// ---------------------------------------------------------------------------
// Catégories de formation
// ---------------------------------------------------------------------------

export type AdminCategory = {
  id: string;
  label: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
};

export async function listCategories(): Promise<AdminCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_categories")
    .select("id, label, description, icon, is_active, sort_order")
    .order("sort_order");
  if (error) {
    console.error("listCategories", error);
    return [];
  }
  return data ?? [];
}

export type AdminFormState = { error: string | null };

export async function createCategory(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();

  const id = String(formData.get("id") || "").trim();
  const label = String(formData.get("label") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const icon = String(formData.get("icon") || "").trim();

  if (!id || !/^[a-z0-9_]+$/.test(id)) {
    return { error: "L'identifiant doit être en minuscules, chiffres et underscores uniquement (ex. langues, marketing_digital)." };
  }
  if (!label) {
    return { error: "Le libellé est requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("training_categories").insert({
    id,
    label,
    description: description || null,
    icon: icon || null,
    is_active: true,
    sort_order: 100,
  });

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories?created=1");
}

export async function updateCategory(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();

  const id = String(formData.get("id") || "").trim();
  const label = String(formData.get("label") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const icon = String(formData.get("icon") || "").trim();
  const is_active = formData.get("is_active") === "on";

  if (!id || !label) {
    return { error: "Identifiant et libellé requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("training_categories")
    .update({ label, description: description || null, icon: icon || null, is_active })
    .eq("id", id);

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories?saved=1");
}

// ---------------------------------------------------------------------------
// Blocs de contenu (content_blocks) — table la plus volumineuse, priorité 1
// ---------------------------------------------------------------------------

export type AdminContentBlock = {
  id: string;
  category_id: string | null;
  type: string;
  code: string;
  text: string;
  is_active: boolean;
};

export async function listContentBlocks(filters: {
  categoryId?: string;
  type?: string;
  search?: string;
}): Promise<AdminContentBlock[]> {
  const supabase = await createClient();
  let query = supabase
    .from("content_blocks")
    .select("id, category_id, type, code, text, is_active")
    .order("code")
    .limit(200);

  if (filters.categoryId === "__global__") {
    query = query.is("category_id", null);
  } else if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.search) query = query.ilike("text", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) {
    console.error("listContentBlocks", error);
    return [];
  }
  return data ?? [];
}

export async function listContentBlockTypes(categoryId?: string): Promise<string[]> {
  const supabase = await createClient();
  let query = supabase.from("content_blocks").select("type").order("type");
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error || !data) return [];
  return Array.from(new Set(data.map((r) => r.type)));
}

export async function createContentBlock(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();

  const category_id = String(formData.get("category_id") || "").trim();
  const type = String(formData.get("type") || "").trim();
  const code = String(formData.get("code") || "").trim();
  const text = String(formData.get("text") || "").trim();

  if (!type || !code || !text) {
    return { error: "Type, code et texte sont requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("content_blocks").insert({
    category_id: category_id || null,
    type,
    code,
    text,
    is_active: true,
  });

  if (error) {
    return { error: "Une erreur est survenue : " + error.message + " (le code doit être unique)" };
  }

  revalidatePath("/admin/blocs");
  redirect(`/admin/blocs?created=1${category_id ? `&category=${category_id}` : ""}`);
}

export async function updateContentBlock(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();

  const id = String(formData.get("id") || "").trim();
  const text = String(formData.get("text") || "").trim();
  const is_active = formData.get("is_active") === "on";
  const redirectCategory = String(formData.get("redirect_category") || "").trim();

  if (!id || !text) {
    return { error: "Le texte est requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("content_blocks").update({ text, is_active }).eq("id", id);

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  revalidatePath("/admin/blocs");
  redirect(`/admin/blocs?saved=1${redirectCategory ? `&category=${redirectCategory}` : ""}`);
}

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

export type AdminModule = {
  id: string;
  category_id: string | null;
  code: string;
  title: string;
  default_duration_hours: number | null;
  is_active: boolean;
};

export async function listModules(categoryId?: string): Promise<AdminModule[]> {
  const supabase = await createClient();
  let query = supabase
    .from("modules")
    .select("id, category_id, code, title, default_duration_hours, is_active")
    .order("code")
    .limit(200);
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error) {
    console.error("listModules", error);
    return [];
  }
  return data ?? [];
}

export async function createModule(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();

  const category_id = String(formData.get("category_id") || "").trim();
  const code = String(formData.get("code") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const duration_raw = String(formData.get("default_duration_hours") || "").trim();
  const default_duration_hours = duration_raw ? Number(duration_raw.replace(",", ".")) : null;

  if (!code || !title) {
    return { error: "Code et titre sont requis." };
  }
  if (duration_raw && Number.isNaN(default_duration_hours)) {
    return { error: "La durée doit être un nombre." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("modules").insert({
    category_id: category_id || null,
    code,
    title,
    default_duration_hours,
    is_active: true,
  });

  if (error) {
    return { error: "Une erreur est survenue : " + error.message + " (le code doit être unique)" };
  }

  revalidatePath("/admin/modules");
  redirect(`/admin/modules?created=1${category_id ? `&category=${category_id}` : ""}`);
}

export async function updateModule(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();

  const id = String(formData.get("id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const duration_raw = String(formData.get("default_duration_hours") || "").trim();
  const default_duration_hours = duration_raw ? Number(duration_raw.replace(",", ".")) : null;
  const is_active = formData.get("is_active") === "on";
  const redirectCategory = String(formData.get("redirect_category") || "").trim();

  if (!id || !title) {
    return { error: "Le titre est requis." };
  }
  if (duration_raw && Number.isNaN(default_duration_hours)) {
    return { error: "La durée doit être un nombre." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("modules")
    .update({ title, default_duration_hours, is_active })
    .eq("id", id);

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  revalidatePath("/admin/modules");
  redirect(`/admin/modules?saved=1${redirectCategory ? `&category=${redirectCategory}` : ""}`);
}

// ---------------------------------------------------------------------------
// Règles (activation/désactivation uniquement — les conditions/actions JSON
// restent en lecture seule dans ce V1, pour éviter qu'une erreur de syntaxe
// JSON casse silencieusement le moteur de règles d'un organisme).
// ---------------------------------------------------------------------------

export type AdminRule = {
  id: string;
  category_id: string | null;
  label: string;
  justification: string | null;
  conditions: unknown;
  actions: unknown;
  priority: number;
  is_active: boolean;
};

export async function listRules(categoryId?: string): Promise<AdminRule[]> {
  const supabase = await createClient();
  let query = supabase
    .from("rules")
    .select("id, category_id, label, justification, conditions, actions, priority, is_active")
    .order("priority")
    .limit(200);
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error) {
    console.error("listRules", error);
    return [];
  }
  return data ?? [];
}

export async function toggleRuleActive(ruleId: string, isActive: boolean): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("rules").update({ is_active: isActive }).eq("id", ruleId);
  if (error) {
    // Action de bascule simple (pas de useActionState côté formulaire) —
    // erreur loguée côté serveur plutôt que remontée à l'écran, cohérent
    // avec le faible risque de cette opération (un simple on/off).
    console.error("toggleRuleActive", error);
    return;
  }
  revalidatePath("/admin/regles");
}

// ---------------------------------------------------------------------------
// Modèles de documents et leurs sections (html_template) — la plus haute
// valeur : c'est exactement ce qui, jusqu'ici, nécessitait une migration SQL
// manuelle à chaque correction de texte dans un document généré.
// ---------------------------------------------------------------------------

export type AdminDocumentTemplate = {
  id: string;
  label: string;
  folder_group: string | null;
  is_active: boolean;
  sort_order: number;
};

export async function listDocumentTemplatesAdmin(): Promise<AdminDocumentTemplate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("document_templates")
    .select("id, label, folder_group, is_active, sort_order")
    .order("sort_order");
  if (error) {
    console.error("listDocumentTemplatesAdmin", error);
    return [];
  }
  return data ?? [];
}

export async function toggleDocumentTemplateActive(templateId: string, isActive: boolean): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("document_templates").update({ is_active: isActive }).eq("id", templateId);
  if (error) {
    console.error("toggleDocumentTemplateActive", error);
    return;
  }
  revalidatePath("/admin/documents");
}

export type AdminDocumentSection = {
  id: string;
  document_template_id: string;
  code: string;
  title: string;
  sort_order: number;
  content_type: string;
  html_template: string | null;
};

export async function listDocumentTemplateSections(templateId: string): Promise<AdminDocumentSection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("document_template_sections")
    .select("id, document_template_id, code, title, sort_order, content_type, html_template")
    .eq("document_template_id", templateId)
    .order("sort_order");
  if (error) {
    console.error("listDocumentTemplateSections", error);
    return [];
  }
  return data ?? [];
}

export async function updateDocumentSectionHtml(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();

  const id = String(formData.get("id") || "").trim();
  const templateId = String(formData.get("document_template_id") || "").trim();
  const html_template = String(formData.get("html_template") || "");

  if (!id || !templateId) {
    return { error: "Section introuvable." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("document_template_sections").update({ html_template }).eq("id", id);

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  revalidatePath(`/admin/documents/${templateId}`);
  redirect(`/admin/documents/${templateId}?saved=1`);
}

// ---------------------------------------------------------------------------
// Organisations clientes — abonnement, blocage, accès support (migrations
// 0036/0037). Distinct des sections ci-dessus : ici on gère des ORGANISMES
// CLIENTS (données propres à chacun), pas le référentiel global partagé.
// ---------------------------------------------------------------------------

export type AdminOrganizationRow = {
  id: string;
  company_name: string;
  commercial_name: string | null;
  email: string | null;
  created_at: string;
  plan: string;
  subscription_status: string;
  is_blocked: boolean;
  blocked_reason: string | null;
  latest_access_grant: {
    id: string;
    status: string;
    requested_at: string;
    responded_at: string | null;
    expires_at: string;
  } | null;
};

/**
 * Liste tous les organismes clients de la plateforme avec leur statut de
 * facturation et la dernière demande d'accès support en date, pour le
 * tableau de bord /admin/organisations. Deux requêtes séparées (organismes,
 * puis facturation/demandes) plutôt qu'un embedding PostgREST : plus simple
 * à lire, et évite les pièges du "limit 1 par groupe" en SQL embarqué.
 */
export async function listOrganizationsForAdmin(): Promise<AdminOrganizationRow[]> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: orgs, error: orgsError } = await supabase
    .from("organizations")
    .select("id, company_name, commercial_name, email, created_at")
    .order("created_at", { ascending: false });
  if (orgsError) {
    console.error("listOrganizationsForAdmin/organizations", orgsError);
    return [];
  }

  const { data: billing, error: billingError } = await supabase
    .from("organization_billing")
    .select("organization_id, plan, subscription_status, is_blocked, blocked_reason");
  if (billingError) {
    console.error("listOrganizationsForAdmin/billing", billingError);
  }
  const billingByOrg = new Map((billing ?? []).map((b) => [b.organization_id, b]));

  type GrantRow = {
    id: string;
    organization_id: string;
    status: string;
    requested_at: string;
    responded_at: string | null;
    expires_at: string;
  };

  const { data: grants, error: grantsError } = await supabase
    .from("support_access_grants")
    .select("id, organization_id, status, requested_at, responded_at, expires_at")
    .order("requested_at", { ascending: false })
    .returns<GrantRow[]>();
  if (grantsError) {
    console.error("listOrganizationsForAdmin/grants", grantsError);
  }
  const latestGrantByOrg = new Map<string, GrantRow>();
  for (const g of grants ?? []) {
    if (!latestGrantByOrg.has(g.organization_id)) latestGrantByOrg.set(g.organization_id, g);
  }

  return (orgs ?? []).map((o) => {
    const b = billingByOrg.get(o.id);
    const g = latestGrantByOrg.get(o.id);
    return {
      id: o.id,
      company_name: o.company_name,
      commercial_name: o.commercial_name,
      email: o.email,
      created_at: o.created_at,
      plan: b?.plan ?? "documents",
      subscription_status: b?.subscription_status ?? "trialing",
      is_blocked: b?.is_blocked ?? false,
      blocked_reason: b?.blocked_reason ?? null,
      latest_access_grant: g
        ? {
            id: g.id,
            status: g.status,
            requested_at: g.requested_at,
            responded_at: g.responded_at,
            expires_at: g.expires_at,
          }
        : null,
    };
  });
}

/**
 * Bloque manuellement un organisme (ex. non-paiement constaté hors Stripe,
 * abus signalé...), avec un motif obligatoire affiché ensuite sur le
 * dashboard du client bloqué. Passe par organization_billing, jamais par
 * organizations directement — cf. commentaire de sécurité en tête de la
 * migration 0036.
 */
export async function blockOrganization(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();

  const organizationId = String(formData.get("organization_id") || "").trim();
  const reason = String(formData.get("reason") || "").trim();
  if (!organizationId) {
    return { error: "Organisme introuvable." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_billing")
    .update({
      is_blocked: true,
      blocked_at: new Date().toISOString(),
      blocked_reason: reason || "Bloqué manuellement par l'administrateur.",
    })
    .eq("organization_id", organizationId);
  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  revalidatePath("/admin/organisations");
  redirect("/admin/organisations?blocked=1");
}

/** Débloque un organisme (un seul clic, symétrique de toggleRuleActive). */
export async function unblockOrganization(organizationId: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_billing")
    .update({ is_blocked: false, blocked_at: null, blocked_reason: null })
    .eq("organization_id", organizationId);
  if (error) {
    console.error("unblockOrganization", error);
    return;
  }
  revalidatePath("/admin/organisations");
}

/**
 * Crée une demande d'accès support pour un organisme — le client verra une
 * bannière sur son dashboard et devra explicitement approuver avant que
 * l'admin puisse consulter ses données (cf. has_active_support_access,
 * migration 0036).
 */
export async function requestSupportAccess(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();

  const organizationId = String(formData.get("organization_id") || "").trim();
  const reason = String(formData.get("reason") || "").trim();
  if (!organizationId) {
    return { error: "Organisme introuvable." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Session expirée, reconnectez-vous." };
  }

  const { error } = await supabase.from("support_access_grants").insert({
    organization_id: organizationId,
    requested_by: user.id,
    reason: reason || null,
  });
  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  revalidatePath("/admin/organisations");
  redirect("/admin/organisations?requested=1");
}

/**
 * Révoque un accès support déjà approuvé (avant même son expiration à 30
 * jours) — ex. le diagnostic est terminé.
 */
export async function revokeSupportAccess(grantId: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("support_access_grants")
    .update({ status: "revoked", responded_at: new Date().toISOString() })
    .eq("id", grantId);
  if (error) {
    console.error("revokeSupportAccess", error);
    return;
  }
  revalidatePath("/admin/organisations");
}

// ---------------------------------------------------------------------------
// Fiche organisme détaillée — modifications manuelles demandées par Nora
// (24/08/2026) : "changer sa formule manuellement, activer/désactiver un
// add-on manuellement, modifier ses coordonnées (email, nom d'organisme...)".
// Distinct du blocage/accès support ci-dessus (déjà gérés depuis la liste) :
// ici on modifie directement les données de facturation et de contact d'un
// client, SANS toucher à Stripe — ces actions ne créent, ne modifient ni ne
// résilient aucun abonnement Stripe réel, seulement notre propre base
// (utile pour un geste commercial, une correction, un accord négocié hors
// Stripe). L'écriture sur `organizations` nécessite la policy RLS
// "org_update_admin" (migration 0042) ; l'écriture sur `organization_billing`
// passe déjà par "billing_admin_write" (migration 0036).
// ---------------------------------------------------------------------------

export type AdminOrganizationDetail = {
  id: string;
  company_name: string;
  commercial_name: string | null;
  email: string | null;
  siret: string | null;
  phone: string | null;
  plan: string;
  subscription_status: string;
  has_branding_addon: boolean;
  has_personalization_addon: boolean;
  is_blocked: boolean;
  blocked_reason: string | null;
};

export async function getOrganizationForAdmin(organizationId: string): Promise<AdminOrganizationDetail | null> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, company_name, commercial_name, email, siret, phone")
    .eq("id", organizationId)
    .maybeSingle();
  if (orgError || !org) {
    console.error("getOrganizationForAdmin/organizations", orgError);
    return null;
  }

  const { data: billing, error: billingError } = await supabase
    .from("organization_billing")
    .select("plan, subscription_status, has_branding_addon, has_personalization_addon, is_blocked, blocked_reason")
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (billingError) {
    console.error("getOrganizationForAdmin/billing", billingError);
  }

  return {
    ...org,
    plan: billing?.plan ?? "documents",
    subscription_status: billing?.subscription_status ?? "trialing",
    has_branding_addon: billing?.has_branding_addon ?? false,
    has_personalization_addon: billing?.has_personalization_addon ?? false,
    is_blocked: billing?.is_blocked ?? false,
    blocked_reason: billing?.blocked_reason ?? null,
  };
}

/**
 * Modifie manuellement les coordonnées d'un organisme (nom, nom commercial,
 * email, SIRET, téléphone) — ex. faute de frappe signalée, changement
 * d'adresse email de facturation, correction demandée par le client par
 * téléphone plutôt que depuis son propre compte.
 */
export async function updateOrganizationContactAdmin(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const organizationId = String(formData.get("organization_id") || "").trim();
  const company_name = String(formData.get("company_name") || "").trim();
  if (!organizationId || !company_name) {
    return { error: "Le nom de l'organisme est requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      company_name,
      commercial_name: String(formData.get("commercial_name") || "").trim() || null,
      email: String(formData.get("email") || "").trim() || null,
      siret: String(formData.get("siret") || "").trim() || null,
      phone: String(formData.get("phone") || "").trim() || null,
    })
    .eq("id", organizationId);

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  revalidatePath(`/admin/organisations/${organizationId}`);
  revalidatePath("/admin/organisations");
  redirect(`/admin/organisations/${organizationId}?saved=1`);
}

/**
 * Change manuellement la formule et/ou le statut d'abonnement d'un
 * organisme, indépendamment de Stripe — demande explicite de Nora ("changer
 * sa formule manuellement"). N'affecte QUE organization_billing ; aucun
 * appel à l'API Stripe. Si l'organisme a par ailleurs un abonnement Stripe
 * actif, celui-ci continuera à se facturer normalement et le prochain
 * webhook (renouvellement, mise à jour) pourra écraser ce changement manuel
 * — cette action est prévue pour des cas hors Stripe ou des corrections
 * ponctuelles, pas comme mécanisme de changement de formule côté client.
 */
export async function updateOrganizationPlanAdmin(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const organizationId = String(formData.get("organization_id") || "").trim();
  const plan = String(formData.get("plan") || "").trim();
  const subscription_status = String(formData.get("subscription_status") || "").trim();
  if (!organizationId || !plan || !subscription_status) {
    return { error: "Organisme, formule et statut requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_billing")
    .update({ plan, subscription_status })
    .eq("organization_id", organizationId);

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  revalidatePath(`/admin/organisations/${organizationId}`);
  revalidatePath("/admin/organisations");
  redirect(`/admin/organisations/${organizationId}?saved=1`);
}

/**
 * Active/désactive manuellement un add-on (branding +18 €/mois ou
 * personnalisation +5 €/mois) pour un organisme, sans passer par Stripe —
 * demande explicite de Nora ("activer/désactiver un add-on manuellement").
 * Même limite que updateOrganizationPlanAdmin ci-dessus : ne crée ni ne
 * modifie aucun abonnement Stripe réel, seulement notre colonne de contrôle
 * d'accès (lue par lib/engine/document-builder.ts pour déverrouiller la
 * personnalisation des documents, cf. applyPersonalizationGate).
 */
export async function toggleOrganizationAddonAdmin(
  organizationId: string,
  addon: "has_branding_addon" | "has_personalization_addon",
  value: boolean
): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_billing")
    .update({ [addon]: value })
    .eq("organization_id", organizationId);
  if (error) {
    console.error("toggleOrganizationAddonAdmin", error);
    return;
  }
  revalidatePath(`/admin/organisations/${organizationId}`);
  revalidatePath("/admin/organisations");
}
