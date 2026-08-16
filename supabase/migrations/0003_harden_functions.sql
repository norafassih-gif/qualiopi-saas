-- Durcissement suite aux avertissements du linter Supabase (search_path mutable,
-- fonctions SECURITY DEFINER exécutables par anon/authenticated alors qu'elles ne
-- doivent être appelées que par un trigger ou en interne par les policies RLS).

alter function set_updated_at() set search_path = public;
alter function is_org_member(uuid) set search_path = public;
alter function handle_new_organization() set search_path = public;

-- handle_new_organization ne doit jamais être appelée directement en RPC (uniquement par le trigger) :
revoke execute on function handle_new_organization() from public, anon, authenticated;

-- is_org_member est utilisée à l'intérieur des policies RLS (rôle authenticated) :
-- on retire uniquement l'accès direct pour anon (aucun intérêt, aucune ligne visible de toute façon).
revoke execute on function is_org_member(uuid) from anon;
