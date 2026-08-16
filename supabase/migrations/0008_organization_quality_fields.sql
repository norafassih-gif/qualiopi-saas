-- Champs organisme complémentaires nécessaires aux 15 documents transverses
-- (critères 4 à 7 : ressources, veille, handicap, sous-traitants, partenaires,
-- réclamations, amélioration continue). Deux familles :
--  - métadonnées procédurales avec une valeur par défaut raisonnable et
--    modifiable (version de procédure, durées d'archivage, cibles qualité...) ;
--  - contacts personnels sans valeur par défaut (référents administratif,
--    emails/téléphones) : restent NULL tant que l'utilisateur ne les a pas
--    renseignés, et le moteur de documents affiche alors un repère visible
--    "[à compléter]" plutôt qu'une donnée inventée.

alter table organizations
  -- Référent administratif (absent du schéma initial, qui n'avait que
  -- pédagogique/qualité/handicap)
  add column if not exists administrative_referent text,
  add column if not exists administrative_referent_email text,
  add column if not exists administrative_referent_phone text,
  add column if not exists pedagogical_referent_email text,
  add column if not exists pedagogical_referent_phone text,
  add column if not exists disability_referent_email text,
  add column if not exists disability_referent_phone text,

  -- Contexte administratif
  add column if not exists organization_city text,
  add column if not exists region text,
  add column if not exists is_sole_practitioner boolean not null default true,
  add column if not exists jurisdiction text not null default 'Tribunal de Commerce du lieu du siège social',

  -- Emails dédiés (par défaut = email principal de l'organisme, personnalisables)
  add column if not exists complaints_email text,
  add column if not exists dpo_contact_email text,

  -- Métadonnées procédurales (valeurs par défaut usuelles, modifiables)
  add column if not exists procedure_version text not null default '1.0',
  add column if not exists archiving_duration text not null default '5 ans',
  add column if not exists archiving_duration_trainer_docs text not null default '5 ans après la fin de la collaboration',
  add column if not exists watch_collect_frequency text not null default 'mensuelle',
  add column if not exists watch_review_frequency text not null default 'semestrielle',
  add column if not exists insertion_survey_delay text not null default '6 mois après la fin de la formation',
  add column if not exists training_budget_percent_payroll text not null default '2 %',
  add column if not exists plan_period text not null default '2026-2027',

  -- Cibles qualité (indicateur 30-32, tableau de bord amélioration continue)
  add column if not exists satisfaction_rate_target text not null default '90 %',
  add column if not exists trainer_satisfaction_rate_target text not null default '90 %',
  add column if not exists partner_satisfaction_rate_target text not null default '85 %',
  add column if not exists success_rate_target text not null default '80 %',
  add column if not exists insertion_rate_target_6months text not null default '60 %',

  -- Délais de relance anti-abandon (indicateur 12)
  add column if not exists absence_relance_delay_1 text not null default 'H+30',
  add column if not exists absence_relance_delay_2 text not null default 'H+90',
  add column if not exists absence_relance_delay_3 text not null default 'J+1',

  -- Intervenant externe / prestataire technique (transverses, pas liés à une
  -- formation précise — utilisés par défaut dans l'organigramme)
  add column if not exists external_trainer_discipline text,
  add column if not exists external_trainer_name text,
  add column if not exists external_trainer_contract_type text,
  add column if not exists technical_provider_name text,
  add column if not exists technical_provider_company text;
