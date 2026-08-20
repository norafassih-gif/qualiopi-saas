import { AppHeader } from "@/components/ui/app-header";
import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/actions/admin";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await redirectIfBlocked();

  return (
    <div className="min-h-full bg-gray-50">
      <AppHeader />
      {children}
    </div>
  );
}

/**
 * Bloque l'accès à tout l'espace privé (dashboard, onboarding, paramètres...)
 * si l'organisme du client a été marqué is_blocked (migration 0036 —
 * organization_billing, jamais organizations directement pour des raisons de
 * sécurité, cf. commentaire de la migration).
 *
 * Un administrateur plateforme n'est jamais bloqué (accès garanti au
 * back-office même si son propre organisme de test l'était). Un utilisateur
 * sans organisme encore créé (en cours d'onboarding) n'est pas concerné —
 * rien à bloquer avant qu'un organisme n'existe.
 *
 * /compte-suspendu est volontairement HORS de ce groupe de routes, pour
 * éviter une boucle de redirection infinie.
 */
async function redirectIfBlocked() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (await isPlatformAdmin()) return;

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!org) return;

  const { data: billing } = await supabase
    .from("organization_billing")
    .select("is_blocked")
    .eq("organization_id", org.id)
    .maybeSingle();

  if (billing?.is_blocked) {
    redirect("/compte-suspendu");
  }
}
