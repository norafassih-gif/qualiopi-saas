-- Migration 0038 : nouvelle grille tarifaire (demande de Nora, 20/08/2026).
--
-- Changements de fond :
-- 1. La formule "documents_site_accompagnement" disparaît en tant qu'abonnement
--    — l'accompagnement Qualiopi devient une prestation "sur devis" (contact
--    commercial, hors Stripe pour l'instant), plus un palier d'abonnement.
-- 2. Les formules "documents_site" (75 €/mois) et "tout_compris" (129 €/mois,
--    ex "+ accompagnement" fusionné dedans) deviennent vendables dès
--    maintenant (décision explicite de Nora : vendre avant que le site/LMS
--    soient construits, cf. claude/roadmap-produit-et-tarifs.md).
-- 3. Nouvel add-on optionnel, indépendant du plan : "Logo + charte graphique"
--    (15 €/mois) — une prestation de design sur-mesure réalisée par Nora,
--    sans rapport avec la fonctionnalité gratuite d'upload de logo/couleurs
--    existante (/parametres/identite-visuelle). On stocke juste si le client
--    l'a souscrit ; aucune fonctionnalité logicielle n'en dépend pour
--    l'instant, ce n'est qu'un indicateur de facturation/suivi commercial.

-- On ne peut pas modifier un CHECK existant : il faut le supprimer et en
-- recréer un. Sécurité : on convertit d'abord toute ligne existante encore
-- sur l'ancienne formule vers "tout_compris" (le plan qui l'a absorbée) pour
-- ne jamais violer le nouveau CHECK au moment de le poser.
update organization_billing
  set plan = 'tout_compris'
  where plan = 'documents_site_accompagnement';

alter table organization_billing
  drop constraint organization_billing_plan_check;

alter table organization_billing
  add constraint organization_billing_plan_check
  check (plan in ('documents', 'documents_site', 'tout_compris'));

alter table organization_billing
  add column has_branding_addon boolean not null default false;

comment on column organization_billing.has_branding_addon is
  'Add-on payant "Logo + charte graphique" (+15 €/mois) — prestation de design sur-mesure réalisée par Nora, distincte de la fonctionnalité gratuite d''upload de logo/couleurs. Mis à jour par le webhook Stripe (checkout.session.completed) à partir des metadata de la session, jamais modifiable par le client lui-même (mêmes règles RLS que le reste de organization_billing, cf. migration 0036).';
