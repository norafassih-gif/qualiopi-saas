import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client Supabase avec la clé service_role — CONTOURNE toutes les policies
// RLS. À n'utiliser QUE dans des contextes serveur de confiance qui ne
// dépendent pas d'une session utilisateur, typiquement le webhook Stripe
// (app/api/stripe/webhook/route.ts) : Stripe appelle cette route sans aucun
// cookie de session, donc le client "normal" (lib/supabase/server.ts, clé
// anon + session) ne verrait jamais organization_billing (protégé par
// "billing_admin_write", réservé aux administrateurs plateforme).
//
// Ne JAMAIS importer ce fichier depuis un composant client ni l'exposer au
// navigateur — SUPABASE_SERVICE_ROLE_KEY doit rester une variable serveur
// uniquement (pas de préfixe NEXT_PUBLIC_).
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.");
  }
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
