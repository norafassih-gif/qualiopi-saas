import Link from "next/link";

// Affichée juste après l'inscription, tant que l'email n'est pas confirmé
// (pas de session active possible avant ce moment). L'utilisateur clique le
// lien reçu par email, qui passe désormais par /auth/callback et le renvoie
// automatiquement, connecté, vers la suite du parcours.
export default function VerifiezVotreEmailPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 text-center">
      <h1 className="mb-2 text-2xl font-bold">Vérifiez votre boîte mail</h1>
      <p className="mb-6 text-sm text-gray-600">
        Nous venons de vous envoyer un email de confirmation. Cliquez sur le
        lien qu&apos;il contient pour activer votre compte — vous serez
        automatiquement redirigé(e) vers la suite.
      </p>
      <p className="text-xs text-gray-500">
        Vous ne voyez rien ? Vérifiez vos courriers indésirables, ou{" "}
        <Link href="/signup" className="text-blue-900 underline">
          recommencez l&apos;inscription
        </Link>
        .
      </p>
    </div>
  );
}
