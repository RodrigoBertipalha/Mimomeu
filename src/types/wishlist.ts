export type GiftPriority = '' | 'Baixa' | 'Média' | 'Alta'

export type WishlistActivityType =
  | 'list_created'
  | 'list_updated'
  | 'options_updated'
  | 'gift_added'
  | 'gift_updated'
  | 'gift_reserved'
  | 'reservation_released'

export type WishlistActivity = {
  id: string
  type: WishlistActivityType
  message: string
  createdAt: string
  giftId?: string
  giftName?: string
  actor?: string
}

export type Gift = {
  id: string
  name: string
  link: string
  note: string
  category: string
  priceRange: string
  imageUrl: string
  hasDiscount: boolean
  priority: GiftPriority
  reserved: boolean
  reservedBy: string
  reservedContact: string
  createdAt?: string
  updatedAt?: string
  reservedAt?: string
}

export type WishlistOptions = {
  categories: string[]
  priceRanges: string[]
}

export type Wishlist = {
  id: string
  publicSlug?: string
  title: string
  eventDate: string
  eventType: string
  ownerName: string
  message: string
  options: WishlistOptions
  gifts: Gift[]
  activity: WishlistActivity[]
  createdAt: string
  updatedAt: string
}

export type ReservationGuest = {
  name: string
  contact: string
}
