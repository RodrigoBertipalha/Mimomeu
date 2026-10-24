import { supabase } from '../lib/supabase'
import type {
  Gift,
  GiftPriority,
  GiftReservation,
  ReservationGuest,
  Wishlist,
  WishlistActivity,
} from '../types/wishlist'
import { normalizeWishlistActivity } from '../utils/activity'
import {
  normalizeGiftFundingMode,
  normalizeGiftKind,
  normalizeGiftQuantity,
  normalizeMoneyAmount,
  withGiftAvailability,
} from '../utils/gifts'
import { normalizeWishlistKind } from '../utils/listTypes'
import { normalizeWishlistOptions } from '../utils/wishlistOptions'

type ReservationRow = {
  id: string
  guest_name: string
  guest_contact: string
  contribution_amount: number
  created_at: string
}

type GiftRow = {
  id: string
  gift_kind: string
  funding_mode: string
  target_amount: number
  name: string
  product_url: string
  note: string
  category: string
  price_range: string
  image_url: string
  has_discount: boolean
  priority: string
  quantity_required: number
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
  list_kind: string
  gift_categories: string[]
  price_ranges: string[]
  activity_log: WishlistActivity[]
  created_at: string
  updated_at: string
  gifts?: GiftRow[]
}

const WISHLIST_SELECT = `
  id,
  title,
  event_date,
  event_type,
  owner_name,
  message,
  public_slug,
  list_kind,
  gift_categories,
  price_ranges,
  activity_log,
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
    gift_kind,
    funding_mode,
    target_amount,
    quantity_required,
    created_at,
    updated_at,
    reservations (
      id,
      guest_name,
      guest_contact,
      contribution_amount,
      created_at
    )
  )
`

function ensureSupabase() {
  if (!supabase) {
    throw new Error('Supabase não está configurado.')
  }

  return supabase
}

function normalizePriority(value: string): GiftPriority {
  return value === 'Baixa' || value === 'Média' || value === 'Alta' ? value : ''
}

function mapReservation(row: ReservationRow): GiftReservation {
  return {
    id: row.id,
    guestName: row.guest_name ?? '',
    guestContact: row.guest_contact ?? '',
    contributionAmount: normalizeMoneyAmount(row.contribution_amount),
    createdAt: row.created_at ?? '',
  }
}

function sortByDate<T extends { created_at: string }>(rows: T[] = []) {
  return [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at))
}

function mapGift(row: GiftRow): Gift {
  return withGiftAvailability({
    id: row.id,
    giftKind: normalizeGiftKind(row.gift_kind),
    fundingMode: normalizeGiftFundingMode(row.funding_mode),
    targetAmount: normalizeMoneyAmount(row.target_amount),
    name: row.name,
    link: row.product_url ?? '',
    note: row.note ?? '',
    category: row.category ?? '',
    priceRange: row.price_range ?? '',
    imageUrl: row.image_url ?? '',
    hasDiscount: Boolean(row.has_discount),
    priority: normalizePriority(row.priority ?? ''),
    quantity: normalizeGiftQuantity(row.quantity_required),
    reservations: sortByDate(row.reservations).map(mapReservation),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }) as Gift
}

