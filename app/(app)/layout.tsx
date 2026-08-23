import { AppHeader } from "@/components/ui/app-header";
import { AppShell, type SidebarData } from "@/components/ui/app-shell";
import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/actions/admin";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstTraining } from "@/lib/actions/training";
import { getMyFirstSession, getMyFirstBeneficiary } from "@/lib/actions/session";
import { listDocumentTemplatesWithStatus } from "@/lib/actions/documents";
import { getMissingRequiredFields } from "@/lib/engine/data-completeness";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await redirectIfBlocked();
  const sidebarData = await getSidebarData();

  return (
    <div className="min-h-full bg-gray-50">
      <AppHeader />
      <AppShell data={sidebarData}>{children}</AppShell>
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

/**
 * Données de la barre latérale façon CRM (demande de Nora, 24/08/2026 :
 * "la partie design CRM sur la gauche qui va nous dire quand il manque un
 * document"). Renvoie `null` tant que l'organisme n'existe pas encore ou
 * que "Mon entreprise" n'a pas été complétée — pas encore d'application
 * "complète" à naviguer (AppShell masque alors la barre latérale).
 *
 * Ne bloque jamais le rendu de la page elle-même : chaque page garde ses
 * propres redirections/gardes-fous (requireActiveSubscription, etc.)
 * indépendamment de ceci — un échec de calcul ici ne doit jamais empêcher
 * d'accéder à la page demandée, seulement priver la barre latérale de
 * quelques badges.
 */
async function getSidebarData(): Promise<SidebarData | null> {
  const org = await getMyOrganization();
  if (!org || !org.onboarding_company_completed) return null;

  const training = await getMyFirstTraining();
  const session = training ? await getMyFirstSession() : null;
  const beneficiary = session ? await getMyFirstBeneficiary(session.id) : null;

  let documentsGenerated = 0;
  let documentsTotal = 0;
  if (training && session) {
    const templates = await listDocumentTemplatesWithStatus();
    if (!("error" in templates)) {
      documentsTotal = templates.length;
      documentsGenerated = templates.filter((t) => t.generated).length;
    }
  }

  const missingFields = getMissingRequiredFields(org, session, beneficiary);
  const isAdmin = await isPlatformAdmin();

  return {
    companyName: org.company_name,
    trainingName: training?.name ?? null,
    hasSession: Boolean(session),
    documentsGenerated,
    documentsTotal,
    missingFieldsCount: missingFields.length,
    isAdmin,
  };
}
