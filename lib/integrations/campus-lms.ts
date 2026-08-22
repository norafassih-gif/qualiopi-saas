// Provisioning automatique d'un compte sur le LMS externe de Nora
// (campus.pivotformation.com, application Firebase/Firestore distincte de
// Qualiopi Pilote — repo local "Campus Pivot formation") pour les clients
// de la formule "3 — Tout compris + LMS" — demande de Nora (24/08/2026) :
// "il faudra linker mon LMS [...] pour le forfait qui est avec LMS",
// clarifiée en "création de compte automatique" (pas un simple lien, pas de
// SSO complet).
//
// Fonctionnement : Qualiopi Pilote appelle une Cloud Function HTTP dédiée
// côté Campus (à ajouter à functions/index.js de ce projet-là, cf. le
// commentaire dans ce fichier pour le code correspondant), protégée par un
// secret partagé (pas d'authentification utilisateur possible ici : c'est un
// appel serveur à serveur). Cette fonction :
//   1. crée un utilisateur Firebase Auth pour l'email du client (sans mot de
//      passe : un compte créé par admin.auth().createUser ne peut pas en
//      recevoir un directement) ;
//   2. crée le document Firestore `organisations/{slug}` avec les mêmes
//      champs que le parcours d'auto-inscription existant
//      (onboarding.html) ;
//   3. crée le profil `users/{uid}` (role "admin") ;
//   4. génère un lien Firebase "définir votre mot de passe" à usage unique
//      et le renvoie.
//
// Le lien renvoyé est stocké sur `organizations.campus_setup_link` et
// affiché sur le tableau de bord du client (cf. app/(app)/dashboard/page.tsx)
// — PAS envoyé par email : aucun fournisseur d'email transactionnel n'est
// configuré sur ce projet en V1, le client clique le lien depuis son propre
// tableau de bord Qualiopi Pilote plutôt que d'attendre un email.
//
// Échec non bloquant par conception : si le provisioning LMS échoue (Cloud
// Function indisponible, secret mal configuré...), l'abonnement du client
// reste activé normalement — le webhook Stripe ne doit jamais échouer à
// cause d'une intégration tierce. L'erreur est journalisée pour que Nora
// puisse relancer manuellement si besoin (pas encore de bouton "réessayer"
// en V1 : à ajouter si ce cas se présente en pratique).

export type CampusProvisionResult =
  | { ok: true; campusOrgId: string; setupLink: string }
  | { ok: false; error: string };

type CampusProvisionInput = {
  companyName: string;
  email: string | null;
  siret: string | null;
  phone: string | null;
  address: string | null;
};

/**
 * Appelle la Cloud Function Campus pour créer automatiquement l'organisme et
 * le compte administrateur LMS d'un client "tout_compris". Ne lève jamais —
 * retourne toujours un résultat typé, à l'appelant de logguer/ignorer un échec.
 */
export async function provisionCampusAccount(input: CampusProvisionInput): Promise<CampusProvisionResult> {
  const functionUrl = process.env.CAMPUS_LMS_FUNCTION_URL;
  const sharedSecret = process.env.CAMPUS_LMS_SHARED_SECRET;

  if (!functionUrl || !sharedSecret) {
    return {
      ok: false,
      error:
        "Provisioning LMS non configuré (CAMPUS_LMS_FUNCTION_URL / CAMPUS_LMS_SHARED_SECRET manquants côté serveur).",
    };
  }
  if (!input.email) {
    return { ok: false, error: "Email de l'organisme manquant — impossible de créer le compte LMS." };
  }

  try {
    const res = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-qualiopi-secret": sharedSecret,
      },
      body: JSON.stringify({
        companyName: input.companyName,
        email: input.email,
        siret: input.siret,
        phone: input.phone,
        address: input.address,
      }),
      // Le provisioning implique un appel Firebase Admin (création
      // utilisateur + génération de lien) côté Campus : plus lent qu'un
      // simple aller-retour REST, on laisse un peu de marge avant d'abandonner.
      signal: AbortSignal.timeout(15_000),
    });

    const data = (await res.json().catch(() => null)) as
      | { orgId?: string; setupLink?: string; error?: string }
      | null;

    if (!res.ok || !data?.orgId || !data?.setupLink) {
      return {
        ok: false,
        error: `Échec du provisioning LMS (HTTP ${res.status}) : ${data?.error ?? "réponse invalide"}`,
      };
    }

    return { ok: true, campusOrgId: data.orgId, setupLink: data.setupLink };
  } catch (err) {
    return {
      ok: false,
      error: "Erreur réseau vers la Cloud Function Campus : " + (err instanceof Error ? err.message : String(err)),
    };
  }
}
