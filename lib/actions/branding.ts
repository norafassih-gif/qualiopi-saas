"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyOrganization } from "@/lib/actions/organization";
import { isFontOptionKey } from "@/lib/engine/branding-fonts";

export type BrandingFormState = { error: string | null };

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 Mo — largement suffisant (logo/cachet/signature), évite les PDF trop lourds.
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const DATA_URL_PNG_RE = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Envoie un fichier image (logo/cachet) vers l'un des buckets Storage
 * dédiés à l'identité visuelle (cf. migrations 0028_identite_visuelle.sql
 * et 0029_cachet_signature.sql — un bucket par type d'image, même schéma de
 * politiques RLS : lecture publique nécessaire pour que Chromium headless
 * charge l'image au moment du rendu PDF, écriture restreinte au
 * propriétaire de l'organisme). Retourne l'URL publique (avec cache-bust)
 * ou une erreur lisible.
 */
async function uploadBrandImageFile(
  supabase: SupabaseServerClient,
  bucket: string,
  orgId: string,
  baseName: string,
  file: File
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: "Format d'image non pris en charge — utilisez un PNG, JPEG, SVG ou WebP." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "Le fichier dépasse la taille maximale de 2 Mo." };
  }

  const extFromName = file.name.split(".").pop();
  const ext = extFromName && extFromName.length <= 5 ? extFromName.toLowerCase() : "png";
  const path = `${orgId}/${baseName}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { error: "Échec de l'envoi du fichier : " + uploadError.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  // Cache-bust : le chemin de stockage est stable (upsert sur le même
  // fichier), donc sans ce paramètre un remplacement continuerait d'afficher
  // l'ancienne image dans le navigateur ou le PDF déjà mis en cache.
  return { url: `${data.publicUrl}?v=${Date.now()}` };
}

/**
 * Même principe que uploadBrandImageFile, mais pour une image dessinée
 * côté client (signature électronique tracée à la souris/au doigt, cf.
 * app/(app)/parametres/identite-visuelle/form.tsx) et transmise sous forme
 * de data URL PNG plutôt que de fichier — décodée ici en PNG binaire.
 */
async function uploadBrandImageDataUrl(
  supabase: SupabaseServerClient,
  bucket: string,
  orgId: string,
  baseName: string,
  dataUrl: string
): Promise<{ url: string } | { error: string }> {
  const match = DATA_URL_PNG_RE.exec(dataUrl);
  if (!match) {
    return { error: "Signature dessinée invalide." };
  }
  const buffer = Buffer.from(match[1], "base64");
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    return { error: "La signature dessinée dépasse la taille maximale de 2 Mo." };
  }

  const path = `${orgId}/${baseName}.png`;
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { upsert: true, contentType: "image/png" });

  if (uploadError) {
    return { error: "Échec de l'envoi de la signature : " + uploadError.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: `${data.publicUrl}?v=${Date.now()}` };
}

/**
 * Met à jour l'identité visuelle de l'organisme (logo, cachet, signature
 * électronique, couleurs, police) — utilisée par tous les documents PDF
 * générés (cf. lib/engine/document-builder.ts, wrapDocument, et
 * lib/engine/document-variables.ts pour org_stamp_image/org_signature_image).
 * Socle technique de l'offre "personnalisée" envisagée par Nora (cf.
 * claude/roadmap-produit-et-tarifs.md), par opposition à l'offre "basique"
 * qui garde la mise en page neutre par défaut.
 *
 * Le cachet est un fichier téléversé comme le logo. La signature peut être
 * SOIT un fichier téléversé (ex. scan), SOIT dessinée directement dans le
 * navigateur via un pavé tactile (canvas HTML) et transmise en data URL PNG
 * — le fichier téléversé est prioritaire si les deux sont fournis en même
 * temps (cas improbable, mais géré simplement pour rester prévisible).
 */
export async function updateBranding(_prevState: BrandingFormState, formData: FormData): Promise<BrandingFormState> {
  const org = await getMyOrganization();
  if (!org) {
    redirect("/onboarding/entreprise");
  }

  const supabase = await createClient();

  const intent = String(formData.get("intent") || "save");

  if (intent === "remove_logo" || intent === "remove_stamp" || intent === "remove_signature") {
    const column = intent === "remove_logo" ? "logo_url" : intent === "remove_stamp" ? "stamp_url" : "signature_url";
    const { error } = await supabase.from("organizations").update({ [column]: null }).eq("id", org.id);
    if (error) {
      return { error: "Une erreur est survenue : " + error.message };
    }
    redirect("/parametres/identite-visuelle?saved=1");
  }

  const primary = String(formData.get("brand_color_primary") || "").trim() || org.brand_color_primary;
  const secondary = String(formData.get("brand_color_secondary") || "").trim() || org.brand_color_secondary;
  const fontFamilyRaw = String(formData.get("font_family") || "");

  if (!HEX_COLOR_RE.test(primary) || !HEX_COLOR_RE.test(secondary)) {
    return { error: "Couleur invalide — utilisez un code hexadécimal à 6 chiffres (ex. #1e3a8a)." };
  }
  if (!isFontOptionKey(fontFamilyRaw)) {
    return { error: "Police invalide." };
  }

  let logo_url = org.logo_url;
  const logoFile = formData.get("logo");
  if (logoFile instanceof File && logoFile.size > 0) {
    const result = await uploadBrandImageFile(supabase, "org-logos", org.id, "logo", logoFile);
    if ("error" in result) return result;
    logo_url = result.url;
  }

  let stamp_url = org.stamp_url;
  const stampFile = formData.get("stamp");
  if (stampFile instanceof File && stampFile.size > 0) {
    const result = await uploadBrandImageFile(supabase, "org-stamps", org.id, "stamp", stampFile);
    if ("error" in result) return result;
    stamp_url = result.url;
  }

  let signature_url = org.signature_url;
  const signatureFile = formData.get("signature_file");
  const signatureDataUrl = String(formData.get("signature_data_url") || "");
  if (signatureFile instanceof File && signatureFile.size > 0) {
    const result = await uploadBrandImageFile(supabase, "org-signatures", org.id, "signature", signatureFile);
    if ("error" in result) return result;
    signature_url = result.url;
  } else if (signatureDataUrl) {
    const result = await uploadBrandImageDataUrl(supabase, "org-signatures", org.id, "signature", signatureDataUrl);
    if ("error" in result) return result;
    signature_url = result.url;
  }

  const { error } = await supabase
    .from("organizations")
    .update({
      brand_color_primary: primary,
      brand_color_secondary: secondary,
      font_family: fontFamilyRaw,
      logo_url,
      stamp_url,
      signature_url,
    })
    .eq("id", org.id);

  if (error) {
    return { error: "Une erreur est survenue : " + error.message };
  }

  redirect("/parametres/identite-visuelle?saved=1");
}
