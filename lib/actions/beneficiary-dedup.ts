import type { Beneficiary } from "./session";

// Normalise un nom pour détecter des doublons de saisie qui désignent la
// même personne malgré une casse ou un ordre "Nom Prénom" différent (ex.
// "ESQUER David" / "ESQUER DAVID" / "David ESQUER" — 3 lignes créées pour un
// seul et même bénéficiaire par un bug aujourd'hui corrigé, cf. Phase
// 32bis). On retire les accents, on met en minuscules, puis on trie les
// mots par ordre alphabétique pour ignorer l'ordre nom/prénom.
//
// Vit dans son propre fichier (sans directive "use server") plutôt que dans
// lib/actions/session.ts : un fichier "use server" ne peut exporter que des
// fonctions async (contrainte Next.js "Server Actions must be async
// functions"), or countDistinctBeneficiaries() ci-dessous est une pure
// fonction synchrone.
function normalizeBeneficiaryNameKey(name: string | null): string {
  if (!name) return "";
  return name
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}

/**
 * Compte le nombre de bénéficiaires réellement DISTINCTS dans une liste,
 * plutôt que le nombre brut de lignes en base — cf. Phase 32ter, 24/08/2026 :
 * le devis d'ACP affichait "nombre de participants : 3" pour une session
 * n'ayant qu'un seul participant réel, à cause de 3 lignes dupliquées créées
 * par un bug de saisie déjà corrigé mais dont les lignes existantes n'ont
 * pas pu être supprimées (suppression bloquée par le classifieur de
 * sécurité — cf. journal). Deux lignes sans nom renseigné sont comptées
 * comme 2 bénéficiaires distincts (on ne peut pas savoir si c'est la même
 * personne), mais deux lignes avec le même nom (à la casse/l'ordre près)
 * sont comptées comme une seule.
 */
export function countDistinctBeneficiaries(list: Beneficiary[]): number {
  const seen = new Set<string>();
  let unnamedCount = 0;
  for (const b of list) {
    const key = normalizeBeneficiaryNameKey(b.full_name);
    if (key) {
      seen.add(key);
    } else {
      unnamedCount += 1;
    }
  }
  return seen.size + unnamedCount;
}
