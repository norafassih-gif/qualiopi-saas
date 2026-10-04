// Organisation du ZIP "Télécharger mon dossier" par critère et par indicateur
// Qualiopi, sur le modèle exact du classement réalisé par le chef auditeur
// (référent qualité) pour un dossier client ayant obtenu zéro non-conformité
// en audit initial (octobre 2026). L'auditeur avait dû reclasser à la main
// les PDF générés : on reproduit ce classement pour qu'il n'y ait plus rien
// à faire avant l'audit.
//
// Fichier pur (aucun appel réseau), utilisé par app/api/documents/zip.

export const CRITERIA: Record<number, string> = {
  1: "Information du public",
  2: "Conception des prestations",
  3: "Accompagnement des beneficiaires",
  4: "Moyens pedagogiques techniques et d'encadrement",
  5: "Competences des intervenants",
  6: "Environnement professionnel",
  7: "Appreciations et amelioration continue",
};

export const INDICATOR_CRITERION: Record<number, number> = {
  1: 1, 2: 1, 3: 1,
  4: 2, 5: 2, 6: 2, 7: 2, 8: 2,
  9: 3, 10: 3, 11: 3, 12: 3, 13: 3, 14: 3, 15: 3, 16: 3,
  17: 4, 18: 4, 19: 4, 20: 4,
  21: 5, 22: 5,
  23: 6, 24: 6, 25: 6, 26: 6, 27: 6, 28: 6, 29: 6,
  30: 7, 31: 7, 32: 7,
};

// Les 3 veilles (23, 24, 25) sont regroupées dans un seul dossier, comme
// l'a fait l'auditeur.
export const GROUPED_INDICATORS: number[][] = [[23, 24, 25]];

/**
 * Dossier(s) indicateur de chaque modèle de document. Le premier est le
 * dossier principal ; les suivants reçoivent une copie (l'auditeur a placé
 * le programme en 1, 5 et 6 par exemple). Un modèle absent de cette table
 * retombe sur le premier de ses `linked_indicator_numbers` en base.
 */
export const DOCUMENT_INDICATORS: Record<string, number[]> = {
  programme_formation: [1, 5, 6],
  devis: [1],
  convention_formation: [1],
  contrat_formation_particulier: [1],
  resultats_indicateurs_qualite: [2],
  questionnaire_besoins: [4],
  dossier_admission: [4],
  resultat_evaluation_cours: [5, 11],
  resultat_positionnement: [8],
  convocation: [9],
  livret_accueil: [9],
  reglement_interieur: [9],
  attestation_fin_formation: [11],
  resultat_evaluation: [11],
  feuille_emargement: [12],
  charte_engagement_assiduite: [12],
  procedure_anti_abandon: [12],
  procedure_harcelement: [12],
  procedure_accompagnement_insertion: [12],
  fiche_moyens_pedagogiques: [17],
  organigramme_fiches_poste: [18],
  procedure_selection_intervenants: [21],
  grille_entretien_suivi: [21],
  grille_entretien_professionnel_annuel: [21],
  plan_developpement_competences: [22],
  // Sous-traitance : en 27 si l'organisme sous-traite réellement, sinon en
  // 21 avec les autres documents intervenants (choix de l'auditeur).
  procedure_selection_sous_traitants: [27],
  grille_selection_sous_traitants: [27],
  contrat_sous_traitance: [27],
  procedure_veille_legale: [23],
  procedure_veille_metiers: [24],
  procedure_veille_pedagogique: [25],
  procedure_veille_accessibilite: [26],
  procedure_accompagnement_psh: [26],
  convention_partenariat: [28],
  procedure_mobilisation_partenaires: [28],
  questionnaire_satisfaction: [30],
  questionnaire_satisfaction_formateur: [30],
  procedure_recueil_appreciations: [30],
  formulaire_reclamation: [31],
  accuse_reception_reclamation: [31],
  procedure_reclamations: [31],
  procedure_amelioration_continue: [32],
};

