import { createContext, useContext } from 'react'
import type {
  Gift,
  GiftReservation,
  Wishlist,
  WishlistActivityType,
} from '../types/wishlist'

export type WishlistContextValue = {
  wishlists: Wishlist[]
  isLoading: boolean
  error: string
  findWishlist: (listId: string) => Wishlist | null
  refresh: () => Promise<void>
  refreshList: (listId: string) => Promise<void>
  createWishlist: (value: Wishlist) => Promise<Wishlist>
  updateWishlistDetails: (
    listId: string,
    details: Omit<Wishlist, 'gifts'>,
    activityType: WishlistActivityType
  ) => Promise<Wishlist>
  deleteWishlist: (listId: string) => Promise<void>
  addGift: (listId: string, gift: Gift) => Promise<Wishlist>
  updateGift: (listId: string, gift: Gift) => Promise<Wishlist>
  deleteGift: (listId: string, gift: Gift) => Promise<Wishlist>
  releaseGiftReservation: (listId: string, gift: Gift) => Promise<Wishlist>
  releaseReservation: (
    listId: string,
    gift: Gift,
    reservation: GiftReservation
  ) => Promise<Wishlist>
}

export const WishlistContext = createContext<WishlistContextValue | null>(null)

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist deve ser usado dentro de WishlistProvider.')
  }
  return context
}
