alter table public.wishlists
add column if not exists gift_categories text[] not null default array[
  'Cozinha',
  'Decoração',
  'Casa'
]::text[],
add column if not exists price_ranges text[] not null default array[
  'Até R$ 100',
  'R$ 100 - 300',
  'R$ 300 - 700',
  'Acima de R$ 700'
]::text[];

update public.wishlists
set
  gift_categories = array['Cozinha', 'Decoração', 'Casa']::text[]
where cardinality(gift_categories) = 0;

update public.wishlists
set
  price_ranges = array[
    'Até R$ 100',
    'R$ 100 - 300',
    'R$ 300 - 700',
    'Acima de R$ 700'
  ]::text[]
where cardinality(price_ranges) = 0;

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

grant execute on function public.get_public_wishlist(text) to anon, authenticated;
