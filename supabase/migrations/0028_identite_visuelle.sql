-- Identité visuelle des documents PDF (logo + couleurs + police), demandée
-- par Nora comme socle technique de son offre "personnalisée" (par
-- opposition à l'offre "basique") — cf. claude/roadmap-produit-et-tarifs.md.
--
-- `logo_url`, `brand_color_primary` et `brand_color_secondary` existent déjà
-- sur `organizations` depuis la toute première migration (0001_init.sql) et
-- sont même déjà utilisés par lib/engine/document-builder.ts (wrapDocument)
-- pour colorer les titres des PDF — mais AUCUN écran ne permettait jusqu'ici
-- de les renseigner, et le logo n'était jamais affiché dans le document.
-- Cette migration :
--   1. Ajoute `font_family` (police choisie parmi une liste fermée définie
--      dans lib/engine/branding-fonts.ts — pas de saisie libre, pour garantir
--      un rendu PDF fiable).
--   2. Crée un bucket Supabase Storage public `org-logos` pour héberger les
--      logos téléversés par les organismes (chemin : `<organization_id>/logo.<ext>`),
--      avec des politiques RLS restreignant l'écriture au propriétaire de
--      l'organisme concerné (lecture publique nécessaire : le logo doit être
--      accessible par Chromium headless au moment du rendu PDF).

alter table organizations
  add column font_family text not null default 'helvetica'
  check (font_family in ('helvetica', 'times', 'montserrat', 'lato', 'merriweather', 'poppins'));

insert into storage.buckets (id, name, public)
values ('org-logos', 'org-logos', true)
on conflict (id) do nothing;

create policy "org_logos_read_public" on storage.objects
for select using (bucket_id = 'org-logos');

create policy "org_logos_insert_own" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'org-logos'
  and exists (
    select 1 from organizations o
    where o.owner_user_id = auth.uid()
      and o.id::text = (storage.foldername(name))[1]
  )
);

create policy "org_logos_update_own" on storage.objects
for update to authenticated
using (
  bucket_id = 'org-logos'
  and exists (
    select 1 from organizations o
    where o.owner_user_id = auth.uid()
      and o.id::text = (storage.foldername(name))[1]
  )
);

create policy "org_logos_delete_own" on storage.objects
for delete to authenticated
using (
  bucket_id = 'org-logos'
  and exists (
    select 1 from organizations o
    where o.owner_user_id = auth.uid()
      and o.id::text = (storage.foldername(name))[1]
  )
);
