// Déroulé pédagogique détaillé (indicateur 6 : « le prestataire adapte les
// prestations... » / conception des prestations). Demande de l'auditeur, 13/10/2026 :
// un planning séquence par séquence, avec horaires, contenus et méthodes,
// sur le modèle du déroulé de Novesia Formation.
//
// Fichier pur, sans appel réseau ni IA : le planning est CALCULÉ à partir de
//  - les dates et horaires de la session (matin / après-midi),
//  - la durée totale de la formation,
//  - les modules retenus et leur durée,
//  - les objectifs rattachés à chaque module et les exercices retenus.
// Les moments d'évaluation reprennent les trois phases du logiciel
// (positionnement à l'accueil, évaluation formative en fin de journée,
// évaluation sommative puis bilan à la fin), donc le déroulé reste cohérent
// avec les documents de résultat générés par ailleurs.
//
// Tout est calculé en minutes entières, par pas de 15 minutes.

export type DerouleModule = {
  title: string;
  hours: number | null;
  objectives: string[];
  exercises: string[];
};

export type DerouleInput = {
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  totalHours: number | null;
  modality: string | null;
  trainingName: string;
  modules: DerouleModule[];
};

const QUARTER = 15;

// ---------------------------------------------------------------- horaires

function extractTimes(value: string | null): number[] {
  if (!value) return [];
  const out: number[] = [];
  for (const m of value.matchAll(/(\d{1,2})\s*(?:h|:)\s*(\d{2})?/gi)) {
    const h = Number(m[1]);
    const min = m[2] ? Number(m[2]) : 0;
    if (h > 23 || min > 59) continue;
    out.push(h * 60 + min);
  }
  return out;
}

/**
 * Plages horaires d'une journée à partir des deux champs de la session.
 * Formats rencontrés : « 09h00 » / « 17h00 » (une plage), « 09h00 à 13h00 » /
 * « 14h00 à 17h00 » (matin / après-midi) ou « 9h00 / 13h30 » / « 12h30 / 17h00 »
 * (débuts puis fins). Renvoie null si les horaires ne sont pas exploitables.
 */
export function parseDayRanges(startTime: string | null, endTime: string | null): [number, number][] | null {
  const s = extractTimes(startTime);
  const e = extractTimes(endTime);
  let ranges: [number, number][];
  if (s.length === 1 && e.length === 1) {
    ranges = [[s[0], e[0]]];
  } else if (s.length === 2 && e.length === 2) {
    if (s[0] < s[1] && s[1] <= e[0] && e[0] < e[1]) {
      ranges = [[s[0], s[1]], [e[0], e[1]]];
    } else {
      ranges = [[s[0], e[0]], [s[1], e[1]]];
    }
  } else {
    return null;
  }
  for (let i = 0; i < ranges.length; i++) {
    if (ranges[i][1] <= ranges[i][0]) return null;
    if (i > 0 && ranges[i][0] < ranges[i - 1][1]) return null;
  }
  return ranges;
}

function listDays(startDate: string | null, endDate: string | null): string[] | null {
  if (!startDate) return null;
  const start = new Date(startDate + "T12:00:00Z");
  const end = new Date((endDate || startDate) + "T12:00:00Z");
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;
  const isWeekend = (d: Date) => d.getUTCDay() === 0 || d.getUTCDay() === 6;
  // Les week-ends sont sautés, sauf si la session commence ou finit un week-end.
  const weekendsWorked = isWeekend(start) || isWeekend(end);
  const days: string[] = [];
  const cursor = new Date(start);
  let guard = 0;
  while (cursor <= end && guard < 90) {
    if (weekendsWorked || !isWeekend(cursor)) days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    guard += 1;
  }
  return days.length > 0 ? days : null;
}

// ------------------------------------------------------------------ outils

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function clock(min: number): string {
  return `${pad(Math.floor(min / 60))}h${pad(min % 60)}`;
}

function durationLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : h === 0 ? `${m} min` : `${h}h${pad(m)}`;
}

function roundQuarter(min: number): number {
  return Math.round(min / QUARTER) * QUARTER;
}

function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function frDay(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
}

function stripFinalDot(text: string): string {
  return text.trim().replace(/[.\s]+$/, "");
}

// Méthode ou outil évoqué par le texte d'un exercice.
function toolForExercise(text: string): string {
  const t = text.toLowerCase();
  if (/jeu de rôle|jeux de rôle/.test(t)) return "Jeux de rôle, débriefing collectif";
  if (/étude de cas/.test(t)) return "Étude de cas, restitution";
  if (/simulation|mise en situation/.test(t)) return "Mise en situation, débriefing collectif";
  if (/atelier/.test(t)) return "Atelier pratique";
  if (/autodiagnostic|grille/.test(t)) return "Grille d'autodiagnostic, analyse de profil";
  if (/quiz|qcm/.test(t)) return "Quiz interactif";
  return "Exercice pratique, débriefing collectif";
}

