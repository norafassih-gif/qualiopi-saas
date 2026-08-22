-- Migration 0041 : add-on "document personnalisé" (+5 €/mois, demande de
-- Nora du 24/08/2026 — distinct et cumulable avec l'add-on "Logo + charte
-- graphique" existant, +18 €/mois, migration 0038).
--
-- Différence entre les deux add-ons (clarifiée par Nora) :
-- - +5 €/mois "document personnalisé" : le client télécharge lui-même son
--   propre logo et choisit ses couleurs (fonctionnalité déjà gratuite sur
--   /parametres/identite-visuelle) et débloque en plus, sur le PDF généré,
--   la date automatique, l'émargement en ligne, le cachet et la signature
--   électronique — proposé sur les 3 formules, tous concernés par la
--   génération de documents.
-- - +18 €/mois "Logo + charte graphique" : une vraie prestation de design
--   sur-mesure réalisée par l'équipe de Nora (inchangé, migration 0038).
--
-- Les deux colonnes sont indépendantes et peuvent valoir true en même temps.
alter table organization_billing
  add column has_personalization_addon boolean not null default false;

comment on column organization_billing.has_personalization_addon is
  'Add-on payant "document personnalisé" (+5 €/mois) — date automatique, émargement en ligne, cachet et signature électronique sur les PDF générés. Distinct et cumulable avec has_branding_addon (+18 €/mois, prestation de design sur-mesure). Mis à jour par le webhook Stripe (checkout.session.completed) à partir des metadata de la session, jamais modifiable par le client lui-même (mêmes règles RLS que le reste de organization_billing, cf. migration 0036).';
