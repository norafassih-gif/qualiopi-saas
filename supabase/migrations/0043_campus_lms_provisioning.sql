-- Migration 0043 : provisioning automatique d'un compte sur le LMS externe
-- de Nora (campus.pivotformation.com, application Firebase distincte) pour
-- les clients de la formule "3 — Tout compris + LMS" — demande de Nora
-- (24/08/2026) : "il faudra ensuite linker mon LMS [...] pour le forfait qui
-- est avec LMS", clarifiée ensuite en "création de compte automatique"
-- (pas un simple lien, pas de SSO complet).
--
-- Ces colonnes vivent sur `organizations` (pas organization_billing) : ce
-- sont des données d'intégration propres à l'organisme, pas des données de
-- facturation sensibles — même lecture/écriture que le reste du profil
-- organisme (le client peut les lire, seul le serveur les écrit via le
-- webhook Stripe/service_role).
alter table organizations
  add column campus_org_id text,
  add column campus_setup_link text,
  add column campus_account_created_at timestamptz;

comment on column organizations.campus_org_id is
  'Identifiant (slug) de l''organisme créé côté Campus Pivot Formation (Firebase/Firestore, collection "organisations") — renseigné automatiquement par lib/integrations/campus-lms.ts au premier paiement de la formule tout_compris.';
comment on column organizations.campus_setup_link is
  'Lien Firebase "définir votre mot de passe" à usage unique, affiché au client sur son tableau de bord pour activer son compte LMS — pas d''envoi d''email automatique en V1 (aucun fournisseur email transactionnel configuré), le client clique depuis Qualiopi Pilote.';
comment on column organizations.campus_account_created_at is
  'Date de création du compte Campus, pour ne pas re-déclencher le provisioning à chaque webhook Stripe rejoué (idempotence côté Qualiopi Pilote, en plus de l''idempotence par email côté Cloud Function elle-même).';
