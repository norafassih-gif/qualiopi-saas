-- Phase 14 : stockage des PDF déjà générés, pour alimenter le futur "Pack
-- documentaire" (ZIP organisé, cf. conception initiale — "TÉLÉCHARGER MON
-- DOSSIER"). Jusqu'ici, la colonne documents.pdf_url existait depuis
-- 0001_init.sql mais n'était jamais alimentée : chaque PDF était généré à la
-- volée et streamé directement à l'utilisateur, sans copie conservée. On
-- garde ce comportement (génération à la volée reste la source de vérité,
-- toujours à jour avec les dernières infos de l'organisme) et on ajoute EN
-- PLUS une copie dans Supabase Storage à chaque génération, pour permettre
-- de construire un ZIP sans avoir à régénérer 40 PDF à chaque téléchargement
-- du dossier complet.
--
-- Contrairement aux buckets d'identité visuelle (org-logos/org-stamps/
-- org-signatures, publics — Chromium doit pouvoir les charger pendant le
-- rendu), ce bucket contient des documents nominatifs (bénéficiaires,
-- SIRET...) : bucket PRIVÉ, lecture restreinte au propriétaire de
-- l'organisme comme pour l'écriture (même modèle que les 3 buckets
-- précédents, adapté pour ne pas être public en lecture).

insert into storage.buckets (id, name, public)
values ('generated-documents', 'generated-documents', false)
on conflict (id) do nothing;

create policy "generated_documents_select_own" on storage.objects for select
  using (
    bucket_id = 'generated-documents'
    and exists (
      select 1 from organizations o
      where o.owner_user_id = auth.uid()
      and o.id::text = (storage.foldername(objects.name))[1]
    )
  );

create policy "generated_documents_insert_own" on storage.objects for insert
  with check (
    bucket_id = 'generated-documents'
    and exists (
      select 1 from organizations o
      where o.owner_user_id = auth.uid()
      and o.id::text = (storage.foldername(objects.name))[1]
    )
  );

create policy "generated_documents_update_own" on storage.objects for update
  using (
    bucket_id = 'generated-documents'
    and exists (
      select 1 from organizations o
      where o.owner_user_id = auth.uid()
      and o.id::text = (storage.foldername(objects.name))[1]
    )
  );

create policy "generated_documents_delete_own" on storage.objects for delete
  using (
    bucket_id = 'generated-documents'
    and exists (
      select 1 from organizations o
      where o.owner_user_id = auth.uid()
      and o.id::text = (storage.foldername(objects.name))[1]
    )
  );
