-- Moteur d'évaluation des acquis (QCM auto-corrigé, seuil de réussite) —
-- dernier gap de priorité haute de l'audit Phase 5 (cf. journal-avancement).
--
-- Les tables `questions` / `answer_options` existantes (0001_init) sont déjà
-- utilisées en production pour l'arbre de questions de l'onboarding (étape
-- "activite" — cf. lib/actions/questions.ts, contrainte `step` limitée à
-- 'entreprise'/'activite'/'formation'/'session'). Une évaluation notée avec
-- tentatives, score et seuil de réussite est un objet différent (résultat
-- chiffré, historisé, potentiellement plusieurs tentatives par bénéficiaire)
-- : on crée donc un jeu de tables dédié plutôt que de détourner l'existant.
--
-- QUESTION -> RÉPONSE -> RÈGLE -> VARIABLES -> BLOC -> DOCUMENT -> PDF :
-- ici la "règle" est simplement le barème (bonne réponse = 1 point, seuil
-- 70 %) et le "document" final est le PDF de résultat (migration 0025).
-- Toujours PAS d'IA : correction par comparaison directe des identifiants
-- de réponse cochée / réponse correcte, en base.

create table evaluation_questions (
  id text primary key,
  category_id text not null references training_categories(id),
  topic text not null, -- ex: "Instagram", "Stratégie" — regroupement thématique affiché à l'utilisateur
  question_text text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table evaluation_answer_options (
  id uuid primary key default gen_random_uuid(),
  question_id text not null references evaluation_questions(id) on delete cascade,
  label text not null,
  is_correct boolean not null default false,
  sort_order int not null default 0
);

create table evaluation_attempts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  training_id uuid references trainings(id) on delete set null,
  session_id uuid references sessions(id) on delete set null,
  beneficiary_id uuid references beneficiaries(id) on delete set null,
  category_id text not null references training_categories(id),
  respondent_label text, -- nom libre si aucun bénéficiaire lié (auto-évaluation formateur, test)
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  score_raw int, -- nombre de bonnes réponses
  score_max int, -- nombre total de questions posées
  score_percent numeric, -- score_raw / score_max * 100, arrondi
  passed boolean -- score_percent >= 70
);

create table evaluation_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references evaluation_attempts(id) on delete cascade,
  question_id text not null references evaluation_questions(id),
  selected_option_id uuid references evaluation_answer_options(id),
  is_correct boolean not null default false
);

create index evaluation_answer_options_question_idx on evaluation_answer_options(question_id);
create index evaluation_attempts_training_idx on evaluation_attempts(training_id);
create index evaluation_attempt_answers_attempt_idx on evaluation_attempt_answers(attempt_id);

alter table evaluation_questions enable row level security;
alter table evaluation_answer_options enable row level security;
alter table evaluation_attempts enable row level security;
alter table evaluation_attempt_answers enable row level security;

-- Banque de questions : contenu référentiel, lecture ouverte à tout
-- utilisateur authentifié (même politique que `questions`/`answer_options`,
-- `training_categories`... cf. 0001_init policy "referentiel_read_all").
create policy "referentiel_read_all" on evaluation_questions for select using (true);
create policy "referentiel_read_all" on evaluation_answer_options for select using (true);

-- Tentatives et réponses : propres à l'organisme (mêmes règles que
-- `sessions`/`beneficiaries` via is_org_member, cf. 0001_init).
create policy "evaluation_attempts_all_member" on evaluation_attempts
  for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));

create policy "evaluation_attempt_answers_all_member" on evaluation_attempt_answers
  for all using (
    exists (select 1 from evaluation_attempts a where a.id = evaluation_attempt_answers.attempt_id and is_org_member(a.organization_id))
  ) with check (
    exists (select 1 from evaluation_attempts a where a.id = evaluation_attempt_answers.attempt_id and is_org_member(a.organization_id))
  );
