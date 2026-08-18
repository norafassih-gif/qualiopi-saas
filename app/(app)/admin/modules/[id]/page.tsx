import { redirect } from "next/navigation";
import { requireAdmin, updateModule } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/server";
import { EditModuleForm } from "./edit-module-form";

export default async function EditModulePage({
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
  const { data: module_ } = await supabase
    .from("modules")
    .select("id, category_id, code, title, default_duration_hours, is_active")
    .eq("id", id)
    .maybeSingle();

  if (!module_) redirect("/admin/modules");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">{module_.title}</h1>
      <p className="mb-6 text-sm text-gray-600">Code : {module_.code}</p>
      <EditModuleForm action={updateModule} moduleItem={module_} redirectCategory={category ?? ""} />
      <a href={`/admin/modules${category ? `?category=${category}` : ""}`} className="mt-6 inline-block text-sm text-blue-900 underline">
        ← Retour aux modules
      </a>
    </div>
  );
}
