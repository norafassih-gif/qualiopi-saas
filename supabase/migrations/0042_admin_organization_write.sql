-- Migration 0042 : permet à un administrateur plateforme de modifier
-- directement les organismes clients (coordonnées : nom, nom commercial,
-- email, SIRET, téléphone) — demande explicite de Nora (24/08/2026) :
-- "il faut que j'aie un accès admin [...] pouvoir faire des modifications
-- manuelles [...] modifier ses coordonnées (email, nom d'organisme...)".
--
-- org_select_admin (migration 0037) ouvrait déjà la LECTURE de toutes les
-- organisations à un administrateur plateforme ; il manquait l'écriture.
-- Sans cette policy, un admin connecté en tant que lui-même (RLS actif,
-- pas de service_role) ne peut PAS modifier la ligne `organizations` d'un
-- autre client : la seule policy update existante (`org_update_owner`,
-- migration 0001) exige `owner_user_id = auth.uid()`.
--
-- (organization_billing, elle, a déjà une policy admin complète —
-- "billing_admin_write", migration 0036 — donc le changement de formule et
-- l'activation/désactivation manuelle d'un add-on fonctionnent déjà sans
-- migration supplémentaire.)
create policy "org_update_admin" on organizations for update
  using (is_platform_admin()) with check (is_platform_admin());
