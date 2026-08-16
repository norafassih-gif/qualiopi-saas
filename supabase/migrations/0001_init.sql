-- ============================================================================
-- Logiciel Qualiopi — Migration initiale (Phase 0)
-- Voir docs/conception/conception-moteur-v1.md pour le détail de chaque table.
-- ============================================================================

create extension if not exists "pgcrypto"; -- pour gen_random_uuid()

-- =========================================================
-- ORGANISATION / MULTI-TENANT
-- =========================================================
create table organizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users(id), -- 1 organisme actif par compte au MVP
  company_name text not null,
  commercial_name text,
  manager_name text,
  siret text,
  address text,
  phone text,
  email text,
  website text,
  logo_url text,
  brand_color_primary text default '#1E3A8A',
  brand_color_secondary text default '#F97316',
  brand_font text default 'Inter',
  pedagogical_referent text,
  quality_referent text,
  disability_referent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table memberships ( -- multi-utilisateur PAR organisme (pas multi-organisme, cf. addendum 17)
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  role text not null default 'owner' check (role in ('owner', 'collaborator')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- =========================================================
-- CATALOGUE / RÉFÉRENTIEL QUALIOPI (lecture seule pour les clients)
-- =========================================================
create table qualiopi_criteria (
  id serial primary key,
  number int not null unique,
  title text not null
);

create table qualiopi_indicators (
  id serial primary key,
  number int not null unique,
  criterion_id int not null references qualiopi_criteria(id),
  title text not null,
  expected_evidence text
);

-- =========================================================
-- CATÉGORIES DE FORMATION
-- =========================================================
create table training_categories (
  id text primary key,
  label text not null,
  description text,
  icon text,
  is_active boolean not null default true,
  sort_order int not null default 0
);

-- =========================================================
-- BANQUE DE CONTENUS
-- =========================================================
create table content_blocks (
  id uuid primary key default gen_random_uuid(),
  category_id text references training_categories(id), -- null = transverse (procédures Critères 4-7)
  type text not null,
  code text not null unique,
  text text not null,
  tags text[] default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table modules (
  id uuid primary key default gen_random_uuid(),
  category_id text references training_categories(id),
  code text not null unique,
  title text not null,
  default_duration_hours numeric,
  linked_objective_codes text[] default '{}',
  source text,
  valid_from date,
  is_active boolean not null default true
);

-- =========================================================
-- QUESTIONS / RÉPONSES / ARBRE
-- =========================================================
create table questions (
  id text primary key,
  category_id text references training_categories(id), -- null = question globale
  step text not null check (step in ('entreprise', 'activite', 'formation', 'session')),
  label text not null,
  help_text text,
  type text not null check (type in ('text', 'boolean', 'single_choice', 'multi_choice', 'number', 'date', 'file')),
  variable_key text,
  display_condition jsonb,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table answer_options (
  id uuid primary key default gen_random_uuid(),
  question_id text not null references questions(id) on delete cascade,
  value text not null,
  label text not null,
  sort_order int not null default 0
);

create table user_answers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  training_id uuid, -- FK ajoutée après création de `trainings` plus bas
  question_id text not null references questions(id),
  answer_value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- MOTEUR DE RÈGLES
-- =========================================================
create table rules (
  id uuid primary key default gen_random_uuid(),
  category_id text references training_categories(id), -- null = règle globale
  label text not null,
  justification text,
  conditions jsonb not null,
  actions jsonb not null,
  priority int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- FORMATIONS / SESSIONS
-- =========================================================
create table trainings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  category_id text not null references training_categories(id),
  name text not null,
  duration_hours numeric,
  modality text check (modality in ('presentiel', 'distanciel', 'hybride')),
  target_audience text[] default '{}',
  is_certifying boolean not null default false,
  certifier_name text,
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_answers
  add constraint user_answers_training_fk foreign key (training_id) references trainings(id) on delete cascade,
  add constraint user_answers_unique unique (organization_id, training_id, question_id);

create table training_modules (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references trainings(id) on delete cascade,
  module_id uuid not null references modules(id),
  sort_order int not null default 0,
  duration_hours numeric,
  added_by_rule_id uuid references rules(id)
);

create table training_content_blocks (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references trainings(id) on delete cascade,
  content_block_id uuid not null references content_blocks(id),
  added_by_rule_id uuid references rules(id)
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references trainings(id) on delete cascade,
  trainer_name text,
  start_date date,
  end_date date,
  location text,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'done', 'cancelled')),
  created_at timestamptz not null default now()
);

create table beneficiaries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  full_name text not null,
  company text,
  email text,
  role text
);

-- =========================================================
-- DOCUMENTS
-- =========================================================
create table document_templates (
  id text primary key,
  label text not null,
  category_scope text not null default 'all',
  applicable_when jsonb,
  linked_indicator_numbers int[] default '{}',
  folder_group text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table document_template_sections (
  id uuid primary key default gen_random_uuid(),
  document_template_id text not null references document_templates(id) on delete cascade,
  code text not null,
  title text not null,
  sort_order int not null default 0,
  content_type text not null check (content_type in ('rich_text', 'variable_block', 'table', 'content_block_list', 'checklist', 'signature_block')),
  html_template text,
  source_content_block_type text
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  training_id uuid references trainings(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  document_template_id text not null references document_templates(id),
  status text not null default 'to_generate' check (status in ('to_generate', 'draft', 'generated', 'to_review')),
  data_snapshot jsonb,
  pdf_url text,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- VARIABLES (référentiel, pour l'admin)
-- =========================================================
create table variables (
  key text primary key,
  label text not null,
  source_table text,
  source_field text,
  format text check (format in ('text', 'date', 'number', 'currency', 'boolean'))
);

-- =========================================================
-- INDEX UTILES
-- =========================================================
create index idx_trainings_org on trainings(organization_id);
create index idx_sessions_training on sessions(training_id);
create index idx_documents_org on documents(organization_id);
create index idx_content_blocks_category on content_blocks(category_id, type);
create index idx_questions_category on questions(category_id, step);
create index idx_rules_category on rules(category_id, is_active);

-- =========================================================
-- updated_at automatique
-- =========================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_organizations_updated_at before update on organizations
  for each row execute function set_updated_at();
create trigger trg_trainings_updated_at before update on trainings
  for each row execute function set_updated_at();
create trigger trg_documents_updated_at before update on documents
  for each row execute function set_updated_at();
create trigger trg_user_answers_updated_at before update on user_answers
  for each row execute function set_updated_at();

-- =========================================================
-- RLS — Row Level Security
-- =========================================================
alter table organizations enable row level security;
alter table memberships enable row level security;
alter table trainings enable row level security;
alter table training_modules enable row level security;
alter table training_content_blocks enable row level security;
alter table sessions enable row level security;
alter table beneficiaries enable row level security;
alter table documents enable row level security;
alter table user_answers enable row level security;

-- Référentiels : lecture publique (aux utilisateurs authentifiés), écriture réservée au service_role (back-office admin, cf. Phase 7)
alter table qualiopi_criteria enable row level security;
alter table qualiopi_indicators enable row level security;
alter table training_categories enable row level security;
alter table content_blocks enable row level security;
alter table modules enable row level security;
alter table questions enable row level security;
alter table answer_options enable row level security;
alter table rules enable row level security;
alter table document_templates enable row level security;
alter table document_template_sections enable row level security;
alter table variables enable row level security;

create policy "referentiel_read_all" on qualiopi_criteria for select using (true);
create policy "referentiel_read_all" on qualiopi_indicators for select using (true);
create policy "referentiel_read_all" on training_categories for select using (true);
create policy "referentiel_read_all" on content_blocks for select using (true);
create policy "referentiel_read_all" on modules for select using (true);
create policy "referentiel_read_all" on questions for select using (true);
create policy "referentiel_read_all" on answer_options for select using (true);
create policy "referentiel_read_all" on rules for select using (true);
create policy "referentiel_read_all" on document_templates for select using (true);
create policy "referentiel_read_all" on document_template_sections for select using (true);
create policy "referentiel_read_all" on variables for select using (true);
-- Écriture référentiel : aucune policy insert/update/delete pour les rôles standards -> uniquement via service_role (back-office), conformément au point 6 de la conception.

-- organizations : un membre ne voit/modifie que SON organisme
create policy "org_select_member" on organizations for select
  using (exists (select 1 from memberships m where m.organization_id = organizations.id and m.user_id = auth.uid()));
create policy "org_update_owner" on organizations for update
  using (owner_user_id = auth.uid());
create policy "org_insert_self" on organizations for insert
  with check (owner_user_id = auth.uid());

create policy "memberships_select_own_org" on memberships for select
  using (exists (select 1 from memberships m2 where m2.organization_id = memberships.organization_id and m2.user_id = auth.uid()));

-- Fonction utilitaire : l'utilisateur courant appartient-il à cet organisme ?
create or replace function is_org_member(org_id uuid) returns boolean as $$
  select exists (select 1 from memberships m where m.organization_id = org_id and m.user_id = auth.uid());
$$ language sql stable security definer;

create policy "trainings_all_member" on trainings for all
  using (is_org_member(organization_id)) with check (is_org_member(organization_id));

create policy "training_modules_all_member" on training_modules for all
  using (exists (select 1 from trainings t where t.id = training_modules.training_id and is_org_member(t.organization_id)));

create policy "training_content_blocks_all_member" on training_content_blocks for all
  using (exists (select 1 from trainings t where t.id = training_content_blocks.training_id and is_org_member(t.organization_id)));

create policy "sessions_all_member" on sessions for all
  using (exists (select 1 from trainings t where t.id = sessions.training_id and is_org_member(t.organization_id)));

create policy "beneficiaries_all_member" on beneficiaries for all
  using (exists (select 1 from sessions s join trainings t on t.id = s.training_id where s.id = beneficiaries.session_id and is_org_member(t.organization_id)));

create policy "documents_all_member" on documents for all
  using (is_org_member(organization_id)) with check (is_org_member(organization_id));

create policy "user_answers_all_member" on user_answers for all
  using (is_org_member(organization_id)) with check (is_org_member(organization_id));

-- =========================================================
-- Création automatique de la membership "owner" à la création d'un organisme
-- =========================================================
create or replace function handle_new_organization() returns trigger as $$
begin
  insert into memberships (organization_id, user_id, role)
  values (new.id, new.owner_user_id, 'owner');
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_new_organization after insert on organizations
  for each row execute function handle_new_organization();
