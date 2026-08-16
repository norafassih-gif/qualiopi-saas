import type {
  ConditionGroup,
  SimpleCondition,
  EngineVariables,
  RuleRow,
} from "./types";

function evaluateSimple(cond: SimpleCondition, vars: EngineVariables): boolean {
  const actual = vars[cond.variable];

  switch (cond.operator) {
    case "equals":
      return actual === cond.value;
    case "contains":
      return Array.isArray(actual) && (actual as unknown[]).includes(cond.value);
    case "in":
      return Array.isArray(cond.value) && (cond.value as unknown[]).includes(actual);
    case "not_in":
      return Array.isArray(cond.value) && !(cond.value as unknown[]).includes(actual);
    case "less_than_or_equal":
      return typeof actual === "number" && actual <= (cond.value as number);
    case "greater_than_or_equal":
      return typeof actual === "number" && actual >= (cond.value as number);
    case "is_true":
      return actual === true;
    default:
      // Opérateur inconnu (future évolution de la banque de règles) : on
      // n'active jamais une règle sur une condition qu'on ne sait pas
      // évaluer, plutôt que de risquer un faux positif silencieux.
      return false;
  }
}

/**
 * Une variable absente du contexte (ex: `sector`, `entry_level` pas encore
 * collectés par l'onboarding) rend simplement la condition fausse — la
 * règle correspondante ne se déclenche pas, sans erreur. C'est ce qui
 * permet d'ajouter progressivement de nouvelles questions/règles sans
 * casser celles qui existent déjà.
 */
export function evaluateConditions(group: ConditionGroup, vars: EngineVariables): boolean {
  const allOk = group.all ? group.all.every((c) => evaluateSimple(c, vars)) : true;
  const anyOk = group.any ? group.any.some((c) => evaluateSimple(c, vars)) : true;
  return allOk && anyOk;
}

export type EngineResult = {
  contentBlockCodes: Set<string>;
  moduleCodes: Set<string>;
  variables: EngineVariables;
  firedRuleIds: string[];
  addedBy: { code: string; kind: "content_block" | "module"; ruleId: string }[];
};

/**
 * Applique les règles par priorité CROISSANTE (0 d'abord, 10 en dernier).
 * C'est essentiel : les règles "thème par thème" (priorité 0) ajoutent les
 * modules génériques correspondant aux cases cochées, puis les règles de
 * "variante" (priorité 10, ex. B2B compacte vs standard 5 jours) peuvent
 * ensuite retirer ces modules génériques et les remplacer par leur propre
 * sélection — si on évaluait dans l'autre sens, un remove_module exécuté
 * avant l'add_module correspondant n'aurait aucun effet.
 */
export function runRulesEngine(rules: RuleRow[], initialVariables: EngineVariables): EngineResult {
  const sorted = [...rules].sort((a, b) => a.priority - b.priority);
  const variables: EngineVariables = { ...initialVariables };
  const contentBlockCodes = new Set<string>();
  const moduleCodes = new Set<string>();
  const firedRuleIds: string[] = [];
  const addedBy: EngineResult["addedBy"] = [];

  for (const rule of sorted) {
    if (!evaluateConditions(rule.conditions, variables)) continue;
    firedRuleIds.push(rule.id);

    for (const action of rule.actions) {
      switch (action.type) {
        case "add_content_block":
          contentBlockCodes.add(action.code);
          addedBy.push({ code: action.code, kind: "content_block", ruleId: rule.id });
          break;
        case "add_module":
          moduleCodes.add(action.code);
          addedBy.push({ code: action.code, kind: "module", ruleId: rule.id });
          break;
        case "remove_module":
          moduleCodes.delete(action.code);
          break;
        case "set_variable":
          variables[action.key] = action.value;
          break;
      }
    }
  }

  return { contentBlockCodes, moduleCodes, variables, firedRuleIds, addedBy };
}
