import { redirect } from "next/navigation";
import { requireAdmin, updateContentBlock } from "@/lib/actions/admin";
import { EditBlockForm } from "./edit-block-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditContentBlockPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { category } = await searchParams;

  const supabase = await createClient();
  const { data: block } = await supabase
    .from("content_blocks")
    .select("id, category_id, type, code, text, is_active")
    .eq("id", id)
    .maybeSingle();

  if (!block) redirect("/admin/blocs");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">{block.code}</h1>
      <p className="mb-6 text-sm text-gray-600">
        Type : {block.type} — Catégorie : {block.category_id ?? "transverse"}
      </p>
      <EditBlockForm action={updateContentBlock} block={block} redirectCategory={category ?? ""} />
      <a href={`/admin/blocs${category ? `?category=${category}` : ""}`} className="mt-6 inline-block text-sm text-blue-900 underline">
        ← Retour aux blocs de contenu
      </a>
    </div>
  );
}
