-- O Storage so apaga (remove) objetos que o usuario consegue selecionar via API.
-- Sem esta politica, a exclusao de fotos antigas retorna vazio e nada e apagado.
-- A leitura publica pela URL do bucket continua independente desta politica.
drop policy if exists "gift_images_owner_select" on storage.objects;
create policy "gift_images_owner_select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'gift-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
