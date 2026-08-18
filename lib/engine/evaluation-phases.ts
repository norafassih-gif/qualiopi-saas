// Les 3 moments d'évaluation attendus par le référentiel Qualiopi :
//  - "positionnement" : indicateur 8 ("le prestataire détermine les
//    procédures de positionnement et d'évaluation des acquis À L'ENTRÉE de
//    la prestation").
//  - "en_cours" et "finale" : indicateur 11 ("le prestataire évalue
//    l'atteinte par les publics bénéficiaires des objectifs de la
//    prestation") — le guide de lecture Qualiopi liste explicitement comme
//    preuves attendues des "outils d'évaluation des acquis EN COURS ET EN
//    FIN de prestation".
// La banque de questions QCM (evaluation_questions/evaluation_answer_options)
// reste partagée entre les 3 moments — un même questionnaire peut servir de
// test de positionnement, de point d'étape en cours de formation, et
// d'évaluation finale ; seul le moment choisi par l'utilisateur change (et
// donc le document généré / l'indicateur Qualiopi couvert).
export type EvaluationPhase = "positionnement" | "en_cours" | "finale";

export const EVALUATION_PHASES: EvaluationPhase[] = ["positionnement", "en_cours", "finale"];

export const EVALUATION_PHASE_LABELS: Record<EvaluationPhase, string> = {
  positionnement: "Positionnement à l'entrée en formation",
  en_cours: "Évaluation en cours de formation",
  finale: "Évaluation finale des acquis",
};

export const EVALUATION_PHASE_DESCRIPTIONS: Record<EvaluationPhase, string> = {
  positionnement:
    "Avant le démarrage de la formation, pour situer le niveau initial du bénéficiaire et adapter si besoin le déroulé pédagogique (indicateur Qualiopi n°8).",
  en_cours:
    "Pendant la formation, pour vérifier la progression du bénéficiaire et ajuster si besoin l'accompagnement (indicateur Qualiopi n°11).",
  finale:
    "À la fin de la formation, pour évaluer l'atteinte des objectifs pédagogiques par le bénéficiaire (indicateur Qualiopi n°11).",
};

// Un document distinct par moment — cf. migration 0027_evaluation_phases.sql.
export const EVALUATION_PHASE_DOCUMENT_TEMPLATE: Record<EvaluationPhase, string> = {
  positionnement: "resultat_positionnement",
  en_cours: "resultat_evaluation_cours",
  finale: "resultat_evaluation",
};

export function isEvaluationPhase(value: string | null | undefined): value is EvaluationPhase {
  return value === "positionnement" || value === "en_cours" || value === "finale";
}
