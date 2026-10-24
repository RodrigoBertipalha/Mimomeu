# Banco de dados (Supabase / Postgres)

Projeto Supabase: **Mimo Meu** (`fzxrtoqmjlsgtoxywioj`, região us-west-2). Plano gratuito:
**pausa após inatividade**; foi pausado e retomado em 24/10/2026.

Migrations em `supabase/migrations/`, aplicadas manualmente no SQL Editor e em ordem.
Todas as 5 estão aplicadas (verificado via API em 24/10/2026).

| Migration | O que faz |
| --- | --- |
| `202606140001_initial_schema` | tabelas base, slug público, RLS, RPCs de leitura e reserva |
| `202606160001_wishlist_options` | `gift_categories` e `price_ranges` por lista |
| `202606160002_activity_and_support` | `activity_log` e tabela `support_messages` |
| `202606180001_list_kinds_and_potluck` | `list_kind`, `quantity_required`, várias reservas por item |
| `202606180002_financial_gifts` | `gift_kind`, `funding_mode`, `target_amount`, `contribution_amount` |
| `202610240001_restrict_public_reads` | remove a leitura anônima direta de `wishlists` e `gifts` |
| `202610250001_reservation_limits` | tabela `reservation_attempts`; limites de tamanho e de 5 reservas por minuto por visitante |
| `202610250002_gift_images_storage` | bucket `gift-images` e políticas de envio, atualização e exclusão na pasta do dono |
| `202610250003_gift_images_owner_select` | política de leitura na pasta do dono (o Storage exige isso para conseguir apagar) |

## Storage

Bucket público `gift-images` (até 2 MB por arquivo; WebP, JPEG ou PNG). Caminho:
`{user_id}/{list_id}/{uuid}.webp`. Qualquer pessoa lê pela URL pública; só o dono envia, lista
e apaga na própria pasta. **Importante:** sem a política de SELECT, `storage.remove()` retorna
vazio sem erro e não apaga nada.

## Tabelas

**profiles**: `id` (= auth.users.id), `display_name`. Criada por trigger no cadastro. Quase não é
usada pelo app (o nome vem de `user_metadata`).

**wishlists**: `owner_id`, `title`, `event_date`, `event_type`, `owner_name`, `message`,
`public_slug` (único, gerado por trigger: `slug-do-titulo-xxxxxxxx`), `is_public` (sempre
true, sem UI), `list_kind` (`gift` | `potluck`), `gift_categories[]`, `price_ranges[]`,
`activity_log` (jsonb).

**gifts**: `wishlist_id`, `name`, `product_url`, `note`, `category`, `price_range`,
`image_url` (base64 ou URL), `has_discount`, `priority` ('' | Baixa | Média | Alta),
`sort_order` (nunca alterado pelo app), `quantity_required` (1–99), `gift_kind`
(`physical` | `financial`), `funding_mode` (`full` | `shared`), `target_amount`.

**reservations**: `wishlist_id`, `gift_id`, `guest_name`, `guest_contact`,
`contribution_amount`. Várias por presente (a constraint unique foi removida).

**reservation_attempts**: `client_hash` (SHA-256 do IP do visitante; o IP em texto não é
gravado), `created_at`. Uma linha por reserva bem-sucedida; linhas com mais de 1 hora são
apagadas pela própria RPC. Sem políticas RLS: só a RPC acessa.

**support_messages**: `topic` (problem | story | idea), `topic_title`, `sender_name`,
`sender_contact`, `message` (10–700 caracteres), `user_id`. Só tem política de INSERT,
então só se lê pelo painel do Supabase.

## RLS (resumo)

- Dono (`auth.uid() = owner_id`) faz tudo nas próprias listas, presentes e reservas
  (reservas: só select e delete).
- Até a migration `202610240001`, `anon` podia dar SELECT direto em `wishlists` e `gifts` e
  listar todas as listas de todos os usuários. Depois dela, convidados só leem pela RPC.
- Exclusões: o dono pode apagar listas e presentes; reservas e presentes saem em cascata.
- `reservations` não é legível por anon, então o contato do convidado fica protegido.

## Funções RPC (security definer)

- `get_public_wishlist(slug_or_id)`: devolve a lista + presentes + reservas (sem contato)
  em JSON camelCase. Aceita slug **ou** id.
- `reserve_public_gift(slug_or_id, target_gift_id, guest_name, guest_contact, contribution_amount)`:
  trava a linha do presente (`for update`) e valida:
  - físico: `reservas < quantity_required`;
  - financeiro: meta > 0, ainda não completa; `full` grava o restante inteiro, `shared` grava
    `min(valor, restante)`.
  Antes disso valida nome (até 80 caracteres), contato (até 120) e o limite de 5 reservas por
  minuto por visitante (IP vindo dos cabeçalhos `cf-connecting-ip` / `x-forwarded-for`).
  Depois insere a reserva e adiciona um item no `activity_log`. Retorna `{ok, reason}` com
  reason `guest_required` | `guest_too_long` | `contact_too_long` | `rate_limited` |
  `not_found` | `already_reserved` | `invalid_amount`.
  Existe também uma versão com 4 argumentos, que chama a de 5 com valor 0.

## Triggers

`touch_updated_at` (profiles, wishlists, gifts), `set_wishlist_public_slug` (insert em
wishlists), `create_profile_for_new_user` (insert em auth.users).
