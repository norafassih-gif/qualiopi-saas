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

// Score de complétude sommaire — copie volontairement réduite de
// beneficiaryCompleteness() (lib/actions/session.ts, non exportable depuis un
// fichier "use server") pour choisir, parmi plusieurs lignes désignant la
// même personne, celle à conserver.
function beneficiaryScore(b: Beneficiary): number {
  const fields = [
    b.experience_level,
    b.current_difficulties,
    b.personal_expectations,
    b.priority_skills,
    b.professional_context,
    b.expected_results,
    b.preferred_modality,
    b.preferred_rhythm,
    b.schedule_constraints,
    b.company,
    b.email,
  ];
  return fields.filter((v) => v && v.trim().length > 0).length + (b.has_disability != null ? 1 : 0);
}

/**
 * Retourne la liste des bénéficiaires réellement DISTINCTS d'une session
 * (une ligne par personne, la plus renseignée en cas de doublon) plutôt que
 * les lignes brutes en base — utilisée par la feuille d'émargement à signer
 * sur l'écran (demande de Nora, 25/08/2026 : "avoir plusieurs apprenants,
 * pouvoir leur faire signer directement les émargements sur l'écran") :
 * sans ce filtre, un doublon historique (cf. countDistinctBeneficiaries)
 * apparaîtrait comme un participant fantôme jamais signé, semant le doute
 * sur une feuille qui doit rester un justificatif fiable.
 */
export function dedupeBeneficiaries(list: Beneficiary[]): Beneficiary[] {
  const byKey = new Map<string, Beneficiary>();
  const unnamed: Beneficiary[] = [];
  for (const b of list) {
    const key = normalizeBeneficiaryNameKey(b.full_name);
    if (!key) {
      unnamed.push(b);
      continue;
    }
    const existing = byKey.get(key);
    if (!existing || beneficiaryScore(b) > beneficiaryScore(existing)) {
      byKey.set(key, b);
    }
  }
  return [...byKey.values(), ...unnamed];
}
