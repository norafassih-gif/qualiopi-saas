-- Migration 0032 : table dédiée aux sous-traitants / partenaires
-- entreprise, pour auto-compléter le Contrat de sous-traitance
-- (contrat_sous_traitance, migration 0021) et la Convention de partenariat
-- (convention_partenariat, migration 0022), qui jusqu'ici laissaient tous
-- ces champs en blancs à remplir à la main (………………).
--
-- Un seul type de "tiers" avec un discriminant partner_type, plutôt que deux
-- tables séparées : les deux documents partagent en réalité les mêmes
-- champs d'identité (nom, SIRET, adresse, contact), seuls quelques champs
-- diffèrent selon le type (taux horaire côté sous-traitant, tuteur référent
-- côté partenaire) et restent simplement vides pour l'autre type.

create table partners (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  partner_type text not null check (partner_type in ('sous_traitant', 'partenaire')),

  full_name text not null,
  siret text,
  address text,
  contact_email text,
  contact_phone text,

  -- Convention de partenariat : représentant légal de l'entreprise partenaire
  -- et tuteur référent en charge de l'accueil (cf. sections 1 et 2 du modèle).
  legal_representative_name text,
  legal_representative_role text,
  tutor_name text,
  tutor_role text,
  tutor_email text,
  tutor_phone text,

  -- Contrat de sous-traitance : rémunération horaire (Article 5).
  hourly_rate numeric,

  -- Commun aux deux documents : durée de la mission (Article 3 / section 1)
  -- et détail du public/de la mission concernée.
  mission_start_date date,
  mission_end_date date,
  mission_details text,

  created_at timestamptz not null default now()
);

create index partners_org_type_idx on partners(organization_id, partner_type);

alter table partners enable row level security;

create policy "partners_all_member" on partners for all
  using (is_org_member(organization_id)) with check (is_org_member(organization_id));
