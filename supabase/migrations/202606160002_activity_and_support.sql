alter table public.wishlists
add column if not exists activity_log jsonb not null default '[]'::jsonb;

update public.wishlists
set activity_log = jsonb_build_array(
  jsonb_build_object(
    'id', 'activity-created-' || id::text,
    'type', 'list_created',
    'message', 'Lista criada.',
    'createdAt', created_at
  )
)
where activity_log = '[]'::jsonb;

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  topic_title text not null default '',
  sender_name text not null default '',
  sender_contact text not null default '',
  message text not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint support_messages_topic_check check (
    topic in ('problem', 'story', 'idea')
  ),
  constraint support_messages_message_length_check check (
    char_length(trim(message)) between 10 and 700
  )
);

create index if not exists support_messages_created_at_idx
on public.support_messages(created_at desc);

create index if not exists support_messages_user_id_idx
on public.support_messages(user_id);

alter table public.support_messages enable row level security;

drop policy if exists "support_messages_insert" on public.support_messages;
create policy "support_messages_insert"
on public.support_messages for insert
to anon, authenticated
with check (
  topic in ('problem', 'story', 'idea')
  and char_length(trim(message)) between 10 and 700
  and (user_id is null or auth.uid() = user_id)
);

create or replace function public.reserve_public_gift(
  slug_or_id text,
  target_gift_id uuid,
  guest_name text,
  guest_contact text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_wishlist_id uuid;
  target_gift_name text;
  inserted_id uuid;
begin
  if trim(coalesce(guest_name, '')) = '' then
    return jsonb_build_object('ok', false, 'reason', 'guest_required');
  end if;

  select w.id, g.name
  into target_wishlist_id, target_gift_name
  from public.wishlists w
  join public.gifts g on g.wishlist_id = w.id
  where w.is_public = true
    and g.id = target_gift_id
    and (
      w.public_slug = slug_or_id
      or w.id::text = slug_or_id
    );

  if target_wishlist_id is null then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  insert into public.reservations (
    wishlist_id,
    gift_id,
    guest_name,
    guest_contact
  )
  values (
    target_wishlist_id,
    target_gift_id,
    trim(guest_name),
    trim(coalesce(guest_contact, ''))
  )
  on conflict (gift_id) do nothing
  returning id into inserted_id;

  if inserted_id is null then
    return jsonb_build_object('ok', false, 'reason', 'already_reserved');
  end if;

  update public.wishlists
  set activity_log = jsonb_build_array(
    jsonb_build_object(
      'id', 'activity-' || replace(gen_random_uuid()::text, '-', ''),
      'type', 'gift_reserved',
      'message', trim(guest_name) || ' reservou "' || target_gift_name || '".',
      'createdAt', now(),
      'giftId', target_gift_id,
      'giftName', target_gift_name,
      'actor', trim(guest_name)
    )
  ) || coalesce(activity_log, '[]'::jsonb)
  where id = target_wishlist_id;

  return jsonb_build_object('ok', true, 'reservationId', inserted_id);
end;
$$;

grant execute on function public.reserve_public_gift(text, uuid, text, text)
to anon, authenticated;
