// Variables propres aux pièces du dossier de déclaration d'activité (NDA),
// sur le modèle des pièces réellement acceptées pour un client (Organisation
// des actions, Moyens pédagogiques / techniques, Documents contractuels,
// Description succincte). Fonctions pures, sans IA : règles selon la forme
// juridique, la modalité, la durée et la session.

import type { Organization } from "@/lib/actions/organization";
import type { Training } from "@/lib/actions/training";
import type { TrainingSession } from "@/lib/actions/session";
import type { OrgTrainer } from "@/lib/actions/trainers";
import { legalFormInfo, NSF_BY_CATEGORY } from "./tracks";

function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function frLongDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/** "2 journées de 7 heures", "1 journée de 7 heures", "3 journées (21 heures)". */
export function daysSummary(hours: number | null): string {
  if (!hours || hours <= 0) return "[Durée à compléter]";
  const days = Math.ceil(hours / 7);
  if (hours % 7 === 0) return `${days} journée${days > 1 ? "s" : ""} de 7 heures`;
  return `${days} journée${days > 1 ? "s" : ""} (${hours} heures au total, 7 heures maximum par jour)`;
}

/** Nature du lien juridique entre le dirigeant formateur et l'organisme. */
function managerLink(org: Organization): { nature: string; proof: string } {
  const lf = legalFormInfo(org.legal_form);
  switch (org.legal_form) {
    case "micro_entreprise":
      return { nature: "Entrepreneur individuel (micro-entrepreneur) exerçant en nom propre", proof: "Avis de situation au répertoire Sirene" };
    case "ei":
      return { nature: "Entrepreneur individuel exerçant en nom propre", proof: "Avis de situation au répertoire Sirene" };
    case "eurl":
    case "sarl":
      return { nature: `Mandataire social : gérant(e) de ${org.company_name}`, proof: "Extrait Kbis de moins de trois mois mentionnant sa qualité de gérant(e), et statuts" };
    case "sasu":
    case "sas":
      return { nature: `Mandataire social : président(e) de ${org.company_name}`, proof: "Extrait Kbis de moins de trois mois mentionnant sa qualité de président(e), et statuts" };
    case "association":
      return { nature: `Président(e) de l'association ${org.company_name}`, proof: "Récépissé de déclaration en préfecture et statuts" };
    default:
      return { nature: lf ? `Dirigeant(e) de ${org.company_name}` : "[Forme juridique à compléter]", proof: lf?.registrationProof ?? "Justificatif d'immatriculation" };
  }
}

type Person = { name: string; roles: string; nature: string; proof: string; status: string; manager: boolean; sub: boolean; trainer: OrgTrainer | null };

const TODO = "[À compléter]";

function multiline(value: string | null | undefined): string {
  const v = (value ?? "").trim();
  return v ? esc(v).replace(/\n/g, "<br/>") : TODO;
}

/**
 * Personnes qui interviennent comme formateurs : celles saisies dans « Mes
 * formateurs » ; à défaut, le dirigeant, le formateur de la session et le
 * formateur externe des paramètres. Le statut du dirigeant vient de la forme
 * juridique, pour rester identique dans la liste des formateurs et dans les
 * documents contractuels.
 */
