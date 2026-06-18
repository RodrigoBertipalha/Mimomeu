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

type RepositoryError = {
  code?: string
  message?: string
}

type ReservationRow = {
  id: string
  guest_name: string
  guest_contact: string
  contribution_amount?: number
  created_at: string
}

type GiftRow = {
  id: string
  gift_kind?: string
  funding_mode?: string
  target_amount?: number
  name: string
  product_url: string
  note: string
  category: string
  price_range: string
  image_url: string
  has_discount: boolean
  priority: string
  quantity_required?: number
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
  list_kind?: string
  gift_categories?: string[]
  price_ranges?: string[]
  activity_log?: WishlistActivity[]
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

let supportsWishlistOptions = true
let supportsWishlistActivity = true
let supportsWishlistKind = true
let supportsGiftQuantity = true
let supportsFinancialGifts = true

function isMissingWishlistOptionsError(error: unknown) {
  const repositoryError = error as RepositoryError
  const message = repositoryError.message?.toLowerCase() ?? ''

  return (
    message.includes('gift_categories') ||
    message.includes('price_ranges')
  )
}

function isMissingWishlistActivityError(error: unknown) {
  const repositoryError = error as RepositoryError
  const message = repositoryError.message?.toLowerCase() ?? ''

  return message.includes('activity_log')
}

function isMissingWishlistKindError(error: unknown) {
  const repositoryError = error as RepositoryError
  const message = repositoryError.message?.toLowerCase() ?? ''

  return message.includes('list_kind')
}

function isMissingGiftQuantityError(error: unknown) {
  const repositoryError = error as RepositoryError
  const message = repositoryError.message?.toLowerCase() ?? ''

  return message.includes('quantity_required')
}

function isMissingFinancialGiftError(error: unknown) {
  const repositoryError = error as RepositoryError
  const message = repositoryError.message?.toLowerCase() ?? ''

  return (
    message.includes('gift_kind') ||
    message.includes('funding_mode') ||
    message.includes('target_amount') ||
    message.includes('contribution_amount')
  )
}

function rememberMissingWishlistColumns(error: unknown) {
  const repositoryError = error as RepositoryError
  const missingOptions = isMissingWishlistOptionsError(error)
  const missingActivity = isMissingWishlistActivityError(error)
  const missingKind = isMissingWishlistKindError(error)
  const missingGiftQuantity = isMissingGiftQuantityError(error)
  const missingFinancialGifts = isMissingFinancialGiftError(error)
  const unknownMissingColumn =
    (repositoryError.code === '42703' || repositoryError.code === 'PGRST204') &&
    !missingOptions &&
    !missingActivity &&
    !missingKind &&
    !missingGiftQuantity &&
    !missingFinancialGifts

  if (missingOptions || unknownMissingColumn) {
    supportsWishlistOptions = false
  }

  if (missingActivity || unknownMissingColumn) {
    supportsWishlistActivity = false
  }

  if (missingKind || unknownMissingColumn) {
    supportsWishlistKind = false
  }

  if (missingGiftQuantity || unknownMissingColumn) {
    supportsGiftQuantity = false
  }

  if (missingFinancialGifts || unknownMissingColumn) {
    supportsFinancialGifts = false
  }

  return (
    missingOptions ||
    missingActivity ||
    missingKind ||
    missingGiftQuantity ||
    missingFinancialGifts ||
    unknownMissingColumn
  )
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

function mapGift(row: GiftRow | Gift): Gift {
  if ('product_url' in row) {
    const reservations = (row.reservations ?? []).map(mapReservation)

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
      reserved: reservations.length >= normalizeGiftQuantity(row.quantity_required),
      reservedBy: reservations.map((reservation) => reservation.guestName).join(', '),
      reservedContact: reservations[0]?.guestContact ?? '',
      contributedAmount: reservations.reduce(
        (sum, reservation) => sum + reservation.contributionAmount,
        0
      ),
      reservedCount: reservations.length,
      reservations,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      reservedAt: reservations[reservations.length - 1]?.createdAt ?? '',
    }) as Gift
  }

  return withGiftAvailability(row) as Gift
}

