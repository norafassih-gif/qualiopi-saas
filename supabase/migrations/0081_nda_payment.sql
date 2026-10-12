-- Migration 0081 : paiement unique du parcours NDA (200 €, hors abonnement).
--
-- Contexte (Nora, 12/10/2026) : l'accompagnement à la déclaration d'activité
-- (NDA) se vend séparément de l'abonnement Qualiopi, en paiement unique de
-- 200 €. Un client NDA seul ne doit pas avoir besoin d'un abonnement pour
-- générer les pièces de sa déclaration.
--
-- Ces colonnes vivent dans organization_billing (et non dans organizations)
-- pour la même raison de sécurité que le reste de la facturation, cf.
-- migration 0036 : le propriétaire d'un organisme peut modifier n'importe
-- quelle colonne de sa ligne `organizations`, mais ne peut que LIRE
-- organization_billing. Seul le webhook Stripe (service_role) ou un
-- administrateur plateforme peut donc passer nda_paid à true.
--
-- Migration purement additive : aucune donnée existante n'est modifiée.

alter table organization_billing
  add column if not exists nda_paid boolean not null default false,
  add column if not exists nda_paid_at timestamptz,
  add column if not exists nda_stripe_session_id text;
