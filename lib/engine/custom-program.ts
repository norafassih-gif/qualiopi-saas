// Programme « sur mesure » (catégorie sur_mesure, migration 0051) : saisi
// par le client lui-même pour une formation qui n'entre dans aucun domaine
// de la banque de contenus. Ce module convertit ce programme dans les mêmes
// structures que le moteur (blocs par type, lignes de modules) pour que
// tous les documents existants fonctionnent sans changement.

export const CUSTOM_CATEGORY_ID = "sur_mesure";

export type CustomModule = { title: string; hours: number | null; content: string };

export type CustomProgram = {
  objectives: string[];
  skills: string[];
  prerequisites: string;
  methods: string[];
  evaluations: string[];
  exercises: string[];
  positioning: string[];
  needs: string[];
  modules: CustomModule[];
};

export const EMPTY_CUSTOM_PROGRAM: CustomProgram = {
  objectives: [],
  skills: [],
  prerequisites: "",
  methods: [],
  evaluations: [],
  exercises: [],
  positioning: [],
  needs: [],
  modules: [],
};

/** Champs « une ligne = un élément » de l'écran de saisie. */
export const CUSTOM_LIST_FIELDS: { key: Exclude<keyof CustomProgram, "prerequisites" | "modules">; label: string; help: string }[] = [
  { key: "objectives", label: "Objectifs pédagogiques", help: "Ce que le stagiaire saura faire à la fin. Commencez par un verbe d'action (identifier, appliquer, réaliser...)." },
  { key: "skills", label: "Compétences visées", help: "Les compétences professionnelles développées." },
  { key: "methods", label: "Méthodes pédagogiques", help: "Apports théoriques, exercices pratiques, mises en situation, études de cas..." },
  { key: "evaluations", label: "Modalités d'évaluation", help: "Comment les acquis sont évalués (QCM, épreuve pratique, mise en situation...)." },
  { key: "exercises", label: "Exercices et mises en pratique", help: "Les travaux pratiques réalisés pendant la formation." },
  { key: "positioning", label: "Questions de positionnement", help: "Les questions posées avant la formation pour évaluer le niveau d'entrée." },
  { key: "needs", label: "Exemples de besoins", help: "Les besoins typiques des stagiaires ou des entreprises pour cette formation." },
];

const BLOCK_TYPE_BY_FIELD: Record<string, string> = {
  objectives: "pedagogical_objective",
  skills: "skill",
  methods: "method",
  evaluations: "evaluation_question",
  exercises: "exercise",
  positioning: "positioning_question",
  needs: "need_example",
};

function asList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v ?? "").trim()).filter(Boolean);
}

/** Lecture tolérante du JSON stocké en base. */
export function parseCustomProgram(raw: unknown): CustomProgram {
  if (!raw || typeof raw !== "object") return { ...EMPTY_CUSTOM_PROGRAM };
  const r = raw as Record<string, unknown>;
  const modules = Array.isArray(r.modules)
    ? (r.modules as unknown[])
        .map((m) => {
          const o = (m ?? {}) as Record<string, unknown>;
          const hours = Number(o.hours);
          return {
            title: String(o.title ?? "").trim(),
            hours: Number.isFinite(hours) && hours > 0 ? hours : null,
            content: String(o.content ?? "").trim(),
          };
        })
        .filter((m) => m.title)
    : [];
  return {
    objectives: asList(r.objectives),
    skills: asList(r.skills),
    prerequisites: String(r.prerequisites ?? "").trim(),
    methods: asList(r.methods),
    evaluations: asList(r.evaluations),
    exercises: asList(r.exercises),
    positioning: asList(r.positioning),
    needs: asList(r.needs),
    modules,
  };
}

/** Blocs de contenu par type, au format attendu par le moteur de documents. */
export function customBlocksByType(cp: CustomProgram): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const [field, type] of Object.entries(BLOCK_TYPE_BY_FIELD)) {
    const items = cp[field as keyof CustomProgram] as string[];
    if (items.length) map.set(type, items);
  }
  return map;
}

/** Lignes de modules, au format attendu par le moteur de documents. */
export function customModuleRows(cp: CustomProgram) {
  return cp.modules.map((m) => ({
    duration_hours: m.hours,
    modules: { title: m.content ? `${m.title} : ${m.content}` : m.title },
  }));
}

export function customTotalHours(cp: CustomProgram): number {
  return cp.modules.reduce((sum, m) => sum + (m.hours ?? 0), 0);
}
