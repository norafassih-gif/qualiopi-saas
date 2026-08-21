"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string | null };

// Reconstruit l'origine (https://mondomaine.vercel.app) à partir des en-têtes
// de la requête, pour construire un lien de confirmation d'email qui pointe
// toujours vers le bon environnement (production, preview...) plutôt que
// vers une valeur codée en dur — évite le bug du lien de confirmation qui
// renvoyait vers "localhost:3000" en production.
async function getOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function signUp(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email et mot de passe sont requis." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/onboarding/entreprise` },
  });

  if (error) {
    return { error: error.message };
  }

  // Tant que l'email n'est pas confirmé, l'utilisateur n'a pas de session
  // active : on ne peut pas encore l'envoyer sur l'onboarding (qui nécessite
  // d'être connecté). On l'informe de vérifier sa boîte mail ; il sera
  // automatiquement redirigé vers l'onboarding en cliquant le lien reçu.
  redirect("/signup/verifiez-votre-email");
}

// Connexion/inscription via Google (Supabase Auth OAuth). Un seul et même
// flux sert à la fois pour "se connecter" et "créer un compte" : Supabase
// crée automatiquement l'utilisateur au premier passage, puis
// /auth/callback échange le code contre une session et redirige vers
// /dashboard — qui renvoie lui-même vers /onboarding/entreprise si
// l'organisme n'existe pas encore (cf. app/(app)/dashboard/page.tsx). Pas
// besoin donc de distinguer "login" et "signup" côté Google.
export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=/dashboard` },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }

  redirect(data.url);
}

export async function signIn(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email ou mot de passe incorrect." };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
