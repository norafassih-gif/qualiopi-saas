import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/actions/auth";

// Affichée quand organization_billing.is_blocked = true (cf. layout de
// app/(app), migration 0036). Volontairement HORS du groupe (app) : elle ne
// doit jamais elle-même déclencher la vérification de blocage, sinon boucle
// de redirection infinie.
//
// TODO(Nora) : remplacer le texte générique ci-dessous par une vraie adresse
// de contact (email et/ou téléphone) une fois décidée — je n'ai pas voulu
// en inventer une pour cette page réellement montrée à vos clients.
export default async function CompteSuspenduPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  let reason: string | null = null;
  if (org) {
    const { data: billing } = await supabase
      .from("organization_billing")
      .select("blocked_reason")
      .eq("organization_id", org.id)
      .maybeSingle();
    reason = billing?.blocked_reason ?? null;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 text-center">
      <h1 className="mb-2 text-2xl font-bold">Compte suspendu</h1>
      <p className="mb-4 text-sm text-gray-600">
        L&apos;accès à votre espace est temporairement suspendu.
      </p>
      {reason && (
        <p className="mb-6 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">{reason}</p>
      )}
      <p className="text-xs text-gray-500">
        Pour régulariser votre situation, contactez-nous — nous rétablirons l&apos;accès dès que
        possible.
      </p>
      <form action={signOut} className="mt-6">
        <button type="submit" className="text-xs text-gray-500 underline">
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
