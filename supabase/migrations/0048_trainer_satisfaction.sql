-- Questionnaire de satisfaction du formateur (indicateur 30 : appreciations
-- des equipes pedagogiques). Manque releve lors d'un audit reel.
-- Meme fonctionnement que le questionnaire beneficiaire : saisie dans
-- /conformite/satisfaction-formateur, document vierge tant que rien n'est saisi.

create table if not exists public.trainer_satisfaction_responses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  trainer_name text,
  answered_on date not null default current_date,
  t_preparation integer check (t_preparation between 1 and 5),
  t_objectifs integer check (t_objectifs between 1 and 5),
  t_locaux integer check (t_locaux between 1 and 5),
  t_moyens integer check (t_moyens between 1 and 5),
  t_groupe integer check (t_groupe between 1 and 5),
  t_implication integer check (t_implication between 1 and 5),
  t_suivi integer check (t_suivi between 1 and 5),
  t_conditions integer check (t_conditions between 1 and 5),
  objectifs_atteints text check (objectifs_atteints in ('oui', 'non', 'partiellement')),
  reintervenir text check (reintervenir in ('oui', 'non')),
  difficultes text,
  suggestions text,
  commentaire_libre text,
  created_at timestamptz not null default now()
);

create index if not exists trainer_satisfaction_responses_org_idx
  on public.trainer_satisfaction_responses (organization_id);

alter table public.trainer_satisfaction_responses enable row level security;

drop policy if exists trainer_satisfaction_all_member on public.trainer_satisfaction_responses;
create policy trainer_satisfaction_all_member on public.trainer_satisfaction_responses
  for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Nouveau type de section rendu par le moteur.
alter table public.document_template_sections
  drop constraint if exists document_template_sections_content_type_check;
alter table public.document_template_sections
  add constraint document_template_sections_content_type_check
  check (content_type = any (array[
    'rich_text', 'variable_block', 'table', 'content_block_list', 'checklist',
    'signature_block', 'attendance_grid', 'data_table', 'org_chart',
    'qcm_answers', 'satisfaction_results', 'trainer_satisfaction_results'
  ]));

insert into public.document_templates
  (id, label, category_scope, applicable_when, linked_indicator_numbers, folder_group, sort_order, is_active, tip)
values (
  'questionnaire_satisfaction_formateur',
  'Questionnaire de satisfaction formateur',
  'all',
  '{}'::jsonb,
  array[30],
  '05_Apres_formation',
  21,
  true,
  'Sort vierge tant qu''aucune réponse n''est saisie, et renseigné dès que vous enregistrez l''avis du formateur dans Conformité, rubrique « Satisfaction formateur ».'
)
on conflict (id) do nothing;

insert into public.document_template_sections
  (document_template_id, code, title, content_type, sort_order, html_template, content_block_scope)
values
  (
    'questionnaire_satisfaction_formateur', 'header', 'En-tête', 'rich_text', 1,
    '<p>{{company_name}} — Questionnaire de satisfaction de l''intervenant</p>' ||
    '<p>Formation animée : <strong>{{training_name}}</strong> — du {{training_start_date}} au {{training_end_date}}</p>' ||
    '<p>Formateur / intervenant : <strong>{{trainer_name}}</strong></p>' ||
    '<p>Ce questionnaire recueille l''appréciation de l''équipe pédagogique sur les conditions de réalisation de la prestation (indicateur 30 du référentiel Qualiopi). Il est exploité dans notre démarche d''amélioration continue.</p>', 'global'
  ),
  (
    'questionnaire_satisfaction_formateur', 'criteres', 'Appréciation par critère', 'trainer_satisfaction_results', 2,
    null, 'global'
  ),
  (
    'questionnaire_satisfaction_formateur', 'exploitation', 'Exploitation des réponses', 'rich_text', 3,
    '<p class="empty">Les réponses sont analysées par {{company_name}} après chaque session. Toute difficulté signalée donne lieu à une action inscrite au tableau d''amélioration continue (indicateur 32).</p>', 'global'
  ),
  (
    'questionnaire_satisfaction_formateur', 'signature', 'Signature', 'rich_text', 4,
    '<p>Fait à {{organization_city}}, le {{generated_date}}</p><p>Signature du formateur : {{trainer_name}}</p><p><br/><br/></p>', 'global'
  );
