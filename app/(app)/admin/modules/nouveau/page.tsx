import Link from "next/link";
import { requireAdmin, listCategories, createModule } from "@/lib/actions/admin";
import { NewModuleForm } from "./new-module-form";

export default async function NewModulePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  await requireAdmin();
  const { category } = await searchParams;
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Nouveau module</h1>
      <p className="mb-6 text-sm text-gray-600">
        Un module apparaît dans le programme de formation quand une règle le retient (thématique
        cochée par l&apos;utilisateur) — un module créé ici n&apos;apparaîtra dans aucun programme
        tant qu&apos;une règle ne le déclenche pas (onglet Règles).
      </p>
      <NewModuleForm action={createModule} categories={categories} defaultCategory={category} />
      <Link href="/admin/modules" className="mt-6 inline-block text-sm text-blue-900 underline">
        ← Retour aux modules
      </Link>
    </div>
  );
}
