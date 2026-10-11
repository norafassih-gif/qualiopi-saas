-- 0055 : saisie en ligne des questionnaires de satisfaction financeur et entreprise (indicateur 30)
create table if not exists public.stakeholder_satisfaction_responses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  session_id uuid,
  kind text not null check (kind in ('financeur','entreprise')),
  respondent_name text,
  respondent_role text,
  answered_on date not null default current_date,
  scores jsonb not null default '{}'::jsonb,
  recommande text,
  renouveler text,
  attentes text,
  commentaire_libre text,
  created_at timestamptz not null default now()
);
create index if not exists stakeholder_satisfaction_org_idx on public.stakeholder_satisfaction_responses(organization_id, kind);
alter table public.stakeholder_satisfaction_responses enable row level security;
create policy stakeholder_satisfaction_all_member on public.stakeholder_satisfaction_responses for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));

alter table public.document_template_sections drop constraint if exists document_template_sections_content_type_check;
alter table public.document_template_sections add constraint document_template_sections_content_type_check check (content_type = any (array['rich_text','variable_block','table','content_block_list','checklist','signature_block','attendance_grid','data_table','org_chart','qcm_answers','satisfaction_results','trainer_satisfaction_results','stakeholder_satisfaction_results']));

update public.document_template_sections set content_type='stakeholder_satisfaction_results', html_template=null, data_source='financeur' where document_template_id='questionnaire_satisfaction_financeur' and code='criteres';
update public.document_template_sections set content_type='stakeholder_satisfaction_results', html_template=null, data_source='entreprise' where document_template_id='questionnaire_satisfaction_entreprise' and code='criteres';
