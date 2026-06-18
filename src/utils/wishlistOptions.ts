import type { WishlistKind, WishlistOptions } from '../types/wishlist'
import { normalizeWishlistKind } from './listTypes'

const DEFAULT_GIFT_OPTIONS: WishlistOptions = {
  categories: ['Cozinha', 'Decoração', 'Casa'],
  priceRanges: [
    'Até R$ 100',
    'R$ 100 - 300',
    'R$ 300 - 700',
    'Acima de R$ 700',
  ],
}

const DEFAULT_POTLUCK_OPTIONS: WishlistOptions = {
  categories: [
    'Pratos típicos',
    'Bebidas',
    'Descartáveis',
    'Sobremesas',
    'Apoio',
    'Outros',
  ],
  priceRanges: [],
}

export const DEFAULT_WISHLIST_OPTIONS = DEFAULT_GIFT_OPTIONS

function getDefaultWishlistOptions(kind?: WishlistKind | string | null) {
  return normalizeWishlistKind(kind) === 'potluck'
    ? DEFAULT_POTLUCK_OPTIONS
    : DEFAULT_GIFT_OPTIONS
}

function uniqueClean(values: unknown, fallback: string[]) {
  if (!Array.isArray(values)) return [...fallback]

  const seen = new Set<string>()
  const cleaned = values
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

  return cleaned
}

export function createDefaultWishlistOptions(
  kind?: WishlistKind | string | null
): WishlistOptions {
  const fallback = getDefaultWishlistOptions(kind)

  return {
    categories: [...fallback.categories],
    priceRanges: [...fallback.priceRanges],
  }
}

export function normalizeWishlistOptions(
  value?: Partial<WishlistOptions> | null,
  kind?: WishlistKind | string | null
): WishlistOptions {
  const fallback = getDefaultWishlistOptions(kind)

  return {
    categories: uniqueClean(
      value?.categories,
      fallback.categories
    ),
    priceRanges: uniqueClean(
      value?.priceRanges,
      fallback.priceRanges
    ),
  }
}

export function includeCurrentOption(options: string[], currentValue: string) {
  const current = currentValue.trim()
  if (!current) return options

  const exists = options.some(
    (option) => option.toLowerCase() === current.toLowerCase()
  )

  return exists ? options : [current, ...options]
}

export function usesWishlistCategories(
  value?: Partial<WishlistOptions> | null
) {
  return Array.isArray(value?.categories) && value.categories.length > 0
}

export function usesWishlistPriceRanges(
  value?: Partial<WishlistOptions> | null
) {
  return Array.isArray(value?.priceRanges) && value.priceRanges.length > 0
}