function marker(text: string): string {
  return `<p class="empty">[${text} à compléter]</p>`;
}

// -------------------------------------------------------- séquences / rows

type Item = {
  minutes: number;
  kind: "theory" | "practice";
  title: string;
  desc: string;
  tool: string;
};

type Piece = {
  start: number; // minutes absolues depuis le début de la formation
  end: number;
  kind: "fixed" | "theory" | "practice";
  moduleIndex: number | null;
  title: string;
  desc: string;
  tool: string;
  continued?: boolean; // séquence déjà entamée plus tôt (jour ou demi-journée précédents)
};

function buildStream(mod: DerouleModule, teachingMin: number, distanciel: boolean): Item[] {
  const exercises = mod.exercises;
  const theoryTool = distanciel
    ? "Apports théoriques en classe virtuelle, échanges interactifs"
    : "Apports théoriques, échanges interactifs";

  const hasPractice = exercises.length > 0 && teachingMin >= 120;
  let practiceMin = hasPractice ? Math.max(30, roundQuarter(teachingMin * 0.35)) : 0;
  let theoryMin = teachingMin - practiceMin;
  if (theoryMin < QUARTER) {
    practiceMin = 0;
    theoryMin = teachingMin;
  }

  // Nombre de séquences théoriques : une par objectif (4 au maximum, les
  // objectifs sont alors regroupés), au moins une.
  const objectives = mod.objectives.map(stripFinalDot).filter(Boolean);
  let seqCount = Math.max(1, Math.min(objectives.length, 4));
  seqCount = Math.max(1, Math.min(seqCount, Math.floor(theoryMin / QUARTER)));

  const groups: string[][] = Array.from({ length: seqCount }, () => []);
  if (objectives.length === 0) {
    groups[0].push(mod.title);
  } else {
    const per = Math.ceil(objectives.length / seqCount);
    objectives.forEach((o, i) => groups[Math.min(seqCount - 1, Math.floor(i / per))].push(o));
  }

  const base = Math.floor(theoryMin / seqCount / QUARTER) * QUARTER;
  const items: Item[] = groups.map((g, i) => ({
    minutes: i === 0 ? theoryMin - base * (seqCount - 1) : base,
    kind: "theory",
    title: `Séquence ${i + 1}`,
    desc: g.join(" ; ") + ".",
    tool: theoryTool,
  }));

  if (hasPractice && practiceMin > 0) {
    const used = exercises.slice(0, 2);
    const each = used.length === 2 ? Math.max(QUARTER, roundQuarter(practiceMin / 2)) : practiceMin;
    used.forEach((ex, i) => {
      items.push({
        minutes: i === used.length - 1 ? practiceMin - each * (used.length - 1) : each,
        kind: "practice",
        title: "Mise en pratique",
        desc: stripFinalDot(ex) + ".",
        tool: toolForExercise(ex),
      });
    });
  } else if (exercises.length > 0) {
    // Module court : l'exercice est intégré à la dernière séquence.
    const last = items[items.length - 1];
    last.desc += ` Mise en pratique : ${stripFinalDot(exercises[0])}.`;
    last.tool += `, ${toolForExercise(exercises[0]).toLowerCase()}`;
  }
  return items;
}

// ------------------------------------------------------------------ moteur

/**
 * Construit le tableau HTML du planning détaillé, ou un message « à compléter »
 * (repéré par le contrôle de complétude, qui bloque alors la génération) quand
 * les dates, les horaires ou la durée ne permettent pas de bâtir un planning
 * fiable. Rien n'est inventé : pas d'horaire, pas de planning.
 */
