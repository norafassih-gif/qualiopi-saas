-- Cachet d'entreprise + signature électronique, demandés par Nora en
-- complément de l'identité visuelle (Phase 11) : certains documents
-- contractuels/officiels du dossier Qualiopi (convention, contrat,
-- attestation...) attendent un cachet et une signature. Élargit aussi la
-- liste de polices disponibles de 6 à 15 (Nora a demandé "une quinzaine" de
-- choix — cf. lib/engine/branding-fonts.ts pour la liste complète).

alter table organizations
  add column stamp_url text,
  add column signature_url text;

alter table organizations drop constraint organizations_font_family_check;
alter table organizations add constraint organizations_font_family_check
  check (font_family in (
    'helvetica', 'times', 'georgia',
    'montserrat', 'lato', 'merriweather', 'poppins', 'roboto', 'opensans',
    'raleway', 'playfair', 'worksans', 'nunito', 'sourcesans', 'ptserif'
  ));

-- Mêmes principes que le bucket org-logos (migration 0028_identite_visuelle.sql) :
-- lecture publique nécessaire pour que Chromium headless charge l'image au
-- moment du rendu PDF, écriture restreinte au propriétaire de l'organisme.

insert into storage.buckets (id, name, public) values
('org-stamps', 'org-stamps', true),
('org-signatures', 'org-signatures', true)
on conflict (id) do nothing;

create policy "org_stamps_read_public" on storage.objects
for select using (bucket_id = 'org-stamps');

create policy "org_stamps_insert_own" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'org-stamps'
  and exists (
    select 1 from organizations o
    where o.owner_user_id = auth.uid()
      and o.id::text = (storage.foldername(name))[1]
  )
);

create policy "org_stamps_update_own" on storage.objects
for update to authenticated
using (
  bucket_id = 'org-stamps'
  and exists (
    select 1 from organizations o
    where o.owner_user_id = auth.uid()
      and o.id::text = (storage.foldername(name))[1]
  )
);

create policy "org_stamps_delete_own" on storage.objects
for delete to authenticated
using (
  bucket_id = 'org-stamps'
  and exists (
    select 1 from organizations o
    where o.owner_user_id = auth.uid()
      and o.id::text = (storage.foldername(name))[1]
  )
);

create policy "org_signatures_read_public" on storage.objects
for select using (bucket_id = 'org-signatures');

create policy "org_signatures_insert_own" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'org-signatures'
  and exists (
    select 1 from organizations o
    where o.owner_user_id = auth.uid()
      and o.id::text = (storage.foldername(name))[1]
  )
);

create policy "org_signatures_update_own" on storage.objects
for update to authenticated
using (
  bucket_id = 'org-signatures'
  and exists (
    select 1 from organizations o
    where o.owner_user_id = auth.uid()
      and o.id::text = (storage.foldername(name))[1]
  )
);

create policy "org_signatures_delete_own" on storage.objects
for delete to authenticated
using (
  bucket_id = 'org-signatures'
  and exists (
    select 1 from organizations o
    where o.owner_user_id = auth.uid()
      and o.id::text = (storage.foldername(name))[1]
  )
);