function trainerPeople(org: Organization, session: TrainingSession | null, trainers: OrgTrainer[]): Person[] {
  const link = managerLink(org);
  const manager = org.manager_name || "[Dirigeant à compléter]";
  const managerRoles = ["Dirigeant(e)", "formateur(trice)"];
  if (org.is_sole_practitioner) managerRoles.push("référent(e) pédagogique, qualité et handicap");
  const subProof = "Contrat de sous-traitance signé, avis de situation Sirene ou Kbis de l'intervenant";
  const subNature = "Formateur(trice) indépendant(e) intervenant dans le cadre d'un contrat de sous-traitance d'enseignement";

  if (trainers.length > 0) {
    return trainers.map((t) => {
      const isManager = t.is_manager || t.full_name.trim().toLowerCase() === (org.manager_name ?? "").trim().toLowerCase();
      if (isManager) {
        return { name: t.full_name, roles: managerRoles.join(", "), nature: link.nature, proof: link.proof, status: link.nature, manager: true, sub: false, trainer: t };
      }
      const nature = t.link_type || (t.is_subcontracted ? subNature : `Salarié(e) de ${org.company_name}`);
      return {
        name: t.full_name,
        roles: t.role || "Formateur(trice)",
        nature,
        proof: t.is_subcontracted ? subProof : "Contrat de travail signé",
        status: nature,
        manager: false,
        sub: t.is_subcontracted,
        trainer: t,
      };
    });
  }

  const people: Person[] = [{ name: manager, roles: managerRoles.join(", "), nature: link.nature, proof: link.proof, status: link.nature, manager: true, sub: false, trainer: null }];
  const known = new Set([manager.trim().toLowerCase()]);
  const extra = [session?.trainer_is_manager ? null : session?.trainer_name, org.external_trainer_name].map((n) => n?.trim()).filter(Boolean) as string[];
  for (const name of extra) {
    if (known.has(name.toLowerCase())) continue;
    known.add(name.toLowerCase());
    people.push({ name, roles: "Formateur(trice)", nature: subNature, proof: subProof, status: subNature, manager: false, sub: true, trainer: null });
  }
  return people;
}

