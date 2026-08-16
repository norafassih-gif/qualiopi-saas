-- Bug : la policy "memberships_select_own_org" se relisait elle-même
-- (sous-requête sur memberships à l'intérieur d'une policy sur memberships),
-- ce que Postgres refuse ("infinite recursion detected in policy for
-- relation memberships", code 42P17). Toute lecture d'un organisme (qui
-- passe par la policy organizations -> memberships) échouait silencieusement.
--
-- Fix standard Supabase : passer par la fonction SECURITY DEFINER
-- is_org_member(), qui contourne RLS pour sa propre lecture interne de
-- memberships et casse ainsi la boucle.

drop policy if exists "memberships_select_own_org" on memberships;

create policy "memberships_select_own_org" on memberships for select
  using (is_org_member(organization_id));
