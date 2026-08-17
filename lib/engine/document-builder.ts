"use server";

import { createClient } from "@/lib/supabase/server";
import { getMyOrganization, type Organization } from "@/lib/actions/organization";
import { getMyFirstTraining } from "@/lib/actions/training";
import { getMyFirstSession } from "@/lib/actions/session";
import { resolveDocumentVariables } from "./document-variables";

type TemplateSection = {
  code: string;
  title: string;
  sort_order: number;
  content_type: "rich_text" | "variable_block" | "table" | "content_block_list" | "checklist" | "signature_block";
  html_template: string | null;
  source_content_block_type: string | null;
  // "training" (défaut) : blocs réellement retenus pour cette formation via
  // le moteur de règles (ex. programme). "global" : tous les blocs actifs de
  // ce type dans la banque de contenu, sans lien avec une formation précise
  // (ex. fiches de poste, sources de veille) — cf. migration 0009.
  content_block_scope: "training" | "global";
};

export type BuildDocumentResult = { html: string; templateLabel: string } | { error: string };

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => vars[key] ?? "");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Construit le HTML complet d'un document, prêt pour l'impression PDF, à
 * partir d'un modèle stocké en base (`document_templates` /
 * `document_template_sections`) et des données réelles de l'organisme, de
 * la formation et de la session en cours — QUESTION -> RÉPONSE -> RÈGLE ->
 * VARIABLES -> BLOC DE CONTENU -> DOCUMENT (point 5-10 de la conception).
 * Chaque type de section est résolu différemment :
 *  - variable_block / rich_text : interpolation {{variable}} du html_template
 *  - content_block_list : liste des blocs de contenu de la banque, filtrés
 *    par type, effectivement retenus pour CETTE formation (training_content_blocks)
 *  - table : programme des modules retenus pour cette formation (training_modules)
 *  - checklist / signature_block : pas encore utilisés par un modèle, rendu
 *    minimal prévu pour les prochains documents (convention, émargement…)
 */
export async function buildDocumentHtml(documentTemplateId: string): Promise<BuildDocumentResult> {
  const org = await getMyOrganization();
  if (!org) return { error: "Organisme introuvable — complétez d'abord votre profil." };

  const training = await getMyFirstTraining();
  if (!training) return { error: "Formation introuvable — créez d'abord votre formation." };

  const session = await getMyFirstSession();
  const supabase = await createClient();

  const [templateResponse, sectionsResponse] = await Promise.all([
    supabase.from("document_templates").select("id, label").eq("id", documentTemplateId).maybeSingle(),
    supabase
      .from("document_template_sections")
      .select("code, title, sort_order, content_type, html_template, source_content_block_type, content_block_scope")
      .eq("document_template_id", documentTemplateId)
      .order("sort_order"),
  ]);

  if (templateResponse.error || !templateResponse.data) {
    return { error: "Modèle de document introuvable : " + documentTemplateId };
  }
  if (sectionsResponse.error) {
    return { error: "Erreur lors du chargement du modèle : " + sectionsResponse.error.message };
  }

  const sections = (sectionsResponse.data ?? []) as TemplateSection[];

  let beneficiaryName: string | null = null;
  let beneficiaryCompany: string | null = null;
  let beneficiaryEmail: string | null = null;
  let beneficiaryRole: string | null = null;
  let beneficiaryCount = 0;
  if (session) {
    const [{ data: beneficiaries }, { count }] = await Promise.all([
      supabase
        .from("beneficiaries")
        .select("full_name, company, email, role")
        .eq("session_id", session.id)
        .order("id")
        .limit(1),
      supabase.from("beneficiaries").select("id", { count: "exact", head: true }).eq("session_id", session.id),
    ]);
    if (beneficiaries && beneficiaries.length > 0) {
      beneficiaryName = beneficiaries[0].full_name;
      beneficiaryCompany = beneficiaries[0].company;
      beneficiaryEmail = beneficiaries[0].email;
      beneficiaryRole = beneficiaries[0].role;
    }
    beneficiaryCount = count ?? 0;
  }

  const vars = resolveDocumentVariables({
    org,
    training,
    session,
    beneficiaryName,
    beneficiaryCompany,
    beneficiaryEmail,
    beneficiaryRole,
    beneficiaryCount,
  });

  const [blocksResponse, modulesResponse, globalBlocksResponse] = await Promise.all([
    supabase
      .from("training_content_blocks")
      .select("content_blocks(type, text)")
      .eq("training_id", training.id),
    supabase
      .from("training_modules")
      .select("sort_order, duration_hours, modules(title)")
      .eq("training_id", training.id)
      .order("sort_order"),
    // Blocs "globaux" (cf. content_block_scope) : indépendants de toute
    // formation, utilisés par les documents transverses (fiches de poste,
    // sources de veille, exemples...). Table de taille modeste (quelques
    // centaines de lignes) : un seul fetch, filtré ensuite en mémoire par type.
    supabase.from("content_blocks").select("type, code, text").eq("is_active", true).order("code"),
  ]);

  type BlockRow = { content_blocks: { type: string; text: string } | { type: string; text: string }[] | null };
  const blockRows = (blocksResponse.data ?? []) as unknown as BlockRow[];
  const blocksByType = new Map<string, string[]>();
  for (const row of blockRows) {
    const block = Array.isArray(row.content_blocks) ? row.content_blocks[0] : row.content_blocks;
    if (!block) continue;
    const list = blocksByType.get(block.type) ?? [];
    list.push(block.text);
    blocksByType.set(block.type, list);
  }

  type ModuleRow = { duration_hours: number | null; modules: { title: string } | { title: string }[] | null };
  const moduleRows = (modulesResponse.data ?? []) as unknown as ModuleRow[];

  const globalBlocksByType = new Map<string, string[]>();
  for (const block of globalBlocksResponse.data ?? []) {
    const list = globalBlocksByType.get(block.type) ?? [];
    list.push(block.text);
    globalBlocksByType.set(block.type, list);
  }

  const sectionsHtml = sections
    .map((section) => renderSection(section, vars, blocksByType, globalBlocksByType, moduleRows))
    .join("\n");

  const html = wrapDocument({ org, templateLabel: templateResponse.data.label, sectionsHtml, vars });

  return { html, templateLabel: templateResponse.data.label };
}

