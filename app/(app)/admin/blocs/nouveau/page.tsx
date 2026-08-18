import Link from "next/link";
import { requireAdmin, listCategories, createContentBlock } from "@/lib/actions/admin";
import { NewBlockForm } from "./new-block-form";

export default async function NewContentBlockPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  await requireAdmin();
  const { category } = await searchParams;
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Nouveau bloc de contenu</h1>
      <p className="mb-6 text-sm text-gray-600">
        Un bloc de contenu est une phrase ou un paragraphe réutilisable (objectif pédagogique,
        exemple, méthode...) rattaché à une catégorie de formation et à un type. Le
        &quot;type&quot; détermine dans quelle liste du programme ce bloc apparaît — reprenez le
        type d&apos;un bloc existant similaire (visible sur l&apos;écran précédent) pour qu&apos;il
        s&apos;affiche au bon endroit.
      </p>
      <NewBlockForm action={createContentBlock} categories={categories} defaultCategory={category} />
      <Link href="/admin/blocs" className="mt-6 inline-block text-sm text-blue-900 underline">
        ← Retour aux blocs de contenu
      </Link>
    </div>
  );
}
