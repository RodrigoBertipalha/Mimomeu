import { supabase } from '../lib/supabase'
import type { Gift, GiftPriority, ReservationGuest, Wishlist } from '../types/wishlist'

type ReservationRow = {
  id: string
  guest_name: string
  guest_contact: string
  created_at: string
}

type GiftRow = {
  id: string
  name: string
  product_url: string
  note: string
  category: string
  price_range: string
  image_url: string
  has_discount: boolean
  priority: string
  created_at: string
  updated_at: string
  reservations?: ReservationRow[]
}

type WishlistRow = {
  id: string
  title: string
  event_date: string | null
  event_type: string
  owner_name: string
  message: string
  public_slug: string
  created_at: string
  updated_at: string
  gifts?: GiftRow[]
}

function ensureSupabase() {
  if (!supabase) {
    throw new Error('Supabase não está configurado.')
  }

  return supabase
}

function normalizePriority(value: string): GiftPriority {
  return value === 'Baixa' || value === 'Média' || value === 'Alta' ? value : ''
}

function mapGift(row: GiftRow | Gift): Gift {
  if ('product_url' in row) {
    const reservation = row.reservations?.[0]

    return {
      id: row.id,
      name: row.name,
      link: row.product_url ?? '',
      note: row.note ?? '',
      category: row.category ?? '',
      priceRange: row.price_range ?? '',
      imageUrl: row.image_url ?? '',
      hasDiscount: Boolean(row.has_discount),
      priority: normalizePriority(row.priority ?? ''),
      reserved: Boolean(reservation),
      reservedBy: reservation?.guest_name ?? '',
      reservedContact: reservation?.guest_contact ?? '',
    }
  }

  return row
}

function mapWishlist(row: WishlistRow | Wishlist): Wishlist {
  if ('public_slug' in row) {
    return {
      id: row.id,
      publicSlug: row.public_slug,
      title: row.title,
      eventDate: row.event_date ?? '',
      eventType: row.event_type ?? '',
      ownerName: row.owner_name ?? '',
      message: row.message ?? '',
      gifts: (row.gifts ?? []).map(mapGift),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  return row
}

function wishlistPayload(value: Wishlist, ownerId: string) {
  return {
    owner_id: ownerId,
    title: value.title.trim(),
    event_date: value.eventDate || null,
    event_type: value.eventType || '',
    owner_name: value.ownerName || '',
    message: value.message || '',
  }
}

function giftPayload(value: Gift, wishlistId: string) {
  return {
    wishlist_id: wishlistId,
    name: value.name.trim(),
    product_url: value.link || '',
    note: value.note || '',
    category: value.category || '',
    price_range: value.priceRange || '',
    image_url: value.imageUrl || '',
    has_discount: value.hasDiscount,
    priority: value.priority || '',
  }
}

const wishlistSelect = `
  id,
  title,
  event_date,
  event_type,
  owner_name,
  message,
  public_slug,
  created_at,
  updated_at,
  gifts (
    id,
    name,
    product_url,
    note,
    category,
    price_range,
    image_url,
    has_discount,
    priority,
    created_at,
    updated_at,
    reservations (
      id,
      guest_name,
      guest_contact,
      created_at
    )
  )
`

export async function fetchWishlists() {
  const client = ensureSupabase()
  const { data, error } = await client
    .from('wishlists')
    .select(wishlistSelect)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => mapWishlist(row as WishlistRow))
}

export async function fetchWishlist(listId: string) {
  const client = ensureSupabase()
  const { data, error } = await client
    .from('wishlists')
    .select(wishlistSelect)
    .eq('id', listId)
    .single()

  if (error) throw error

  return mapWishlist(data as WishlistRow)
}

export async function createRemoteWishlist(value: Wishlist, ownerId: string) {
  const client = ensureSupabase()
  const { data, error } = await client
    .from('wishlists')
    .insert(wishlistPayload(value, ownerId))
    .select(wishlistSelect)
    .single()

  if (error) throw error

  return mapWishlist(data as WishlistRow)
}

export async function updateRemoteWishlist(
  listId: string,
  value: Omit<Wishlist, 'gifts'>
) {
  const client = ensureSupabase()
  const { data, error } = await client
    .from('wishlists')
    .update({
      title: value.title.trim(),
      event_date: value.eventDate || null,
      event_type: value.eventType || '',
      owner_name: value.ownerName || '',
      message: value.message || '',
    })
    .eq('id', listId)
    .select(wishlistSelect)
    .single()

  if (error) throw error

  return mapWishlist(data as WishlistRow)
}

export async function addRemoteGift(listId: string, gift: Gift) {
  const client = ensureSupabase()
  const { error } = await client.from('gifts').insert(giftPayload(gift, listId))

  if (error) throw error

  return fetchWishlist(listId)
}

export async function updateRemoteGift(listId: string, gift: Gift) {
  const client = ensureSupabase()
  const { error } = await client
    .from('gifts')
    .update(giftPayload(gift, listId))
    .eq('id', gift.id)

  if (error) throw error

  return fetchWishlist(listId)
}

export async function releaseRemoteGiftReservation(
  listId: string,
  giftId: string
) {
  const client = ensureSupabase()
  const { error } = await client
    .from('reservations')
    .delete()
    .eq('gift_id', giftId)

  if (error) throw error

  return fetchWishlist(listId)
}

export async function fetchPublicWishlist(slugOrId: string) {
  const client = ensureSupabase()
  const { data, error } = await client.rpc('get_public_wishlist', {
    slug_or_id: slugOrId,
  })

  if (error) throw error
  if (!data) return null

  return mapWishlist(data as Wishlist)
}

export async function reserveRemotePublicGift(
  slugOrId: string,
  giftId: string,
  guest: ReservationGuest
) {
  const client = ensureSupabase()
  const { data, error } = await client.rpc('reserve_public_gift', {
    slug_or_id: slugOrId,
    target_gift_id: giftId,
    guest_name: guest.name,
    guest_contact: guest.contact,
  })

  if (error) throw error

  return Boolean((data as { ok?: boolean } | null)?.ok)
}