function renderSection(
  section: TemplateSection,
  vars: Record<string, string>,
  blocksByType: Map<string, string[]>,
  globalBlocksByType: Map<string, string[]>,
  moduleRows: { duration_hours: number | null; modules: { title: string } | { title: string }[] | null }[]
): string {
  let body: string;

  switch (section.content_type) {
    case "rich_text":
    case "variable_block":
      body = section.html_template ? interpolate(section.html_template, vars) : "";
      break;

    case "content_block_list": {
      const source = section.content_block_scope === "global" ? globalBlocksByType : blocksByType;
      const items = source.get(section.source_content_block_type ?? "") ?? [];
      body =
        items.length > 0
          ? `<ul>${items.map((t) => `<li>${interpolate(escapeHtml(t), vars)}</li>`).join("")}</ul>`
          : `<p class="empty">Non applicable pour cette formation.</p>`;
      break;
    }

    case "table": {
      // Seul cas d'usage actuel : le programme des modules retenus pour la
      // formation. À généraliser (via source_content_block_type ou un champ
      // dédié) si d'autres sections "table" apparaissent (ex. tarifs).
      if (moduleRows.length === 0) {
        body = `<p class="empty">Aucun module généré — complétez d'abord vos thématiques.</p>`;
      } else {
        const rows = moduleRows
          .map((m) => {
            const mod = Array.isArray(m.modules) ? m.modules[0] : m.modules;
            return `<tr><td>${escapeHtml(mod?.title ?? "")}</td><td>${m.duration_hours ?? ""} h</td></tr>`;
          })
          .join("");
        body = `<table><thead><tr><th>Module</th><th>Durée</th></tr></thead><tbody>${rows}</tbody></table>`;
      }
      break;
    }

    case "checklist":
      body = section.html_template
        ? `<ul class="checklist">${section.html_template
            .split("\n")
            .filter(Boolean)
            .map((line) => `<li>☐ ${escapeHtml(interpolate(line, vars))}</li>`)
            .join("")}</ul>`
        : "";
      break;

    case "signature_block":
      body = `<div class="signature"><div>${vars.company_name ?? ""}</div><div class="signature-line">Signature</div></div>`;
      break;

    default:
      body = "";
  }

  return `<section><h2>${escapeHtml(section.title)}</h2>${body}</section>`;
}

function wrapDocument({
  org,
  templateLabel,
  sectionsHtml,
  vars,
}: {
  org: Organization;
  templateLabel: string;
  sectionsHtml: string;
  vars: Record<string, string>;
}): string {
  const primary = org.brand_color_primary || "#1e3a8a";
  const secondary = org.brand_color_secondary || "#64748b";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<style>
  @page { margin: 24mm 18mm; }
  body { font-family: "Helvetica Neue", Arial, sans-serif; color: #1f2937; font-size: 11pt; line-height: 1.5; }
  h1 { color: ${primary}; font-size: 18pt; margin-bottom: 4pt; }
  .subtitle { color: ${secondary}; font-size: 10pt; margin-bottom: 20pt; }
  section { margin-bottom: 16pt; }
  h2 { color: ${primary}; font-size: 12pt; border-bottom: 1px solid ${primary}33; padding-bottom: 4pt; margin-bottom: 8pt; }
  p { margin: 0 0 6pt; }
  ul { margin: 0; padding-left: 18pt; }
  li { margin-bottom: 4pt; }
  .empty { color: #6b7280; font-style: italic; }
  table { width: 100%; border-collapse: collapse; margin-top: 4pt; }
  th, td { text-align: left; padding: 6pt 8pt; border-bottom: 1px solid #e5e7eb; }
  th { color: ${secondary}; font-weight: 600; font-size: 9pt; text-transform: uppercase; }
  .signature-line { margin-top: 24pt; border-top: 1px solid #1f2937; width: 60mm; padding-top: 4pt; }
</style>
</head>
<body>
  <h1>${escapeHtml(templateLabel)}</h1>
  <p class="subtitle">${escapeHtml(vars.company_name ?? "")} — ${escapeHtml(vars.generated_date ?? "")}</p>
  ${sectionsHtml}
</body>
</html>`;
}
