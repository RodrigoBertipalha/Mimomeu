create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  event_date date,
  event_type text not null default '',
  owner_name text not null default '',
  message text not null default '',
  public_slug text not null unique,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  name text not null,
  product_url text not null default '',
  note text not null default '',
  category text not null default '',
  price_range text not null default '',
  image_url text not null default '',
  has_discount boolean not null default false,
  priority text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gifts_priority_check check (priority in ('', 'Baixa', 'Média', 'Alta'))
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  gift_id uuid not null references public.gifts(id) on delete cascade,
  guest_name text not null,
  guest_contact text not null default '',
  created_at timestamptz not null default now(),
  unique (gift_id)
);

create index if not exists wishlists_owner_id_idx on public.wishlists(owner_id);
create index if not exists wishlists_public_slug_idx on public.wishlists(public_slug);
create index if not exists gifts_wishlist_id_idx on public.gifts(wishlist_id);
create index if not exists reservations_wishlist_id_idx on public.reservations(wishlist_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists touch_wishlists_updated_at on public.wishlists;
create trigger touch_wishlists_updated_at
before update on public.wishlists
for each row execute function public.touch_updated_at();

drop trigger if exists touch_gifts_updated_at on public.gifts;
create trigger touch_gifts_updated_at
before update on public.gifts
for each row execute function public.touch_updated_at();

create or replace function public.unaccent_fallback(value text)
returns text
language plpgsql
immutable
as $$
begin
  return translate(
    value,
    'ÁÀÂÃÄáàâãäÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇçÑñ',
    'AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn'
  );
end;
$$;

create or replace function public.slugify(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(public.unaccent_fallback(coalesce(value, 'lista'))), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.create_unique_public_slug(base_title text)
returns text
language plpgsql
as $$
declare
  base_slug text;
  candidate text;
begin
  base_slug := public.slugify(base_title);
  if base_slug = '' then
    base_slug := 'lista';
  end if;

  loop
    candidate := base_slug || '-' || substr(encode(gen_random_bytes(4), 'hex'), 1, 8);
    exit when not exists (
      select 1 from public.wishlists where public_slug = candidate
    );
  end loop;

  return candidate;
end;
$$;

create or replace function public.set_wishlist_public_slug()
returns trigger
language plpgsql
as $$
begin
  if new.public_slug is null or trim(new.public_slug) = '' then
    new.public_slug := public.create_unique_public_slug(new.title);
  end if;
  return new;
end;
$$;

drop trigger if exists set_wishlist_public_slug on public.wishlists;
create trigger set_wishlist_public_slug
before insert on public.wishlists
for each row execute function public.set_wishlist_public_slug();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists create_profile_for_new_user on auth.users;
create trigger create_profile_for_new_user
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.wishlists enable row level security;
alter table public.gifts enable row level security;
alter table public.reservations enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "wishlists_owner_select" on public.wishlists;
create policy "wishlists_owner_select"
on public.wishlists for select
to authenticated
using (auth.uid() = owner_id);

drop policy if exists "wishlists_owner_insert" on public.wishlists;
create policy "wishlists_owner_insert"
on public.wishlists for insert
to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "wishlists_owner_update" on public.wishlists;
create policy "wishlists_owner_update"
on public.wishlists for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "wishlists_owner_delete" on public.wishlists;
create policy "wishlists_owner_delete"
on public.wishlists for delete
to authenticated
using (auth.uid() = owner_id);

drop policy if exists "wishlists_public_read" on public.wishlists;
create policy "wishlists_public_read"
on public.wishlists for select
to anon
using (is_public = true);

drop policy if exists "gifts_owner_select" on public.gifts;
create policy "gifts_owner_select"
on public.gifts for select
to authenticated
using (
  exists (
    select 1 from public.wishlists
    where wishlists.id = gifts.wishlist_id
      and wishlists.owner_id = auth.uid()
  )
);

drop policy if exists "gifts_owner_insert" on public.gifts;
create policy "gifts_owner_insert"
on public.gifts for insert
to authenticated
with check (
  exists (
    select 1 from public.wishlists
    where wishlists.id = gifts.wishlist_id
      and wishlists.owner_id = auth.uid()
  )
);

drop policy if exists "gifts_owner_update" on public.gifts;
create policy "gifts_owner_update"
on public.gifts for update
to authenticated
using (
  exists (
    select 1 from public.wishlists
    where wishlists.id = gifts.wishlist_id
      and wishlists.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.wishlists
    where wishlists.id = gifts.wishlist_id
      and wishlists.owner_id = auth.uid()
  )
);

drop policy if exists "gifts_owner_delete" on public.gifts;
create policy "gifts_owner_delete"
on public.gifts for delete
to authenticated
using (
  exists (
    select 1 from public.wishlists
    where wishlists.id = gifts.wishlist_id
      and wishlists.owner_id = auth.uid()
  )
);

drop policy if exists "gifts_public_read" on public.gifts;
create policy "gifts_public_read"
on public.gifts for select
to anon
using (
  exists (
    select 1 from public.wishlists
    where wishlists.id = gifts.wishlist_id
      and wishlists.is_public = true
  )
);

drop policy if exists "reservations_owner_select" on public.reservations;
create policy "reservations_owner_select"
on public.reservations for select
to authenticated
using (
  exists (
    select 1 from public.wishlists
    where wishlists.id = reservations.wishlist_id
      and wishlists.owner_id = auth.uid()
  )
);

drop policy if exists "reservations_owner_delete" on public.reservations;
create policy "reservations_owner_delete"
on public.reservations for delete
to authenticated
using (
  exists (
    select 1 from public.wishlists
    where wishlists.id = reservations.wishlist_id
      and wishlists.owner_id = auth.uid()
  )
);

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
    'title', w.title,
    'eventDate', coalesce(w.event_date::text, ''),
    'eventType', w.event_type,
    'ownerName', w.owner_name,
    'message', w.message,
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
          'reserved', r.id is not null,
          'reservedBy', coalesce(r.guest_name, ''),
          'reservedContact', '',
          'createdAt', g.created_at,
          'updatedAt', g.updated_at
        )
        order by g.sort_order, g.created_at
      ) filter (where g.id is not null),
      '[]'::jsonb
    )
  )
  into payload
  from public.wishlists w
  left join public.gifts g on g.wishlist_id = w.id
  left join public.reservations r on r.gift_id = g.id
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
  inserted_id uuid;
begin
  if trim(coalesce(guest_name, '')) = '' then
    return jsonb_build_object('ok', false, 'reason', 'guest_required');
  end if;

  select w.id
  into target_wishlist_id
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

  return jsonb_build_object('ok', true, 'reservationId', inserted_id);
end;
$$;

grant execute on function public.get_public_wishlist(text) to anon, authenticated;
grant execute on function public.reserve_public_gift(text, uuid, text, text) to anon, authenticated;
