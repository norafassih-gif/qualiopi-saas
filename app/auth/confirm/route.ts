import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

// Point d'arrivée des liens générés par l'admin (nouveau client, "se
// connecter en tant que ce client") via supabase.auth.admin.generateLink().
//
// Pourquoi une route séparée de /auth/callback : generateLink() renvoie un
// action_link qui pointe vers le serveur d'authentification Supabase lui-même
// (<projet>.supabase.co/auth/v1/verify) et redirige ensuite vers notre
// redirectTo avec les jetons dans le FRAGMENT de l'URL (#access_token=...),
// jamais transmis au serveur — /auth/callback (qui lit ?code=, flux PKCE
// initié depuis le navigateur) ne peut donc rien en faire, et l'utilisateur
// atterrit sur /dashboard sans session, silencieusement déconnecté (bug
// remonté par Nora le 24/08/2026 : "le mot de passe n'a pas été généré...
// ça ne fonctionne pas").
//
// Le correctif : ne jamais utiliser action_link tel quel. On construit
// nous-mêmes un lien vers CETTE route avec token_hash (aussi renvoyé par
// generateLink, sous properties.hashed_token) en paramètre de requête —
// lisible côté serveur — et on vérifie le token ici via verifyOtp(), qui
// établit directement la session (cookies) sans jamais passer par le
// fragment d'URL. C'est le schéma officiellement documenté par Supabase pour
// Next.js App Router.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation`);
}
