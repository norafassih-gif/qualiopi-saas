-- Corrige un vrai bug RLS découvert en Phase 21 : la toute première tentative
-- de paiement d'un nouveau client (via startCheckout, Phase 20) échouait avec
-- "new row violates row-level security policy for table organizations".
--
-- Cause : org_insert_self autorise bien l'INSERT (owner_user_id = auth.uid()),
-- mais Supabase (PostgREST) fait un "INSERT ... RETURNING *" pour renvoyer la
-- ligne créée — et la policy SELECT existante (org_select_member) exige une
-- ligne dans memberships, elle-même créée par un trigger AFTER INSERT
-- (trg_new_organization, migration 0001). Selon le timing exact de la
-- RETURNING vis-à-vis du trigger, ce tout premier retour peut échouer alors
-- même que l'INSERT a réussi et que le trigger a bien tourné juste après —
-- probablement jamais remarqué avant Phase 20 car aucun vrai nouveau client
-- n'était encore passé par ce chemin d'insertion applicatif (les organismes
-- de test de Nora avaient été créés directement en SQL).
--
-- Correction : le propriétaire d'un organisme (owner_user_id = auth.uid())
-- doit de toute façon toujours pouvoir voir SON PROPRE organisme, sans
-- dépendre de la table memberships — on ajoute cette condition directement
-- sur organizations, en plus (pas à la place) de la condition memberships
-- déjà en place pour les collaborateurs invités.
drop policy if exists "org_select_member" on organizations;
create policy "org_select_member" on organizations for select
  using (
    owner_user_id = auth.uid()
    or exists (select 1 from memberships m where m.organization_id = organizations.id and m.user_id = auth.uid())
  );
