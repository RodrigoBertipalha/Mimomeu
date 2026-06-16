import type { WishlistOptions } from '../types/wishlist'

export const DEFAULT_WISHLIST_OPTIONS: WishlistOptions = {
  categories: ['Cozinha', 'Decoração', 'Casa'],
  priceRanges: [
    'Até R$ 100',
    'R$ 100 - 300',
    'R$ 300 - 700',
    'Acima de R$ 700',
  ],
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

  return cleaned.length ? cleaned : [...fallback]
}

export function createDefaultWishlistOptions(): WishlistOptions {
  return {
    categories: [...DEFAULT_WISHLIST_OPTIONS.categories],
    priceRanges: [...DEFAULT_WISHLIST_OPTIONS.priceRanges],
  }
}

export function normalizeWishlistOptions(
  value?: Partial<WishlistOptions> | null
): WishlistOptions {
  return {
    categories: uniqueClean(
      value?.categories,
      DEFAULT_WISHLIST_OPTIONS.categories
    ),
    priceRanges: uniqueClean(
      value?.priceRanges,
      DEFAULT_WISHLIST_OPTIONS.priceRanges
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