function mapWishlist(row: WishlistRow): Wishlist {
  const listKind = normalizeWishlistKind(row.list_kind)

  return {
    id: row.id,
    publicSlug: row.public_slug,
    listKind,
    title: row.title,
    eventDate: row.event_date ?? '',
    eventType: row.event_type ?? '',
    ownerName: row.owner_name ?? '',
    message: row.message ?? '',
    options: normalizeWishlistOptions(
      { categories: row.gift_categories, priceRanges: row.price_ranges },
      listKind
    ),
    gifts: sortByDate(row.gifts).map(mapGift),
    activity: normalizeWishlistActivity(row.activity_log),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapPublicWishlist(value: Wishlist): Wishlist {
  const listKind = normalizeWishlistKind(value.listKind)

  return {
    ...value,
    listKind,
    message: value.message ?? '',
    options: normalizeWishlistOptions(value.options, listKind),
    gifts: (value.gifts ?? []).map((gift) => withGiftAvailability(gift) as Gift),
    activity: normalizeWishlistActivity(value.activity),
  }
}

function wishlistDetailsPayload(value: Omit<Wishlist, 'gifts'>) {
  const listKind = normalizeWishlistKind(value.listKind)
  const options = normalizeWishlistOptions(value.options, listKind)

  return {
    list_kind: listKind,
    title: value.title.trim(),
    event_date: value.eventDate || null,
    event_type: value.eventType || '',
    owner_name: value.ownerName || '',
    message: value.message || '',
    gift_categories: options.categories,
    price_ranges: options.priceRanges,
    activity_log: normalizeWishlistActivity(value.activity),
  }
}

function giftPayload(value: Gift, wishlistId: string) {
  return {
    wishlist_id: wishlistId,
    gift_kind: normalizeGiftKind(value.giftKind),
    funding_mode: normalizeGiftFundingMode(value.fundingMode),
    target_amount: normalizeMoneyAmount(value.targetAmount),
    name: value.name.trim(),
    product_url: value.link || '',
    note: value.note || '',
    category: value.category || '',
    price_range: value.priceRange || '',
    image_url: value.imageUrl || '',
    has_discount: value.hasDiscount,
    priority: value.priority || '',
    quantity_required: normalizeGiftQuantity(value.quantity),
  }
}

export async function fetchWishlists() {
  const { data, error } = await ensureSupabase()
    .from('wishlists')
    .select(WISHLIST_SELECT)
    .order('created_at', { ascending: false })

  if (error) throw error

  return ((data ?? []) as unknown as WishlistRow[]).map(mapWishlist)
}

export async function fetchWishlist(listId: string) {
  const { data, error } = await ensureSupabase()
    .from('wishlists')
    .select(WISHLIST_SELECT)
    .eq('id', listId)
    .single()

  if (error) throw error

  return mapWishlist(data as unknown as WishlistRow)
}

export async function createRemoteWishlist(value: Wishlist, ownerId: string) {
  const { data, error } = await ensureSupabase()
    .from('wishlists')
    .insert({ owner_id: ownerId, ...wishlistDetailsPayload(value) })
    .select(WISHLIST_SELECT)
    .single()

  if (error) throw error

  return mapWishlist(data as unknown as WishlistRow)
}

export async function updateRemoteWishlist(
  listId: string,
  value: Omit<Wishlist, 'gifts'>
) {
  const { data, error } = await ensureSupabase()
    .from('wishlists')
    .update(wishlistDetailsPayload(value))
    .eq('id', listId)
    .select(WISHLIST_SELECT)
    .single()

  if (error) throw error

  return mapWishlist(data as unknown as WishlistRow)
}

export async function deleteRemoteWishlist(listId: string) {
  const { error } = await ensureSupabase()
    .from('wishlists')
    .delete()
    .eq('id', listId)

  if (error) throw error
}

export async function updateRemoteWishlistActivity(
  listId: string,
  activity: WishlistActivity[]
) {
  const { error } = await ensureSupabase()
    .from('wishlists')
    .update({ activity_log: normalizeWishlistActivity(activity) })
    .eq('id', listId)

  if (error) throw error
}

export async function addRemoteGift(listId: string, gift: Gift) {
  const { data, error } = await ensureSupabase()
    .from('gifts')
    .insert(giftPayload(gift, listId))
    .select('id')
    .single()

  if (error) throw error

  return { list: await fetchWishlist(listId), giftId: data.id as string }
}

export async function updateRemoteGift(listId: string, gift: Gift) {
  const { error } = await ensureSupabase()
    .from('gifts')
    .update(giftPayload(gift, listId))
    .eq('id', gift.id)

  if (error) throw error

  return fetchWishlist(listId)
}

export async function deleteRemoteGift(listId: string, giftId: string) {
  const { error } = await ensureSupabase()
    .from('gifts')
    .delete()
    .eq('id', giftId)

  if (error) throw error

  return fetchWishlist(listId)
}

export async function releaseRemoteGiftReservation(
  listId: string,
  giftId: string
) {
  const { error } = await ensureSupabase()
    .from('reservations')
    .delete()
    .eq('gift_id', giftId)

  if (error) throw error

  return fetchWishlist(listId)
}

export async function deleteRemoteReservation(
  listId: string,
  reservationId: string
) {
  const { error } = await ensureSupabase()
    .from('reservations')
    .delete()
    .eq('id', reservationId)

  if (error) throw error

  return fetchWishlist(listId)
}

export async function fetchPublicWishlist(slugOrId: string) {
  const { data, error } = await ensureSupabase().rpc('get_public_wishlist', {
    slug_or_id: slugOrId,
  })

  if (error) throw error
  if (!data) return null

  return mapPublicWishlist(data as Wishlist)
}

export async function reserveRemotePublicGift(
  slugOrId: string,
  giftId: string,
  guest: ReservationGuest
) {
  const { data, error } = await ensureSupabase().rpc('reserve_public_gift', {
    slug_or_id: slugOrId,
    target_gift_id: giftId,
    guest_name: guest.name,
    guest_contact: guest.contact,
    contribution_amount: normalizeMoneyAmount(guest.contributionAmount),
  })

  if (error) throw error

  const result = data as { ok?: boolean; reason?: string } | null

  return {
    ok: Boolean(result?.ok),
    reason: (result?.reason ?? 'unknown') as ReservationFailureReason,
  }
}

export type ReservationFailureReason =
  | 'guest_required'
  | 'guest_too_long'
  | 'contact_too_long'
  | 'rate_limited'
  | 'not_found'
  | 'already_reserved'
  | 'invalid_amount'
  | 'unknown'
