-- Bucket publico para fotos de presentes. Leitura publica (convidados);
-- escrita e exclusao apenas na pasta do proprio usuario: {user_id}/{list_id}/{arquivo}.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gift-images',
  'gift-images',
  true,
  2097152,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "gift_images_owner_insert" on storage.objects;
create policy "gift_images_owner_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'gift-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "gift_images_owner_update" on storage.objects;
create policy "gift_images_owner_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'gift-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "gift_images_owner_delete" on storage.objects;
create policy "gift_images_owner_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'gift-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
