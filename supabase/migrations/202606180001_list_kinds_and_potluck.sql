alter table public.wishlists
add column if not exists list_kind text not null default 'gift';

update public.wishlists
set list_kind = 'gift'
where list_kind is null or list_kind not in ('gift', 'potluck');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'wishlists_list_kind_check'
      and conrelid = 'public.wishlists'::regclass
  ) then
    alter table public.wishlists
    add constraint wishlists_list_kind_check
    check (list_kind in ('gift', 'potluck'));
  end if;
end;
$$;

alter table public.gifts
add column if not exists quantity_required integer not null default 1;

update public.gifts
set quantity_required = 1
where quantity_required is null or quantity_required < 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'gifts_quantity_required_check'
      and conrelid = 'public.gifts'::regclass
  ) then
    alter table public.gifts
    add constraint gifts_quantity_required_check
    check (quantity_required between 1 and 99);
  end if;
end;
$$;

alter table public.reservations
drop constraint if exists reservations_gift_id_key;

create index if not exists reservations_gift_id_idx
on public.reservations(gift_id);

create or replace function public.get_public_wishlist(slug_or_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  payload jsonb;
begin
  select jsonb_build_object(
    'id', w.id,
    'publicSlug', w.public_slug,
    'listKind', w.list_kind,
    'title', w.title,
    'eventDate', coalesce(w.event_date::text, ''),
    'eventType', w.event_type,
    'ownerName', w.owner_name,
    'message', w.message,
    'options', jsonb_build_object(
      'categories', w.gift_categories,
      'priceRanges', w.price_ranges
    ),
    'createdAt', w.created_at,
    'updatedAt', w.updated_at,
    'gifts', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', g.id,
          'name', g.name,
          'link', g.product_url,
          'note', g.note,
          'category', g.category,
          'priceRange', g.price_range,
          'imageUrl', g.image_url,
          'hasDiscount', g.has_discount,
          'priority', g.priority,
          'quantity', greatest(g.quantity_required, 1),
          'reservedCount', coalesce(reservation_counts.reserved_count, 0),
          'reserved', coalesce(reservation_counts.reserved_count, 0) >= greatest(g.quantity_required, 1),
          'reservedBy', coalesce(reservation_counts.reserved_by, ''),
          'reservedContact', '',
          'reservations', coalesce(reservation_counts.reservations, '[]'::jsonb),
          'createdAt', g.created_at,
          'updatedAt', g.updated_at,
          'reservedAt', coalesce(reservation_counts.last_reserved_at::text, '')
        )
        order by g.sort_order, g.created_at
      ) filter (where g.id is not null),
      '[]'::jsonb
    )
  )
  into payload
  from public.wishlists w
  left join public.gifts g on g.wishlist_id = w.id
  left join lateral (
    select
      count(*)::int as reserved_count,
      string_agg(r.guest_name, ', ' order by r.created_at) as reserved_by,
      max(r.created_at) as last_reserved_at,
      jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'guestName', r.guest_name,
          'guestContact', '',
          'createdAt', r.created_at
        )
        order by r.created_at
      ) as reservations
    from public.reservations r
    where r.gift_id = g.id
  ) reservation_counts on true
  where w.is_public = true
    and (
      w.public_slug = slug_or_id
      or w.id::text = slug_or_id
    )
  group by w.id;

  return payload;
end;
$$;

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
  target_quantity integer;
  current_reservations integer;
  inserted_id uuid;
begin
  if trim(coalesce(guest_name, '')) = '' then
    return jsonb_build_object('ok', false, 'reason', 'guest_required');
  end if;

  select w.id, g.name, greatest(g.quantity_required, 1)
  into target_wishlist_id, target_gift_name, target_quantity
  from public.wishlists w
  join public.gifts g on g.wishlist_id = w.id
  where w.is_public = true
    and g.id = target_gift_id
    and (
      w.public_slug = slug_or_id
      or w.id::text = slug_or_id
    )
  for update of g;

  if target_wishlist_id is null then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  select count(*)::int
  into current_reservations
  from public.reservations
  where gift_id = target_gift_id;

  if current_reservations >= target_quantity then
    return jsonb_build_object('ok', false, 'reason', 'already_reserved');
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
  returning id into inserted_id;

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

grant execute on function public.get_public_wishlist(text) to anon, authenticated;
grant execute on function public.reserve_public_gift(text, uuid, text, text)
to anon, authenticated;