function mapWishlist(row: WishlistRow | Wishlist): Wishlist {
  if ('public_slug' in row) {
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
      options: normalizeWishlistOptions({
        categories: row.gift_categories,
        priceRanges: row.price_ranges,
      }, listKind),
      gifts: (row.gifts ?? []).map(mapGift),
      activity: normalizeWishlistActivity(row.activity_log),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  const listKind = normalizeWishlistKind(row.listKind)

  return {
    ...row,
    listKind,
    options: normalizeWishlistOptions(row.options, listKind),
    gifts: row.gifts.map(mapGift),
    activity: normalizeWishlistActivity(row.activity),
  }
}

function wishlistPayload(
  value: Wishlist,
  ownerId: string,
  includeOptions = supportsWishlistOptions,
  includeActivity = supportsWishlistActivity,
  includeKind = supportsWishlistKind
) {
  const listKind = normalizeWishlistKind(value.listKind)
  const options = normalizeWishlistOptions(value.options, listKind)
  const activity = normalizeWishlistActivity(value.activity)
  const payload = {
    owner_id: ownerId,
    ...(includeKind ? { list_kind: listKind } : {}),
    title: value.title.trim(),
    event_date: value.eventDate || null,
    event_type: value.eventType || '',
    owner_name: value.ownerName || '',
    message: value.message || '',
  }

  return includeOptions
    ? {
        ...payload,
        gift_categories: options.categories,
        price_ranges: options.priceRanges,
        ...(includeActivity ? { activity_log: activity } : {}),
      }
    : {
        ...payload,
        ...(includeActivity ? { activity_log: activity } : {}),
      }
}

function wishlistDetailsPayload(
  value: Omit<Wishlist, 'gifts'>,
  includeOptions = supportsWishlistOptions,
  includeActivity = supportsWishlistActivity,
  includeKind = supportsWishlistKind
) {
  const listKind = normalizeWishlistKind(value.listKind)
  const options = normalizeWishlistOptions(value.options, listKind)
  const activity = normalizeWishlistActivity(value.activity)
  const payload = {
    ...(includeKind ? { list_kind: listKind } : {}),
    title: value.title.trim(),
    event_date: value.eventDate || null,
    event_type: value.eventType || '',
    owner_name: value.ownerName || '',
    message: value.message || '',
  }

  return includeOptions
    ? {
        ...payload,
        gift_categories: options.categories,
        price_ranges: options.priceRanges,
        ...(includeActivity ? { activity_log: activity } : {}),
      }
    : {
        ...payload,
        ...(includeActivity ? { activity_log: activity } : {}),
      }
}

function giftPayload(
  value: Gift,
  wishlistId: string,
  includeQuantity = supportsGiftQuantity,
  includeFinancial = supportsFinancialGifts
) {
  return {
    wishlist_id: wishlistId,
    ...(includeFinancial
      ? {
          gift_kind: normalizeGiftKind(value.giftKind),
          funding_mode: normalizeGiftFundingMode(value.fundingMode),
          target_amount: normalizeMoneyAmount(value.targetAmount),
        }
      : {}),
    name: value.name.trim(),
    product_url: value.link || '',
    note: value.note || '',
    category: value.category || '',
    price_range: value.priceRange || '',
    image_url: value.imageUrl || '',
    has_discount: value.hasDiscount,
    priority: value.priority || '',
    ...(includeQuantity
      ? { quantity_required: normalizeGiftQuantity(value.quantity) }
      : {}),
  }
}

function createWishlistSelect(includeOptions: boolean, includeActivity: boolean) {
  const kindField = supportsWishlistKind
    ? `
  list_kind,`
    : ''
  const optionFields = includeOptions
    ? `
  gift_categories,
  price_ranges,`
    : ''
  const activityField = includeActivity
    ? `
  activity_log,`
    : ''

  return `
  id,
  title,
  event_date,
  event_type,
  owner_name,
  message,
  public_slug,
  ${kindField}
  ${optionFields}
  ${activityField}
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
    ${supportsFinancialGifts
      ? `
    gift_kind,
    funding_mode,
    target_amount,`
      : ''}
    ${supportsGiftQuantity ? 'quantity_required,' : ''}
    created_at,
    updated_at,
    reservations (
      id,
      guest_name,
      guest_contact,
      ${supportsFinancialGifts ? 'contribution_amount,' : ''}
      created_at
    )
  )
`
}

function getWishlistSelect() {
  return createWishlistSelect(supportsWishlistOptions, supportsWishlistActivity)
}

export async function fetchWishlists() {
  const client = ensureSupabase()
  let { data, error } = await client
    .from('wishlists')
    .select(getWishlistSelect())
    .order('created_at', { ascending: false })

  if (error && rememberMissingWishlistColumns(error)) {
    const fallback = await client
      .from('wishlists')
      .select(getWishlistSelect())
      .order('created_at', { ascending: false })

    data = fallback.data
    error = fallback.error
  }

  if (error) throw error

  return (data ?? []).map((row) => mapWishlist(row as WishlistRow))
}

export async function fetchWishlist(listId: string) {
  const client = ensureSupabase()
  let { data, error } = await client
    .from('wishlists')
    .select(getWishlistSelect())
    .eq('id', listId)
    .single()

  if (error && rememberMissingWishlistColumns(error)) {
    const fallback = await client
      .from('wishlists')
      .select(getWishlistSelect())
      .eq('id', listId)
      .single()

    data = fallback.data
    error = fallback.error
  }

  if (error) throw error

  return mapWishlist(data as WishlistRow)
}

export async function createRemoteWishlist(value: Wishlist, ownerId: string) {
  const client = ensureSupabase()
  let { data, error } = await client
    .from('wishlists')
    .insert(wishlistPayload(value, ownerId))
    .select(getWishlistSelect())
    .single()

  if (error && rememberMissingWishlistColumns(error)) {
    const fallback = await client
      .from('wishlists')
      .insert(
        wishlistPayload(
          value,
          ownerId,
          supportsWishlistOptions,
          supportsWishlistActivity
        )
      )
      .select(getWishlistSelect())
      .single()

    data = fallback.data
    error = fallback.error
  }

  if (error) throw error

  return mapWishlist(data as WishlistRow)
}

export async function updateRemoteWishlist(
  listId: string,
  value: Omit<Wishlist, 'gifts'>
) {
  const client = ensureSupabase()
  let { data, error } = await client
    .from('wishlists')
    .update(wishlistDetailsPayload(value))
    .eq('id', listId)
    .select(getWishlistSelect())
    .single()

  if (error && rememberMissingWishlistColumns(error)) {
    const fallback = await client
      .from('wishlists')
      .update(
        wishlistDetailsPayload(
          value,
          supportsWishlistOptions,
          supportsWishlistActivity
        )
      )
      .eq('id', listId)
      .select(getWishlistSelect())
      .single()

    data = fallback.data
    error = fallback.error
  }

  if (error) throw error

  return mapWishlist(data as WishlistRow)
}

export async function updateRemoteWishlistActivity(
  listId: string,
  activity: WishlistActivity[]
) {
  if (!supportsWishlistActivity) return false

  const client = ensureSupabase()
  const { error } = await client
    .from('wishlists')
    .update({ activity_log: normalizeWishlistActivity(activity) })
    .eq('id', listId)

  if (error && rememberMissingWishlistColumns(error)) {
    return false
  }

  if (error) throw error

  return true
}

export async function addRemoteGift(listId: string, gift: Gift) {
  const client = ensureSupabase()
  let { error } = await client.from('gifts').insert(giftPayload(gift, listId))

  if (error && rememberMissingWishlistColumns(error)) {
    const fallback = await client
      .from('gifts')
      .insert(
        giftPayload(
          gift,
          listId,
          supportsGiftQuantity,
          supportsFinancialGifts
        )
      )

    error = fallback.error
  }

  if (error) throw error

  return fetchWishlist(listId)
}

export async function updateRemoteGift(listId: string, gift: Gift) {
  const client = ensureSupabase()
  let { error } = await client
    .from('gifts')
    .update(giftPayload(gift, listId))
    .eq('id', gift.id)

  if (error && rememberMissingWishlistColumns(error)) {
    const fallback = await client
      .from('gifts')
      .update(
        giftPayload(
          gift,
          listId,
          supportsGiftQuantity,
          supportsFinancialGifts
        )
      )
      .eq('id', gift.id)

    error = fallback.error
  }

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
  let { data, error } = await client.rpc('reserve_public_gift', {
    slug_or_id: slugOrId,
    target_gift_id: giftId,
    guest_name: guest.name,
    guest_contact: guest.contact,
    contribution_amount: normalizeMoneyAmount(guest.contributionAmount),
  })

  if (error && rememberMissingWishlistColumns(error)) {
    const fallback = await client.rpc('reserve_public_gift', {
      slug_or_id: slugOrId,
      target_gift_id: giftId,
      guest_name: guest.name,
      guest_contact: guest.contact,
    })

    data = fallback.data
    error = fallback.error
  }

  if (error) throw error

  return Boolean((data as { ok?: boolean } | null)?.ok)
}
