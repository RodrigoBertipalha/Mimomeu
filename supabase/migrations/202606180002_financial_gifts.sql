alter table public.gifts
add column if not exists gift_kind text not null default 'physical',
add column if not exists funding_mode text not null default 'full',
add column if not exists target_amount numeric(12, 2) not null default 0;

update public.gifts
set
  gift_kind = coalesce(nullif(gift_kind, ''), 'physical'),
  funding_mode = coalesce(nullif(funding_mode, ''), 'full'),
  target_amount = greatest(coalesce(target_amount, 0), 0);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'gifts_gift_kind_check'
      and conrelid = 'public.gifts'::regclass
  ) then
    alter table public.gifts
    add constraint gifts_gift_kind_check
    check (gift_kind in ('physical', 'financial'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'gifts_funding_mode_check'
      and conrelid = 'public.gifts'::regclass
  ) then
    alter table public.gifts
    add constraint gifts_funding_mode_check
    check (funding_mode in ('full', 'shared'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'gifts_target_amount_check'
      and conrelid = 'public.gifts'::regclass
  ) then
    alter table public.gifts
    add constraint gifts_target_amount_check
    check (target_amount >= 0);
  end if;
end;
$$;

alter table public.reservations
add column if not exists contribution_amount numeric(12, 2) not null default 0;

update public.reservations
set contribution_amount = greatest(coalesce(contribution_amount, 0), 0);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reservations_contribution_amount_check'
      and conrelid = 'public.reservations'::regclass
  ) then
    alter table public.reservations
    add constraint reservations_contribution_amount_check
    check (contribution_amount >= 0);
  end if;
end;
$$;

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
          'giftKind', g.gift_kind,
          'fundingMode', g.funding_mode,
          'targetAmount', g.target_amount,
          'contributedAmount', coalesce(reservation_counts.contributed_amount, 0),
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
          'reserved',
            case
              when g.gift_kind = 'financial' then
                g.target_amount > 0
                and coalesce(reservation_counts.contributed_amount, 0) >= g.target_amount
              else
                coalesce(reservation_counts.reserved_count, 0) >= greatest(g.quantity_required, 1)
            end,
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
      coalesce(sum(r.contribution_amount), 0) as contributed_amount,
      string_agg(r.guest_name, ', ' order by r.created_at) as reserved_by,
      max(r.created_at) as last_reserved_at,
      jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'guestName', r.guest_name,
          'guestContact', '',
          'contributionAmount', r.contribution_amount,
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
  guest_contact text,
  contribution_amount numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_wishlist_id uuid;
  target_gift_name text;
  target_gift_kind text;
  target_funding_mode text;
  target_quantity integer;
  target_amount numeric;
  current_reservations integer;
  current_contribution numeric;
  next_contribution numeric;
  inserted_id uuid;
begin
  if trim(coalesce(guest_name, '')) = '' then
    return jsonb_build_object('ok', false, 'reason', 'guest_required');
  end if;

  select
    w.id,
    g.name,
    g.gift_kind,
    g.funding_mode,
    greatest(g.quantity_required, 1),
    greatest(g.target_amount, 0)
  into
    target_wishlist_id,
    target_gift_name,
    target_gift_kind,
    target_funding_mode,
    target_quantity,
    target_amount
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

  select count(*)::int, coalesce(sum(r.contribution_amount), 0)
  into current_reservations, current_contribution
  from public.reservations r
  where r.gift_id = target_gift_id;

  if target_gift_kind = 'financial' then
    if target_amount <= 0 then
      return jsonb_build_object('ok', false, 'reason', 'invalid_amount');
    end if;

    if current_contribution >= target_amount then
      return jsonb_build_object('ok', false, 'reason', 'already_reserved');
    end if;

    next_contribution :=
      case
        when target_funding_mode = 'shared' then
          least(greatest(coalesce(contribution_amount, 0), 0), target_amount - current_contribution)
        else
          target_amount - current_contribution
      end;

    if next_contribution <= 0 then
      return jsonb_build_object('ok', false, 'reason', 'invalid_amount');
    end if;
  else
    if current_reservations >= target_quantity then
      return jsonb_build_object('ok', false, 'reason', 'already_reserved');
    end if;

    next_contribution := 0;
  end if;

  insert into public.reservations (
    wishlist_id,
    gift_id,
    guest_name,
    guest_contact,
    contribution_amount
  )
  values (
    target_wishlist_id,
    target_gift_id,
    trim(guest_name),
    trim(coalesce(guest_contact, '')),
    next_contribution
  )
  returning id into inserted_id;

  update public.wishlists
  set activity_log = jsonb_build_array(
    jsonb_build_object(
      'id', 'activity-' || replace(gen_random_uuid()::text, '-', ''),
      'type', 'gift_reserved',
      'message',
        case
          when target_gift_kind = 'financial' then
            trim(guest_name) || ' contribuiu com "' || target_gift_name || '".'
          else
            trim(guest_name) || ' reservou "' || target_gift_name || '".'
        end,
      'createdAt', now(),
      'giftId', target_gift_id,
      'giftName', target_gift_name,
      'actor', trim(guest_name)
    )
  ) || coalesce(activity_log, '[]'::jsonb)
  where id = target_wishlist_id;

  return jsonb_build_object(
    'ok', true,
    'reservationId', inserted_id,
    'contributionAmount', next_contribution
  );
end;
$$;

grant execute on function public.get_public_wishlist(text) to anon, authenticated;
grant execute on function public.reserve_public_gift(text, uuid, text, text, numeric)
to anon, authenticated;

create or replace function public.reserve_public_gift(
  slug_or_id text,
  target_gift_id uuid,
  guest_name text,
  guest_contact text default ''
)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select public.reserve_public_gift(
    slug_or_id,
    target_gift_id,
    guest_name,
    guest_contact,
    0::numeric
  );
$$;

grant execute on function public.reserve_public_gift(text, uuid, text, text)
to anon, authenticated;