/** Variables texte/HTML des pièces NDA, ajoutées à celles du moteur. */
export function ndaVariables(
  org: Organization,
  training: Training,
  session: TrainingSession | null,
  trainers: OrgTrainer[] = [],
  skillBlocks: string[] = []
): Record<string, string> {
  const lf = legalFormInfo(org.legal_form);
  const manager = org.manager_name || "[Dirigeant à compléter]";
  const people = trainerPeople(org, session, trainers);

  const contractRows = people
    .map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.roles)}</td><td>${esc(p.nature)}</td><td>${esc(p.proof)}</td></tr>`)
    .join("");

  const pieces: string[] = [];
  for (const p of people) {
    if (!pieces.includes(p.proof)) pieces.push(p.proof);
    pieces.push(`Curriculum vitae de ${p.name}`, `Copies des diplômes et attestations de formation de ${p.name}`);
  }

  const subCount = people.filter((p) => p.sub).length;
  const salaried = people.filter((p) => !p.manager && !p.sub).length;
  const specialty = NSF_BY_CATEGORY[training.category_id] ?? training.nsf_specialty ?? training.name;
  const onlyManager = people.length === 1 && people[0].manager;

  const subSentence =
    subCount === 0 && salaried === 0
      ? `${org.company_name} n'emploie aucun salarié formateur et ne recourt à aucun formateur sous-traitant à la date du présent document.`
      : [
          salaried ? `${org.company_name} emploie ${salaried} salarié(e)${salaried > 1 ? "s" : ""} formateur(trice)${salaried > 1 ? "s" : ""}.` : "",
          subCount ? `${org.company_name} fait intervenir ${subCount} formateur${subCount > 1 ? "s" : ""} dans le cadre d'un contrat de sous-traitance d'enseignement.` : "",
        ].filter(Boolean).join(" ");

  const trainersIntro = onlyManager
    ? `${org.company_name} mobilise à ce jour un seul formateur, qui est également le/la dirigeant(e) de la structure. Aucune action de formation n'est sous-traitée. Toute évolution de cette liste donnera lieu à une mise à jour du présent document.`
    : `${org.company_name} mobilise à ce jour ${people.length} formateur${people.length > 1 ? "s" : ""}${subCount ? `, dont ${subCount} intervenant en sous-traitance` : ""}. Toute évolution de cette liste donnera lieu à une mise à jour du présent document.`;

  const actionLine = `${training.name} (${training.duration_hours ?? "?"} heures, ${training.modality === "distanciel" ? "distanciel" : training.modality === "hybride" ? "hybride" : "présentiel"})`;

  const sheetRow = (label: string, value: string) => `<tr><th>${esc(label)}</th><td>${value}</td></tr>`;
  const sheets = people
    .map((p) => {
      const t = p.trainer;
      const contact = [t?.email || (p.manager ? org.email : null), t?.phone || (p.manager ? org.phone : null)].filter(Boolean).join(" · ");
      return (
        `<h3>${esc(p.name)}</h3><table><tbody>` +
        sheetRow("Nom et prénom", esc(p.name)) +
        sheetRow("Fonction", esc(t?.role || p.roles)) +
        sheetRow("Statut", esc(p.status)) +
        sheetRow("Coordonnées professionnelles", contact ? esc(contact) : TODO) +
        sheetRow("Actions animées", esc(actionLine)) +
        sheetRow("Diplômes et titres", multiline(t?.diplomas)) +
        sheetRow("Expérience professionnelle", multiline(t?.experience)) +
        sheetRow("Compétences mobilisées", multiline(t?.skills)) +
        sheetRow("Expérience de l'animation", multiline(t?.animation_experience)) +
        sheetRow("Formation continue", multiline(t?.continuing_training)) +
        sheetRow("Justificatifs joints", `Curriculum vitae à jour, copies des diplômes${p.sub ? ", contrat de sous-traitance" : ""}`) +
        `</tbody></table>`
      );
    })
    .join("");

  const required = skillBlocks.slice(0, 6);
  const adequationRows = people
    .map((p) => {
      const requiredHtml = required.length ? `<ul>${required.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : esc(training.name);
      return `<tr><td>${esc(training.name)}</td><td>${requiredHtml}</td><td>${p.trainer?.skills ? multiline(p.trainer.skills) : TODO}</td><td>Diplômes, CV${p.sub ? ", contrat de sous-traitance" : ""}</td></tr>`;
    })
    .join("");

  const trainersRows = people
    .map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.trainer?.role || p.roles)}</td><td>${esc(p.status)}</td><td>${p.trainer?.domains ? esc(p.trainer.domains) : esc(specialty)}</td></tr>`)
    .join("");

  const modality = training.modality ?? "presentiel";
  const remote = modality !== "presentiel";
  const onsite = modality !== "distanciel";

  const equipmentRows = [
    onsite && ["Salle de formation", "Accueil des participants, disposition favorisant les échanges et le travail en sous-groupes", "Organisme ou client"],
    onsite && ["Vidéoprojecteur ou écran", "Projection des supports et des travaux", "Organisme ou client"],
    onsite && ["Paperboard et feutres", "Production collective, restitution des travaux", "Organisme"],
    ["Ordinateur portable", "Animation, projection, accès aux ressources en ligne", "Formateur"],
    ["Accès internet", "Consultation de ressources, diffusion de vidéos", onsite ? "Lieu d'accueil" : "Formateur et participant"],
    ["Supports pédagogiques", "Fiches outils, exercices et cas pratiques remis à chaque participant", "Organisme"],
  ].filter(Boolean) as string[][];

  const toolRows = [
    remote && ["Outil de classe virtuelle (Zoom, Teams ou Google Meet)", "Classe virtuelle synchrone, partage d'écran, salles de sous-groupes", "Lien transmis avec la convocation, sans installation requise"],
    ["Espace de partage de documents", "Mise à disposition des supports et dépôt des productions", "Lien de partage transmis par e-mail"],
    ["Questionnaires en ligne", "Recueil des besoins, positionnement, quiz d'évaluation et satisfaction", "Lien transmis par e-mail"],
    ["Messagerie électronique", "Convocations, transmission des supports, suivi post-formation", org.email ?? "Adresse de l'organisme"],
  ].filter(Boolean) as string[][];

  const rows = (list: string[][]) => list.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("");

  return {
    legal_form_label: lf?.label ?? "[Forme juridique à compléter]",
    manager_title: lf?.managerTitle ?? "Dirigeant(e)",
    nda_specialty: NSF_BY_CATEGORY[training.category_id] ?? training.nsf_specialty ?? "",
    nda_days_summary: daysSummary(training.duration_hours),
    nda_contract_rows: contractRows,
    nda_contract_pieces: pieces.map((p) => `<li>${esc(p)}</li>`).join(""),
    nda_subcontracting_sentence: subSentence,
    nda_trainers_rows: trainersRows,
    nda_trainers_intro: trainersIntro,
    nda_trainer_sheets: sheets,
    nda_adequation_rows: adequationRows,
    nda_equipment_rows: rows(equipmentRows),
    nda_tools_rows: rows(toolRows),
    nda_tech_prereq:
      remote
        ? "Un ordinateur, une tablette ou un smartphone connecté à internet, équipé d'un micro et d'une caméra, avec un débit permettant la visioconférence, dans un environnement calme. Navigateur à jour (Chrome, Firefox, Safari ou Edge)."
        : "Aucun équipement personnel n'est nécessaire : le matériel et les supports sont fournis par l'organisme.",
    nda_modality_sentence:
      modality === "distanciel"
        ? "Formation synchrone en classe virtuelle. Un lien de connexion est transmis avec la convocation. L'assiduité est tracée par les relevés de connexion et les émargements par demi-journée."
        : modality === "hybride"
        ? "Formation combinant des séquences en présentiel et des séquences à distance en classe virtuelle. Le calendrier précise la modalité de chaque séquence."
        : "Formation en salle, en groupe, avec alternance d'apports, de mises en situation et d'exercices pratiques.",
  };
}

