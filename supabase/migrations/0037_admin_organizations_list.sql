-- Migration 0037 : permet à un administrateur plateforme de voir la liste de
-- TOUS les organismes clients (nom, email, date de création...) — nécessaire
-- pour le nouveau tableau de bord admin /admin/organisations (demande de
-- Nora : "il me faut savoir combien j'ai de clients").
--
-- Distinct de l'accès support (migration 0036, has_active_support_access) :
-- ici on ne parle que de l'identité de base de l'organisme (le minimum pour
-- gérer la relation client/facturation), pas des données opérationnelles
-- (formations, sessions, documents des bénéficiaires...) qui restent
-- protégées par le consentement explicite du client.
create policy "org_select_admin" on organizations for select
  using (is_platform_admin());
