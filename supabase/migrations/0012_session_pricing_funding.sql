-- Migration 0012 : tarif et financement de la session
-- Nécessaire pour générer le Devis et, ensuite, la Convention / le Contrat de
-- formation (indicateur Qualiopi 1 — les tarifs font partie de l'information
-- obligatoire ; cf. claude/journal-avancement.md "Reste à faire" point 3).
-- Ces champs vivent sur `sessions` (et non `trainings`) car le tarif et le
-- mode de financement sont propres à un client/bénéficiaire donné, pas à
-- l'offre de formation elle-même (une même formation peut être vendue à des
-- tarifs ou financements différents selon le client).

alter table sessions
  add column price_amount numeric,
  add column price_unit text not null default 'total_ttc'
    check (price_unit in ('total_ttc', 'total_ht', 'per_participant_ht', 'per_hour_ht')),
  add column funding_type text
    check (funding_type in ('autofinancement', 'opco', 'pole_emploi', 'entreprise', 'region', 'cpf', 'autre')),
  add column funding_details text, -- ex. "OPCO Atlas", "Pôle Emploi Île-de-France"
  add column payment_terms text,   -- modalités de règlement (ex. "30 % à la signature, solde à réception de facture")
  add column quote_reference text,
  add column convention_reference text;

comment on column sessions.price_unit is
  'total_ttc | total_ht | per_participant_ht | per_hour_ht — détermine le libellé affiché sur le devis/la convention.';
comment on column sessions.funding_type is
  'autofinancement | opco | pole_emploi | entreprise | region | cpf | autre — pilote le choix entre Contrat (particulier autofinancé) et Convention (tiers financeur) dans /documents.';
