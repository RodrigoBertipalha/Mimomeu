import type { Gift, GiftPriority, Wishlist } from '../types/wishlist'
import { normalizeWishlistOptions } from './wishlistOptions'

const ACTIVE_WISHLIST_KEY = 'mimo-meu:wishlist'
const WISHLISTS_KEY = 'mimo-meu:wishlists'
const LEGACY_ACTIVE_WISHLIST_KEY = 'listapresente:wishlist'
const LEGACY_WISHLISTS_KEY = 'listapresente:wishlists'

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizePriority(value: unknown): GiftPriority {
  return value === 'Baixa' || value === 'Média' || value === 'Alta' ? value : ''
}

function normalizeGift(value: Partial<Gift>): Gift {
  return {
    id: value.id || createId('gift'),
    name: value.name ?? '',
    link: value.link ?? '',
    note: value.note ?? '',
    category: value.category ?? '',
    priceRange: value.priceRange ?? '',
    imageUrl: value.imageUrl ?? '',
    hasDiscount: Boolean(value.hasDiscount),
    priority: normalizePriority(value.priority),
    reserved: Boolean(value.reserved),
    reservedBy: value.reservedBy ?? '',
    reservedContact: value.reservedContact ?? '',
  }
}

export function normalizeWishlist(value: Partial<Wishlist>): Wishlist {
  const now = new Date().toISOString()

  return {
    id: value.id || createId('list'),
    publicSlug: value.publicSlug,
    title: value.title ?? '',
    eventDate: value.eventDate ?? '',
    eventType: value.eventType ?? '',
    ownerName: value.ownerName ?? '',
    message: value.message ?? '',
    options: normalizeWishlistOptions(value.options),
    gifts: Array.isArray(value.gifts)
      ? value.gifts.map((gift) => normalizeGift(gift))
      : [],
    createdAt: value.createdAt ?? now,
    updatedAt: value.updatedAt ?? now,
  }
}

export function loadWishlist(): Wishlist | null {
  const raw =
    localStorage.getItem(ACTIVE_WISHLIST_KEY) ??
    localStorage.getItem(LEGACY_ACTIVE_WISHLIST_KEY)
  if (!raw) return null

  try {
    return normalizeWishlist(JSON.parse(raw) as Partial<Wishlist>)
  } catch {
    return null
  }
}

export function loadWishlists(): Wishlist[] {
  const raw =
    localStorage.getItem(WISHLISTS_KEY) ??
    localStorage.getItem(LEGACY_WISHLISTS_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((list) => normalizeWishlist(list as Partial<Wishlist>))
  } catch {
    return []
  }
}

function writeWishlists(value: Wishlist[]) {
  localStorage.setItem(WISHLISTS_KEY, JSON.stringify(value))
}

export function getWishlist(listId: string) {
  return loadWishlists().find((list) => list.id === listId) ?? null
}

export function saveWishlist(value: Wishlist) {
  const normalized = normalizeWishlist({
    ...value,
    updatedAt: new Date().toISOString(),
  })
  const lists = loadWishlists()
  const existingIndex = lists.findIndex((list) => list.id === normalized.id)
  const nextLists =
    existingIndex >= 0
      ? lists.map((list) => (list.id === normalized.id ? normalized : list))
      : [normalized, ...lists]

  writeWishlists(nextLists)
  localStorage.setItem(ACTIVE_WISHLIST_KEY, JSON.stringify(normalized))
  return normalized
}

export function setActiveWishlist(value: Wishlist) {
  const normalized = normalizeWishlist(value)
  localStorage.setItem(ACTIVE_WISHLIST_KEY, JSON.stringify(normalized))
  return normalized
}

export function clearWishlist() {
  localStorage.removeItem(ACTIVE_WISHLIST_KEY)
}
