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
