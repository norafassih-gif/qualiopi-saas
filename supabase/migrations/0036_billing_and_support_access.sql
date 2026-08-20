-- Migration 0036 : abonnement/facturation par organisme, blocage, et accès
-- support avec consentement du client.
--
-- Contexte (demande de Nora, 20/08/2026) : elle veut (1) une vue admin sur
-- tous les organismes clients avec leur statut d'abonnement, (2) pouvoir
-- bloquer un organisme qui n'a pas payé, (3) une page de paiement (Stripe,
-- migration technique dans une prochaine étape), (4) pouvoir consulter les
-- données d'un client pour l'aider, mais seulement après qu'il l'ait
-- autorisé via un lien ("il faut qu'ils m'autorisent").
--
-- ⚠️ CHOIX DE SÉCURITÉ IMPORTANT : les champs de facturation (statut
-- d'abonnement, is_blocked, identifiants Stripe) NE SONT PAS ajoutés
-- directement sur `organizations`. La policy RLS existante
-- "org_update_owner" (migration 0001) autorise le propriétaire d'un
-- organisme à modifier N'IMPORTE QUELLE colonne de sa propre ligne (elle n'a
-- pas de clause `with check` par colonne). Si `is_blocked` ou
-- `subscription_status` vivaient sur `organizations`, un client aurait pu se
-- débloquer ou passer son propre statut à "active" lui-même depuis le
-- navigateur, en contournant complètement le paiement. On isole donc ces
-- champs dans une table séparée `organization_billing`, lisible par le
-- propriétaire (pour afficher son statut) mais SEULEMENT modifiable par un
-- administrateur plateforme ou le service_role (le webhook Stripe utilisera
-- le service_role, qui contourne RLS de toute façon).

create table organization_billing (
  organization_id uuid primary key references organizations(id) on delete cascade,
  plan text not null default 'documents'
    check (plan in ('documents', 'documents_site', 'documents_site_accompagnement', 'tout_compris')),
  subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  stripe_customer_id text,
  stripe_subscription_id text,
  is_blocked boolean not null default false,
  blocked_at timestamptz,
  blocked_reason text,
  updated_at timestamptz not null default now()
);

create trigger trg_organization_billing_updated_at before update on organization_billing
  for each row execute function set_updated_at();

alter table organization_billing enable row level security;

-- Le client peut lire son propre statut (pour afficher "abonnement actif" /
-- une bannière de blocage sur son dashboard) mais jamais l'écrire lui-même.
create policy "billing_select_member" on organization_billing for select
  using (is_org_member(organization_id));

-- Écriture réservée à l'administrateur plateforme (bouton bloquer/débloquer
-- dans /admin/organisations). Le webhook Stripe passera par le service_role,
-- qui n'est de toute façon pas soumis à RLS.
create policy "billing_admin_write" on organization_billing for all
  using (is_platform_admin()) with check (is_platform_admin());

-- Création automatique de la ligne de facturation à la création d'un
-- organisme, sur le même principe que handle_new_organization (migration
-- 0001) pour les memberships.
create or replace function handle_new_organization_billing() returns trigger as $$
begin
  insert into organization_billing (organization_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_new_organization_billing after insert on organizations
  for each row execute function handle_new_organization_billing();

-- Rattrapage pour les organismes déjà existants avant cette migration.
insert into organization_billing (organization_id)
  select id from organizations
  on conflict (organization_id) do nothing;

-- =========================================================
-- Accès support avec consentement du client
-- =========================================================
-- Demande créée par un administrateur plateforme depuis /admin/organisations
-- ("Demander l'accès"). Le client voit une bannière sur son dashboard tant
-- que le statut est "pending" et peut approuver ou refuser. Un accès
-- approuvé expire automatiquement au bout de 30 jours (has_active_support_access
-- ci-dessous) plutôt que de rester ouvert indéfiniment.

create table support_access_grants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  requested_by uuid not null references auth.users(id),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'denied', 'revoked')),
  reason text,
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now()
);

alter table support_access_grants enable row level security;

create policy "access_grants_select" on support_access_grants for select
  using (is_org_member(organization_id) or is_platform_admin());

-- Seul un administrateur peut créer une demande.
create policy "access_grants_insert_admin" on support_access_grants for insert
  with check (is_platform_admin());

-- Le client répond à SA propre demande (approuver/refuser) ; l'admin peut
-- aussi révoquer un accès déjà approuvé.
create policy "access_grants_update" on support_access_grants for update
  using (is_org_member(organization_id) or is_platform_admin());

create or replace function has_active_support_access(org_id uuid) returns boolean as $$
  select exists (
    select 1 from support_access_grants g
    where g.organization_id = org_id
      and g.status = 'approved'
      and g.expires_at > now()
  );
$$ language sql stable security definer;

-- Lecture seule pour un admin, uniquement si un accès a été explicitement
-- approuvé et n'a pas expiré. Read-only par choix : le support consulte pour
-- diagnostiquer, il ne doit pas modifier les données d'un client à sa place.
create policy "org_select_support_access" on organizations for select
  using (is_platform_admin() and has_active_support_access(id));

create policy "trainings_select_support_access" on trainings for select
  using (is_platform_admin() and has_active_support_access(organization_id));

create policy "training_modules_select_support_access" on training_modules for select
  using (exists (
    select 1 from trainings t where t.id = training_modules.training_id
      and is_platform_admin() and has_active_support_access(t.organization_id)
  ));

create policy "training_content_blocks_select_support_access" on training_content_blocks for select
  using (exists (
    select 1 from trainings t where t.id = training_content_blocks.training_id
      and is_platform_admin() and has_active_support_access(t.organization_id)
  ));

create policy "sessions_select_support_access" on sessions for select
  using (exists (
    select 1 from trainings t where t.id = sessions.training_id
      and is_platform_admin() and has_active_support_access(t.organization_id)
  ));

create policy "beneficiaries_select_support_access" on beneficiaries for select
  using (exists (
    select 1 from sessions s join trainings t on t.id = s.training_id
    where s.id = beneficiaries.session_id
      and is_platform_admin() and has_active_support_access(t.organization_id)
  ));

create policy "documents_select_support_access" on documents for select
  using (is_platform_admin() and has_active_support_access(organization_id));

create policy "user_answers_select_support_access" on user_answers for select
  using (is_platform_admin() and has_active_support_access(organization_id));
