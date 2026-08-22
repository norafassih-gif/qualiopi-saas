"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signUp, signInWithGoogle, type AuthState } from "@/lib/actions/auth";
import { GoogleIcon } from "@/components/auth/google-icon";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { PasswordField } from "@/components/auth/password-field";

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
    <AuthSplitLayout
      title="Créer mon compte"
      subtitle="Vous renseignerez ensuite les informations de votre organisme de formation."
    >
      {oauthError && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
          La connexion avec Google a échoué. Réessayez ou créez votre compte avec votre email.
        </p>
      )}

      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <GoogleIcon className="h-4 w-4" />
          Continuer avec Google
        </button>
      </form>

      <div className="mb-5 flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        ou avec votre email
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <PasswordField label="Mot de passe (8 caractères minimum)" name="password" autoComplete="new-password" minLength={8} />

        {state.error && (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? "Création en cours…" : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-gray-900 underline underline-offset-2">
          Se connecter
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
