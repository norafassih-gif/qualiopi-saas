import Link from "next/link";
import { requireAdmin, listCategories, updateCategory } from "@/lib/actions/admin";
import { redirect } from "next/navigation";
import { EditCategoryForm } from "./edit-category-form";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const categories = await listCategories();
  const category = categories.find((c) => c.id === id);
  if (!category) redirect("/admin/categories");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">{category.label}</h1>
      <p className="mb-6 text-sm text-gray-600">Identifiant technique : {category.id}</p>
      <EditCategoryForm action={updateCategory} category={category} />
      <Link href="/admin/categories" className="mt-6 inline-block text-sm text-blue-900 underline">
        ← Retour aux catégories
      </Link>
    </div>
  );
}
