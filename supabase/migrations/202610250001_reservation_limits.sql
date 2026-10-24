-- Limites de tamanho e de frequencia nas reservas publicas.
-- O visitante e identificado pelo hash do IP; o IP em texto nunca e gravado.

create table if not exists public.reservation_attempts (
  id bigint generated always as identity primary key,
  client_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists reservation_attempts_client_idx
on public.reservation_attempts (client_hash, created_at desc);

create index if not exists reservation_attempts_created_idx
on public.reservation_attempts (created_at);

-- Sem politicas: so a funcao security definer abaixo le e escreve.
alter table public.reservation_attempts enable row level security;

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
set search_path = public, extensions
as $$
declare
  max_reservations_per_minute constant integer := 5;
  request_headers json;
  client_ip text;
  v_client_hash text;
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

  if char_length(trim(guest_name)) > 80 then
    return jsonb_build_object('ok', false, 'reason', 'guest_too_long');
  end if;

  if char_length(trim(coalesce(guest_contact, ''))) > 120 then
    return jsonb_build_object('ok', false, 'reason', 'contact_too_long');
  end if;

  request_headers := coalesce(
    nullif(current_setting('request.headers', true), ''),
    '{}'
  )::json;
  client_ip := nullif(trim(coalesce(
    request_headers ->> 'cf-connecting-ip',
    split_part(request_headers ->> 'x-forwarded-for', ',', 1),
    request_headers ->> 'x-real-ip',
    ''
  )), '');

  if client_ip is not null then
    v_client_hash := encode(digest(client_ip, 'sha256'), 'hex');

    delete from public.reservation_attempts
    where created_at < now() - interval '1 hour';

    if (
      select count(*)
      from public.reservation_attempts a
      where a.client_hash = v_client_hash
        and a.created_at > now() - interval '1 minute'
    ) >= max_reservations_per_minute then
      return jsonb_build_object('ok', false, 'reason', 'rate_limited');
    end if;
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

  if v_client_hash is not null then
    insert into public.reservation_attempts (client_hash) values (v_client_hash);
  end if;

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

grant execute on function public.reserve_public_gift(text, uuid, text, text, numeric)
to anon, authenticated;