type ModuleRow = { duration_hours: number | null; modules: { title: string } | { title: string }[] | null };

/**
 * Lignes du calendrier de la session (une par journée de formation), avec
 * les modules du programme répartis jour par jour (7 heures par jour).
 */
export function ndaCalendarRows(training: Training, session: TrainingSession | null, moduleRows: ModuleRow[]): string {
  const total = training.duration_hours ?? 0;
  if (!session?.start_date || total <= 0) {
    return `<tr><td colspan="5">Le calendrier sera complété dès que les dates de la première session seront renseignées.</td></tr>`;
  }
  const nbDays = Math.ceil(total / 7);
  const start = new Date(session.start_date + "T12:00:00");
  const end = session.end_date ? new Date(session.end_date + "T12:00:00") : null;
  const days: Date[] = [];
  const cursor = new Date(start);
  let guard = 0;
  // Les week-ends sont sautés, sauf si la session elle-même commence ou
  // se termine un samedi ou un dimanche (organisme qui forme le week-end).
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
  const weekendsWorked = isWeekend(start) || (end ? isWeekend(end) : false);
  while (days.length < nbDays && guard < 120) {
    if (weekendsWorked || !isWeekend(cursor)) days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
    guard += 1;
  }

  // Répartition des modules par journée selon leurs durées cumulées.
  const modules = moduleRows.map((r) => {
    const m = Array.isArray(r.modules) ? r.modules[0] : r.modules;
    return { title: m?.title ?? "", hours: r.duration_hours ?? 0 };
  }).filter((m) => m.title);
  const perDay: string[][] = days.map(() => []);
  let acc = 0;
  for (const m of modules) {
    const startDay = Math.min(Math.floor(acc / 7), days.length - 1);
    const endDay = Math.min(Math.floor(Math.max(acc + Math.max(m.hours, 0.01) - 0.01, 0) / 7), days.length - 1);
    for (let d = startDay; d <= endDay; d++) perDay[d].push(m.title);
    acc += m.hours;
  }

  const hours =
    session.start_time && session.end_time ? `${session.start_time} – ${session.end_time}` : "09h00 – 12h30 / 13h30 – 17h00";
  const modalityLabel = training.modality === "distanciel" ? "Distanciel" : training.modality === "hybride" ? "Hybride" : "Présentiel";
  const trainer = session.trainer_name ?? "";

  return days
    .map((d, i) => {
      const dayHours = Math.min(7, total - i * 7);
      const content = perDay[i].length ? perDay[i].join(" ; ") : training.name;
      return `<tr><td>${esc(frLongDate(d))}</td><td>${esc(hours)}</td><td>${esc(content)}</td><td>${esc(trainer)}</td><td>${modalityLabel}, ${dayHours} h</td></tr>`;
    })
    .join("");
}