export type AuditContext = {
  isCertifying: boolean;
  hasSubcontractor: boolean;
  hasWorkPlacementPartner: boolean;
};

/** Raison de non-applicabilité, ou null si l'indicateur s'applique. */
export function notApplicableReason(indicator: number, ctx: AuditContext): string | null {
  switch (indicator) {
    case 3:
    case 7:
    case 16:
      return ctx.isCertifying
        ? null
        : "Non applicable : l'organisme ne propose pas de formation conduisant à une certification professionnelle (RNCP ou Répertoire spécifique).";
    case 13:
      return "Non applicable : l'organisme ne propose pas de formation en alternance.";
    case 14:
    case 15:
    case 20:
    case 29:
      return "Non applicable : indicateur propre aux centres de formation d'apprentis (CFA).";
    case 27:
      return ctx.hasSubcontractor
        ? null
        : "Non applicable : l'organisme ne fait appel ni à la sous-traitance ni au portage salarial. La procédure de sélection des sous-traitants est néanmoins prête en cas de recours futur (voir indicateur 21).";
    case 28:
      return ctx.hasWorkPlacementPartner
        ? null
        : "Non applicable : les prestations ne comprennent pas de période de formation en situation de travail. Les documents de partenariat sont fournis pour information.";
    default:
      return null;
  }
}

/** Preuves que l'organisme doit ajouter lui-même (ce que l'auditeur a complété à la main). */
export const TO_COMPLETE: Record<number, string> = {
  2: "Ajoutez vos chiffres clés à jour (nombre de stagiaires, taux de satisfaction, taux de réussite) et la capture de la page de votre site où ils sont publiés.",
  6: "Ajoutez votre support de cours et le déroulé pédagogique détaillé (séquences, durées, méthodes, activités).",
  10: "Ajoutez une preuve d'adaptation de la formation au bénéficiaire : note d'adaptation suite au positionnement, aménagements réalisés, échanges avec le bénéficiaire.",
  19: "Ajoutez les ressources pédagogiques remises au bénéficiaire : supports, accès à la plateforme, captures d'écran de l'espace apprenant.",
  23: "Ajoutez vos preuves de veille : articles, newsletters, inscriptions à des webinaires, et le registre de veille rempli.",
  26: "Ajoutez la liste des contacts de votre réseau handicap (Agefiph, Ressource Handicap Formation, Cap emploi, MDPH).",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Chemin du dossier critère/indicateur dans le ZIP, ex. "Critere 3 - .../Indicateur 09". */
export function indicatorFolderPath(indicator: number, ctx: AuditContext): string {
  const criterion = INDICATOR_CRITERION[indicator] ?? 7;
  const group = GROUPED_INDICATORS.find((g) => g.includes(indicator));
  const label = group ? `Indicateurs ${group.map(pad).join("-")}` : `Indicateur ${pad(indicator)}`;
  const na = !group && notApplicableReason(indicator, ctx) ? " - NA" : "";
  return `Critere ${criterion} - ${CRITERIA[criterion]}/${label}${na}`;
}

/** Résout les dossiers d'un document, en tenant compte de la sous-traitance. */
export function documentIndicators(templateId: string, linked: number[], ctx: AuditContext): number[] {
  let list = DOCUMENT_INDICATORS[templateId] ?? (linked.length ? [linked[0]] : [32]);
  if (!ctx.hasSubcontractor) list = list.map((n) => (n === 27 ? 21 : n));
  return Array.from(new Set(list));
}

/** Tous les indicateurs à faire apparaître dans le ZIP (1 à 32, veilles regroupées). */
export function allIndicatorFolders(): number[] {
  const out: number[] = [];
  for (let i = 1; i <= 32; i++) {
    const group = GROUPED_INDICATORS.find((g) => g.includes(i));
    if (group && group[0] !== i) continue;
    out.push(i);
  }
  return out;
}
