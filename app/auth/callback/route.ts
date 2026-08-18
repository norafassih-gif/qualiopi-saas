import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Point d'arrivée du lien de confirmation d'email envoyé par Supabase.
// Sans cette route, le lien de confirmation atterrissait sur la page
// d'accueil ("/?code=...") sans jamais échanger le code contre une session :
// l'utilisateur n'était donc jamais réellement connecté après avoir cliqué.
// Ici, on échange le code puis on redirige vers la suite du parcours
// (le dashboard renvoie lui-même vers l'onboarding si l'organisme n'existe
// pas encore, cf. app/(app)/dashboard/page.tsx).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Code manquant, invalide ou déjà utilisé : on renvoie vers la connexion
  // plutôt que de laisser un utilisateur bloqué sur une erreur brute.
  return NextResponse.redirect(`${origin}/login?error=confirmation`);
}
