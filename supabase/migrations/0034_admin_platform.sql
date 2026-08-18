-- Migration 0034 : back-office admin (point "ADMINISTRATION" de la
-- conception initiale) — permet à Nora d'ajouter/modifier du contenu
-- (blocs de texte, catégories, modules, questions, règles, modèles de
-- document) sans passer par le code / les migrations SQL manuelles.
--
-- Toutes les tables concernées (content_blocks, training_categories,
-- modules, questions, answer_options, rules, document_templates,
-- document_template_sections) sont des tables RÉFÉRENTIELLES GLOBALES,
-- partagées par tous les organismes de la plateforme (pas de organization_id)
-- — donc distinctes des données propres à un organisme. Elles étaient
-- jusqu'ici en lecture seule pour tout utilisateur authentifié
-- ("referentiel_read_all") et en écriture uniquement via le rôle service
-- (migrations SQL). Ce nouveau statut "administrateur plateforme" (distinct
-- du rôle "owner" d'un organisme, cf. memberships) autorise l'écriture sur
-- ces tables, sans jamais retirer l'accès en lecture existant pour tous.

create table platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table platform_admins enable row level security;

-- Un utilisateur ne peut vérifier que son propre statut (nécessaire pour le
-- garde-fou côté application) — jamais la liste complète des admins.
create policy "platform_admins_select_self" on platform_admins for select
  using (user_id = auth.uid());

create or replace function is_platform_admin() returns boolean as $$
  select exists (select 1 from platform_admins where user_id = auth.uid());
$$ language sql stable security definer;

-- Nora elle-même, ses deux comptes de test actuels (LITTLE CREATRICE et
-- PIVOT FORMATION) — seule administratrice de la plateforme pour l'instant.
insert into platform_admins (user_id) values
  ('e403485c-b256-41c1-9acc-27f6e46a12aa'),
  ('099c2e33-b71a-485a-b735-19de8289ef70');

create policy "content_blocks_admin_write" on content_blocks for all
  using (is_platform_admin()) with check (is_platform_admin());
create policy "training_categories_admin_write" on training_categories for all
  using (is_platform_admin()) with check (is_platform_admin());
create policy "modules_admin_write" on modules for all
  using (is_platform_admin()) with check (is_platform_admin());
create policy "questions_admin_write" on questions for all
  using (is_platform_admin()) with check (is_platform_admin());
create policy "answer_options_admin_write" on answer_options for all
  using (is_platform_admin()) with check (is_platform_admin());
create policy "rules_admin_write" on rules for all
  using (is_platform_admin()) with check (is_platform_admin());
create policy "document_templates_admin_write" on document_templates for all
  using (is_platform_admin()) with check (is_platform_admin());
create policy "document_template_sections_admin_write" on document_template_sections for all
  using (is_platform_admin()) with check (is_platform_admin());
