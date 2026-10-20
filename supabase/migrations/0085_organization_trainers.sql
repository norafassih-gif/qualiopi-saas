-- Formateurs de l'organisme (écran « Mes formateurs ») et pièce NDA
-- « Liste des formateurs » refaite sur le modèle d'un dossier accepté :
-- récapitulatif, fiche par formateur (diplômes, expérience, compétences,
-- formation continue), adéquation des compétences aux prestations,
-- sélection / suivi / développement. Rien n'est inventé : tout vient de
-- ce que le client saisit.

create table if not exists public.organization_trainers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  role text,
  is_manager boolean not null default false,
  is_subcontracted boolean not null default false,
  link_type text,
  email text,
  phone text,
  domains text,
  diplomas text,
  experience text,
  skills text,
  animation_experience text,
  continuing_training text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists organization_trainers_org_idx on public.organization_trainers (organization_id);

alter table public.organization_trainers enable row level security;
drop policy if exists organization_trainers_all_member on public.organization_trainers;
create policy organization_trainers_all_member on public.organization_trainers
  for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));

update public.document_templates
set tip = 'Récapitulatif, fiche de chaque formateur (diplômes, expérience, compétences) et adéquation aux prestations. À déposer à l''étape « Formateurs ». Renseignez d''abord « Mes formateurs ».'
where id = 'nda_liste_formateurs';

delete from public.document_template_sections where document_template_id = 'nda_liste_formateurs';

insert into public.document_template_sections
  (document_template_id, code, title, content_type, sort_order, html_template, content_block_scope, source_content_block_type)
values
('nda_liste_formateurs', 'intro', 'Objet', 'rich_text', 1,
 '<p>{{nda_trainers_intro}}</p>', 'global', null),
('nda_liste_formateurs', 'recap', '1. Récapitulatif', 'rich_text', 2,
 '<table class="register"><thead><tr><th>Nom et prénom</th><th>Fonction</th><th>Statut</th><th>Domaines d''intervention</th></tr></thead><tbody>{{nda_trainers_rows}}</tbody></table>', 'global', null),
('nda_liste_formateurs', 'fiches', '2. Fiche du formateur', 'rich_text', 3,
 '{{nda_trainer_sheets}}', 'global', null),
('nda_liste_formateurs', 'adequation', '3. Adéquation des compétences aux prestations', 'rich_text', 4,
 '<table class="register"><thead><tr><th>Action de formation</th><th>Compétences requises</th><th>Compétences détenues</th><th>Justificatif</th></tr></thead><tbody>{{nda_adequation_rows}}</tbody></table>', 'global', null),
('nda_liste_formateurs', 'suivi', '4. Sélection, suivi et développement des compétences', 'rich_text', 5,
 '<ul><li><strong>Sélection :</strong> les compétences requises pour chaque action sont identifiées en amont, puis comparées aux compétences détenues. Le tableau d''adéquation ci-dessus est mis à jour à chaque nouvelle action de formation.</li><li><strong>Suivi :</strong> les questionnaires de satisfaction des bénéficiaires et les évaluations des acquis constituent les indicateurs de suivi de la qualité de l''animation.</li><li><strong>Développement :</strong> un plan de développement des compétences est établi chaque année. Les attestations des formations suivies sont conservées.</li><li><strong>Recours à un intervenant externe :</strong> en cas de besoin, la sélection s''effectue selon la procédure de sélection et de suivi des sous-traitants, avec vérification des diplômes, de l''expérience et signature d''un contrat de sous-traitance.</li></ul>', 'global', null),
('nda_liste_formateurs', 'signature', 'Attestation', 'rich_text', 6,
 '<p>Fait à {{organization_city}}, le {{generated_date}}<br/>{{manager_name}}, pour {{company_name}}</p><p>{{org_signature_image}}{{org_stamp_image}}</p>', 'global', null);