export function buildDerouleHtml(input: DerouleInput): string {
  const totalMin = Math.round((input.totalHours ?? 0) * 60);
  if (totalMin <= 0) return marker("Durée de la formation");

  const ranges = parseDayRanges(input.startTime, input.endTime);
  if (!ranges) return marker("Horaires de la session");

  const days = listDays(input.startDate, input.endDate);
  if (!days) return marker("Dates de la session");

  const capMin = ranges.reduce((sum, [a, b]) => sum + (b - a), 0);
  if (!(totalMin <= days.length * capMin && totalMin > (days.length - 1) * capMin)) {
    return marker(
      `Durée de la formation (${durationLabel(totalMin)}) incohérente avec les dates et horaires de la session (${days.length} jour${days.length > 1 ? "s" : ""} de ${durationLabel(capMin)})`
    );
  }

  // Demi-journées : une par plage horaire, la dernière journée pouvant être raccourcie.
  type Slot = { day: number; label: string; clockStart: number; durMin: number; absStart: number };
  const slots: Slot[] = [];
  let abs = 0;
  days.forEach((_, di) => {
    let dayRemaining = Math.min(capMin, totalMin - di * capMin);
    ranges.forEach(([a, b], ri) => {
      const take = Math.min(b - a, dayRemaining);
      if (take <= 0) return;
      slots.push({
        day: di,
        label: ranges.length === 2 ? (ri === 0 ? "Matin" : "Après-midi") : "Journée",
        clockStart: a,
        durMin: take,
        absStart: abs,
      });
      abs += take;
      dayRemaining -= take;
    });
  });
  const slotEndAbs = (s: Slot) => s.absStart + s.durMin;
  const dayEndAbs = (di: number) => Math.max(...slots.filter((s) => s.day === di).map(slotEndAbs));

  // Moments fixes : accueil, évaluation formative de fin de journée,
  // évaluation sommative et bilan final.
  const big = totalMin >= 420;
  const accueil = totalMin < 120 ? QUARTER : big ? 30 : QUARTER;
  const bilan = totalMin < 120 ? QUARTER : big ? 30 : QUARTER;
  const lastDayMin = totalMin - (days.length - 1) * capMin;
  let sommative = big ? 60 : totalMin >= 150 ? 30 : QUARTER;
  sommative = Math.max(QUARTER, Math.min(sommative, lastDayMin - bilan - QUARTER));

  const fixed: { start: number; end: number; title: string; desc: string; tool: string }[] = [
    {
      start: 0,
      end: accueil,
      title: "Accueil et positionnement",
      desc: `Présentation de la formation « ${input.trainingName} », tour de table, recueil des attentes et restitution du positionnement initial.`,
      tool: "Questionnaire de positionnement, échanges",
    },
  ];
  if (totalMin >= 240) {
    for (let di = 0; di < days.length - 1; di++) {
      const end = dayEndAbs(di);
      fixed.push({
        start: end - 30,
        end,
        title: "Évaluation formative",
        desc: "Quiz de validation des acquis de la journée et débriefing collectif.",
        tool: "Quiz interactif, débriefing collectif",
      });
    }
  }
  fixed.push(
    {
      start: totalMin - bilan - sommative,
      end: totalMin - bilan,
      title: "Évaluation sommative",
      desc: "Étude de cas ou mise en situation de synthèse permettant de mesurer l'atteinte des objectifs pédagogiques.",
      tool: "Étude de cas, grille d'évaluation",
    },
    {
      start: totalMin - bilan,
      end: totalMin,
      title: "Bilan et clôture",
      desc: "Bilan oral de la formation, questionnaire d'évaluation des acquis et questionnaire de satisfaction à chaud.",
      tool: "Questionnaire de satisfaction",
    }
  );
  fixed.sort((a, b) => a.start - b.start);

  // Fenêtres des modules sur la ligne de temps (durées ramenées à la durée totale).
  const modules = input.modules.filter((m) => m.title.trim().length > 0);
  if (modules.length === 0) return marker("Modules de la formation");
  const weights = modules.map((m) => (m.hours && m.hours > 0 ? m.hours : 0));
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const shares = weightSum > 0 ? weights : modules.map(() => 1);
  const shareSum = shares.reduce((a, b) => a + b, 0);
  const bounds: number[] = [0];
  let cum = 0;
  shares.forEach((w, i) => {
    cum += w;
    bounds.push(i === shares.length - 1 ? totalMin : Math.min(totalMin, roundQuarter((totalMin * cum) / shareSum)));
  });

  // Intervalles d'enseignement (hors moments fixes).
  const gaps: [number, number][] = [];
  let cursor = 0;
  for (const f of fixed) {
    if (f.start > cursor) gaps.push([cursor, f.start]);
    cursor = Math.max(cursor, f.end);
  }
  if (cursor < totalMin) gaps.push([cursor, totalMin]);

  const overlap = (a0: number, a1: number, b0: number, b1: number) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
  const distanciel = input.modality === "distanciel";
  const streams: Item[][] = modules.map((mod, mi) => {
    const teaching = gaps.reduce((sum, [g0, g1]) => sum + overlap(g0, g1, bounds[mi], bounds[mi + 1]), 0);
    return teaching > 0 ? buildStream(mod, teaching, distanciel) : [];
  });

  // Répartition des séquences sur la ligne de temps, avec ajustement des
  // petits débords de demi-journée (moins de 30 min) pour éviter les
  // séquences coupées en deux.
  const pieces: Piece[] = [];
  const next = streams.map(() => 0);
  const left = streams.map((s) => s[0]?.minutes ?? 0);
  const started = streams.map(() => false);

  for (const [g0, g1] of gaps) {
    let pos = g0;
    while (pos < g1) {
      const mi = bounds.findIndex((b, i) => i < modules.length && pos >= b && pos < bounds[i + 1]);
      if (mi < 0) break;
      const limit = Math.min(g1, bounds[mi + 1]);
      const stream = streams[mi];
      if (next[mi] >= stream.length) {
        pos = limit; // sécurité : flux épuisé
        continue;
      }
      const item = stream[next[mi]];
      const slot = slots.find((s) => pos >= s.absStart && pos < slotEndAbs(s));
      const boundary = Math.min(limit, slot ? slotEndAbs(slot) : limit);

      if (pos + left[mi] > boundary) {
        const head = boundary - pos;
        const tail = pos + left[mi] - boundary;
        const hasNext = next[mi] + 1 < stream.length;
        const prev = pieces[pieces.length - 1];
        if (tail <= 30 && hasNext && left[mi] - tail >= 30) {
          left[mi] -= tail;
          stream[next[mi] + 1].minutes += tail;
        } else if (
          head <= 30 &&
          prev &&
          prev.kind !== "fixed" &&
          prev.moduleIndex === mi &&
          prev.end === pos &&
          left[mi] - head >= 30
        ) {
          prev.end += head;
          pos += head;
          left[mi] -= head;
        }
      }

      const use = Math.min(left[mi], boundary - pos);
      if (use <= 0) {
        pos = boundary;
        continue;
      }
      pieces.push({
        start: pos,
        end: pos + use,
        kind: item.kind,
        moduleIndex: mi,
        title: item.title,
        desc: item.desc,
        tool: item.tool,
        continued: started[mi],
      });
      started[mi] = true;
      pos += use;
      left[mi] -= use;
      if (left[mi] <= 0) {
        started[mi] = false;
        next[mi] += 1;
        left[mi] = stream[next[mi]]?.minutes ?? 0;
      }
    }
  }
  for (const f of fixed) {
    pieces.push({ start: f.start, end: f.end, kind: "fixed", moduleIndex: null, title: f.title, desc: f.desc, tool: f.tool });
  }
  pieces.sort((a, b) => a.start - b.start);

  // Découpage aux limites de demi-journée, puis affichage une ligne par demi-journée.
  type Row = Piece & { clockStart: number; clockEnd: number; slotIndex: number; suite: boolean };
  const rows: Row[] = [];
  for (const p of pieces) {
    let pos = p.start;
    let first = true;
    while (pos < p.end) {
      const si = slots.findIndex((s) => pos >= s.absStart && pos < slotEndAbs(s));
      if (si < 0) break;
      const s = slots[si];
      const cut = Math.min(p.end, slotEndAbs(s));
      rows.push({
        ...p,
        start: pos,
        end: cut,
        clockStart: s.clockStart + (pos - s.absStart),
        clockEnd: s.clockStart + (cut - s.absStart),
        slotIndex: si,
        suite: !first || Boolean(p.continued),
      });
      pos = cut;
      first = false;
    }
  }

  const body = slots
    .map((s, si) => {
      const slotRows = rows.filter((r) => r.slotIndex === si);
      if (slotRows.length === 0) return "";
      const moduleIdxs = Array.from(
        new Set(slotRows.map((r) => r.moduleIndex).filter((m): m is number => m !== null))
      );
      const moduleLabel = moduleIdxs.length
        ? moduleIdxs.map((m) => `<div class="dmod">Module ${m + 1} : ${esc(modules[m].title)}</div>`).join("")
        : "";
      const leftCell =
        `<strong>JOUR ${s.day + 1} — ${s.label.toUpperCase()}</strong><br/>` +
        `${esc(frDay(days[s.day]))}<br/>` +
        `${clock(s.clockStart)} – ${clock(s.clockStart + s.durMin)} (${durationLabel(s.durMin)})` +
        moduleLabel;
      const middle = slotRows
        .map(
          (r) =>
            `<p class="dseq"><strong>${clock(r.clockStart)} – ${clock(r.clockEnd)} · ${esc(r.title)}${r.suite ? " (suite)" : ""}</strong><br/>${esc(r.desc)}</p>`
        )
        .join("");
      const tools = Array.from(new Set(slotRows.map((r) => r.tool)));
      const right = `<ul class="dtools">${tools.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
      return `<tr><td class="dleft">${leftCell}</td><td>${middle}</td><td>${right}</td></tr>`;
    })
    .join("");

  return (
    `<table class="deroule"><thead><tr><th>Horaire &amp; module</th><th>Contenu &amp; séquences pédagogiques</th><th>Méthodes &amp; outils</th></tr></thead>` +
    `<tbody>${body}</tbody></table>`
  );
}
