"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signUp, signInWithGoogle, type AuthState } from "@/lib/actions/auth";
import { GoogleIcon } from "@/components/auth/google-icon";

const initialState: AuthState = { error: null };

// useSearchParams() (pour afficher l'éventuelle erreur ?error=oauth) doit
// être enveloppé dans un Suspense pour ne pas faire échouer le build d'une
// page par ailleurs statique — cf. node_modules/next/dist/docs (Next 16).
export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error") === "oauth";

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-2 text-2xl font-bold">Créer mon compte</h1>
      <p className="mb-6 text-sm text-gray-600">
        Vous allez ensuite renseigner les informations de votre organisme de
        formation.
      </p>

      {oauthError && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          La connexion avec Google a échoué. Réessayez ou créez votre compte avec votre email.
        </p>
      )}

      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <GoogleIcon className="h-4 w-4" />
          Continuer avec Google
        </button>
      </form>

      <div className="mb-4 flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        ou
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Mot de passe
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>

        {state.error && (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Création en cours…" : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-blue-900 underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
