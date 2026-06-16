export type GiftPriority = '' | 'Baixa' | 'Média' | 'Alta'

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
  createdAt: string
  updatedAt: string
}

export type ReservationGuest = {
  name: string
  contact: string
}
