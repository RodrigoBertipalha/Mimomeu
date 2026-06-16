import type {
  Gift,
  Wishlist,
  WishlistActivity,
  WishlistActivityType,
} from '../types/wishlist'

const activityTypes: WishlistActivityType[] = [
  'list_created',
  'list_updated',
  'options_updated',
  'gift_added',
  'gift_updated',
  'gift_reserved',
  'reservation_released',
]

const maxActivityEntries = 60

type ActivityDetails = {
  actor?: string
  gift?: Pick<Gift, 'id' | 'name'>
  giftId?: string
  giftName?: string
  listTitle?: string
  now?: string
}

function createActivityId() {
  return `activity-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function isActivityType(value: unknown): value is WishlistActivityType {
  return (
    typeof value === 'string' &&
    activityTypes.includes(value as WishlistActivityType)
  )
}

function getGiftName(details: ActivityDetails) {
  return details.gift?.name || details.giftName || 'presente'
}

function buildActivityMessage(
  type: WishlistActivityType,
  details: ActivityDetails
) {
  const giftName = getGiftName(details)
  const actor = details.actor?.trim()

  if (type === 'list_created') {
    return details.listTitle
      ? `Lista "${details.listTitle}" criada.`
      : 'Lista criada.'
  }

  if (type === 'list_updated') {
    return 'Dados da lista atualizados.'
  }

  if (type === 'options_updated') {
    return 'Categorias e faixas de preço atualizadas.'
  }

  if (type === 'gift_added') {
    return `Presente "${giftName}" adicionado.`
  }

  if (type === 'gift_updated') {
    return `Presente "${giftName}" editado.`
  }

  if (type === 'gift_reserved') {
    return actor
      ? `${actor} reservou "${giftName}".`
      : `Presente "${giftName}" reservado.`
  }

  return `Reserva de "${giftName}" liberada.`
}

export function createWishlistActivity(
  type: WishlistActivityType,
  details: ActivityDetails = {}
): WishlistActivity {
  const giftId = details.gift?.id || details.giftId
  const giftName = details.gift?.name || details.giftName
  const actor = details.actor?.trim()

  return {
    id: createActivityId(),
    type,
    message: buildActivityMessage(type, details),
    createdAt: details.now ?? new Date().toISOString(),
    ...(giftId ? { giftId } : {}),
    ...(giftName ? { giftName } : {}),
    ...(actor ? { actor } : {}),
  }
}

export function normalizeWishlistActivity(value: unknown): WishlistActivity[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((entry): entry is Partial<WishlistActivity> => {
      return Boolean(entry && typeof entry === 'object')
    })
    .map((entry) => {
      const type = isActivityType(entry.type) ? entry.type : 'list_updated'
      const giftName =
        typeof entry.giftName === 'string' ? entry.giftName.trim() : ''
      const actor = typeof entry.actor === 'string' ? entry.actor.trim() : ''
      const message =
        typeof entry.message === 'string' && entry.message.trim()
          ? entry.message.trim()
          : buildActivityMessage(type, { giftName, actor })

      return {
        id:
          typeof entry.id === 'string' && entry.id.trim()
            ? entry.id
            : createActivityId(),
        type,
        message,
        createdAt:
          typeof entry.createdAt === 'string' && entry.createdAt.trim()
            ? entry.createdAt
            : new Date().toISOString(),
        ...(typeof entry.giftId === 'string' && entry.giftId.trim()
          ? { giftId: entry.giftId }
          : {}),
        ...(giftName ? { giftName } : {}),
        ...(actor ? { actor } : {}),
      }
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, maxActivityEntries)
}

export function appendWishlistActivity(
  list: Wishlist,
  entry: WishlistActivity
): Wishlist {
  return {
    ...list,
    activity: normalizeWishlistActivity([entry, ...(list.activity ?? [])]),
  }
}
