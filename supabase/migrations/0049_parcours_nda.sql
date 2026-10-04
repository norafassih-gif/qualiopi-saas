-- Choix du parcours à l'entrée (NDA / audit initial / audit de surveillance)
-- et données du parcours guidé de déclaration d'activité (NDA).
-- Les organismes existants restent sur le parcours "audit initial" :
-- aucun changement de comportement pour eux.

alter table public.organizations
  add column if not exists current_track text not null default 'qualiopi_initial',
  add column if not exists legal_form text,
  add column if not exists nda_number text,
  add column if not exists nda_filed_on date,
  add column if not exists nda_revenue_over_threshold boolean,
  add column if not exists nda_progress jsonb not null default '{}'::jsonb;

alter table public.organizations
  add constraint organizations_current_track_check
  check (current_track in ('nda', 'qualiopi_initial', 'qualiopi_surveillance'));

alter table public.organizations
  add constraint organizations_legal_form_check
  check (legal_form is null or legal_form in (
    'micro_entreprise', 'ei', 'eurl', 'sarl', 'sasu', 'sas', 'association', 'autre'
  ));
