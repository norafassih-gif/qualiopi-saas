import Link from "next/link";
import { requireAdmin } from "@/lib/actions/admin";
import { NewClientForm } from "./new-client-form";

/**
 * Créer un nouveau client (back-office admin) — demande de Nora (24/08/2026) :
 * "il faut que j'ai cette possibilité de mon espace admin de créer un
 * nouveau client... c'est tout ce que je veux faire". Un seul geste : compte
 * Supabase Auth + organisme + formule active, sans passer par Stripe ni par
 * le flux "demander l'accès support" (qui nécessite l'accord du client et ne
 * convenait pas à ce besoin).
 */
export default async function AdminNewClientPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/admin/organisations" className="mb-4 inline-block text-sm text-blue-900 underline">
        ← Retour à la liste des organisations
      </Link>
      <h1 className="mb-1 text-2xl font-bold">Créer un nouveau client</h1>
      <p className="mb-6 text-sm text-gray-600">
        Crée directement le compte et l&apos;organisme du client, formule déjà active. Tu récupères ensuite
        un lien à lui transmettre toi-même pour qu&apos;il définisse son mot de passe et se connecte.
      </p>

      <NewClientForm />
    </div>
  );
}
