-- Migration 0015 : ajoute l'option "formation gratuite" au tarif de session.
-- Demandé par Nora : certains organismes proposent des formations gratuites
-- (financées intégralement par un tiers, actions de sensibilisation...) et
-- doivent pouvoir l'indiquer clairement sur le devis/la convention plutôt
-- que de laisser un tarif vide ou de mettre "0".

alter table sessions drop constraint sessions_price_unit_check;
alter table sessions add constraint sessions_price_unit_check
  check (price_unit in ('gratuit', 'total_ttc', 'total_ht', 'per_participant_ht', 'per_hour_ht'));
