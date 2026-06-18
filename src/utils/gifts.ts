import type {
  Gift,
  GiftFundingMode,
  GiftKind,
  GiftReservation,
} from '../types/wishlist'

const minQuantity = 1
const maxQuantity = 99
const maxMoneyAmount = 999999.99

export function normalizeGiftKind(value: unknown): GiftKind {
  return value === 'financial' ? 'financial' : 'physical'
}

export function normalizeGiftFundingMode(value: unknown): GiftFundingMode {
  return value === 'shared' ? 'shared' : 'full'
}

export function normalizeMoneyAmount(value: unknown) {
  const normalizedValue =
    typeof value === 'string' ? value.replace(',', '.') : value
  const numericValue =
    typeof normalizedValue === 'number'
      ? normalizedValue
      : Number.parseFloat(String(normalizedValue ?? ''))

  if (!Number.isFinite(numericValue)) return 0

  return Math.min(
    maxMoneyAmount,
    Math.max(0, Math.round(numericValue * 100) / 100)
  )
}

export function formatMoney(value: unknown) {
  return normalizeMoneyAmount(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

export function normalizeGiftQuantity(value: unknown) {
  const numericValue =
    typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10)

  if (!Number.isFinite(numericValue)) return minQuantity

  return Math.min(maxQuantity, Math.max(minQuantity, Math.floor(numericValue)))
}

export function normalizeGiftReservations(value: unknown): GiftReservation[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((entry): entry is Partial<GiftReservation> => {
      return Boolean(entry && typeof entry === 'object')
    })
    .map((entry, index) => ({
      id:
        typeof entry.id === 'string' && entry.id.trim()
          ? entry.id
          : `reservation-${index}`,
      guestName:
        typeof entry.guestName === 'string' ? entry.guestName.trim() : '',
      guestContact:
        typeof entry.guestContact === 'string' ? entry.guestContact.trim() : '',
      contributionAmount: normalizeMoneyAmount(entry.contributionAmount),
      createdAt:
        typeof entry.createdAt === 'string' && entry.createdAt.trim()
          ? entry.createdAt
          : '',
    }))
    .filter((entry) => entry.guestName)
}

export function getGiftKind(gift: Partial<Gift>) {
  return normalizeGiftKind(gift.giftKind)
}

export function isGiftFinancial(gift: Partial<Gift>) {
  return getGiftKind(gift) === 'financial'
}

export function getGiftFundingMode(gift: Partial<Gift>) {
  return normalizeGiftFundingMode(gift.fundingMode)
}

export function getGiftTargetAmount(gift: Partial<Gift>) {
  return normalizeMoneyAmount(gift.targetAmount)
}

export function getGiftReservations(gift: Partial<Gift>) {
  const reservations = normalizeGiftReservations(gift.reservations)

  if (reservations.length || !gift.reservedBy?.trim()) {
    return reservations
  }

  return [
    {
      id: `legacy-${gift.id ?? 'reservation'}`,
      guestName: gift.reservedBy.trim(),
      guestContact: gift.reservedContact?.trim() ?? '',
      contributionAmount: isGiftFinancial(gift)
        ? getGiftTargetAmount(gift)
        : 0,
      createdAt: gift.reservedAt ?? '',
    },
  ]
}

export function getGiftContributedAmount(gift: Partial<Gift>) {
  const reservations = getGiftReservations(gift)
  const reservationTotal = reservations.reduce(
    (sum, reservation) =>
      sum + normalizeMoneyAmount(reservation.contributionAmount),
    0
  )

  if (reservationTotal > 0) {
    return normalizeMoneyAmount(reservationTotal)
  }

  return normalizeMoneyAmount(gift.contributedAmount)
}

export function getGiftRemainingAmount(gift: Partial<Gift>) {
  return normalizeMoneyAmount(
    getGiftTargetAmount(gift) - getGiftContributedAmount(gift)
  )
}

export function getGiftQuantity(gift: Partial<Gift>) {
  return normalizeGiftQuantity(gift.quantity)
}

export function getGiftReservedCount(gift: Partial<Gift>) {
  if (isGiftFinancial(gift)) {
    return getGiftReservations(gift).length
  }

  const quantity = getGiftQuantity(gift)
  const reservations = getGiftReservations(gift)

  if (reservations.length) {
    return Math.min(quantity, reservations.length)
  }

  if (typeof gift.reservedCount === 'number') {
    return Math.min(quantity, Math.max(0, Math.floor(gift.reservedCount)))
  }

  return gift.reserved ? Math.min(quantity, 1) : 0
}

export function getGiftAvailableCount(gift: Partial<Gift>) {
  if (isGiftFinancial(gift)) {
    return getGiftRemainingAmount(gift) > 0 ? 1 : 0
  }

  return Math.max(0, getGiftQuantity(gift) - getGiftReservedCount(gift))
}

export function isGiftFullyReserved(gift: Partial<Gift>) {
  if (isGiftFinancial(gift)) {
    const targetAmount = getGiftTargetAmount(gift)

    return targetAmount > 0 && getGiftContributedAmount(gift) >= targetAmount
  }

  return getGiftReservedCount(gift) >= getGiftQuantity(gift)
}

export function getGiftReservedNames(gift: Partial<Gift>) {
  return getGiftReservations(gift)
    .map((reservation) => reservation.guestName)
    .filter(Boolean)
    .join(', ')
}

export function withGiftAvailability<T extends Partial<Gift>>(gift: T) {
  const giftKind = getGiftKind(gift)
  const fundingMode = getGiftFundingMode(gift)
  const quantity = getGiftQuantity(gift)
  const targetAmount = getGiftTargetAmount(gift)
  const reservations = getGiftReservations({ ...gift, giftKind, targetAmount })
  const contributedAmount = getGiftContributedAmount({
    ...gift,
    giftKind,
    targetAmount,
    reservations,
  })
  const reservedCount = getGiftReservedCount({
    ...gift,
    giftKind,
    quantity,
    reservations,
  })
  const reserved =
    giftKind === 'financial'
      ? targetAmount > 0 && contributedAmount >= targetAmount
      : reservedCount >= quantity
  const firstReservation = reservations[0]
  const lastReservation = reservations[reservations.length - 1]
  const reservedBy = getGiftReservedNames({ ...gift, reservations })

  return {
    ...gift,
    giftKind,
    fundingMode,
    targetAmount,
    contributedAmount,
    quantity,
    reservations,
    reservedCount,
    reserved,
    reservedBy,
    reservedContact: firstReservation?.guestContact ?? gift.reservedContact ?? '',
    reservedAt: lastReservation?.createdAt ?? gift.reservedAt ?? '',
  }
}
