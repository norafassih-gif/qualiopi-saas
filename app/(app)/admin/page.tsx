import { requireAdmin } from "@/lib/actions/admin";

const SECTIONS = [
  {
    href: "/admin/blocs",
    title: "Blocs de contenu",
    description: "Objectifs, exemples, méthodes... la banque de contenu utilisée par les programmes et documents.",
  },
  {
    href: "/admin/documents",
    title: "Modèles de documents",
    description: "Le texte de chaque section d'un document généré (programme, convention, procédures...).",
  },
  {
    href: "/admin/regles",
    title: "Règles",
    description: "Activer ou désactiver une règle du moteur (ex. « si Instagram coché, ajouter le module Instagram »).",
  },
  {
    href: "/admin/modules",
    title: "Modules",
    description: "Les modules de programme proposés par domaine de formation.",
  },
  {
    href: "/admin/categories",
    title: "Catégories de formation",
    description: "Les 10 domaines proposés à l'onboarding (Langues, Community Management...).",
  },
];

export default async function AdminHomePage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Back-office</h1>
      <p className="mb-6 text-sm text-gray-600">
        Ajoutez ou modifiez le contenu utilisé par le logiciel — sans toucher au code. Ces
        données sont partagées par tous les organismes de la plateforme.
      </p>
      <div className="flex flex-col gap-3">
        {SECTIONS.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-900"
          >
            <p className="text-sm font-medium text-gray-900">{s.title}</p>
            <p className="text-xs text-gray-500">{s.description}</p>
          </a>
        ))}
      </div>
      <a href="/dashboard" className="mt-8 inline-block text-sm text-blue-900 underline">
        ← Retour au tableau de bord
      </a>
    </div>
  );
}
