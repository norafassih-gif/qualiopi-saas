// Types du moteur de règles — cf. points 7-9 de la conception
// (QUESTION -> RÉPONSE -> RÈGLE -> VARIABLES -> BLOC DE CONTENU -> DOCUMENT).
// Aucune IA : uniquement des conditions et des actions déclaratives, stockées
// en jsonb dans la table `rules`.

export type ConditionOperator =
  | "equals"
  | "contains"
  | "in"
  | "not_in"
  | "less_than_or_equal"
  | "greater_than_or_equal"
  | "is_true";

export type SimpleCondition = {
  variable: string;
  operator: ConditionOperator;
  value: unknown;
};

/**
 * Un groupe de conditions combine "all" (ET) et/ou "any" (OU). Les deux
 * peuvent coexister (ET logique entre les deux groupes) mais en pratique la
 * banque de contenu actuelle n'utilise jamais les deux en même temps sur une
 * même règle.
 */
export type ConditionGroup = {
  all?: SimpleCondition[];
  any?: SimpleCondition[];
};

export type RuleAction =
  | { type: "add_content_block"; code: string }
  | { type: "add_module"; code: string }
  | { type: "remove_module"; code: string }
  | { type: "set_variable"; key: string; value: unknown };

export type EngineVariables = Record<string, unknown>;

export type RuleRow = {
  id: string;
  label: string;
  conditions: ConditionGroup;
  actions: RuleAction[];
  priority: number;
};
