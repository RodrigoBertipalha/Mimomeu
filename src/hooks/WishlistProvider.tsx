import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/authContext'
import { deleteGiftImages } from '../services/imageStorage'
import {
  addRemoteGift,
  createRemoteWishlist,
  deleteRemoteGift,
  deleteRemoteReservation,
  deleteRemoteWishlist,
  fetchWishlist,
  fetchWishlists,
  releaseRemoteGiftReservation,
  updateRemoteGift,
  updateRemoteWishlist,
  updateRemoteWishlistActivity,
} from '../services/wishlistRepository'
import type {
  Gift,
  GiftReservation,
  Wishlist,
  WishlistActivityType,
} from '../types/wishlist'
import {
  appendWishlistActivity,
  createWishlistActivity,
} from '../utils/activity'
import { WishlistContext } from './useWishlist'

function requireUser(userId?: string) {
  if (!userId) throw new Error('Faça login para gerenciar listas.')
  return userId
}

type WishlistStore = {
  userId?: string
  lists: Wishlist[]
  error: string
}

const NO_LISTS: Wishlist[] = []

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id
  const [store, setStore] = useState<WishlistStore>({ lists: [], error: '' })
  const isCurrentUser = Boolean(userId) && store.userId === userId
  const wishlists = isCurrentUser ? store.lists : NO_LISTS
  const error = isCurrentUser ? store.error : ''
  const isLoading = Boolean(userId) && !isCurrentUser

  useEffect(() => {
    if (!userId) return
    let active = true

    fetchWishlists()
      .then((lists) => {
        if (active) setStore({ userId, lists, error: '' })
      })
      .catch((loadError: unknown) => {
        if (!active) return
        setStore({
          userId,
          lists: [],
          error:
            loadError instanceof Error
              ? loadError.message
              : 'Não foi possível carregar suas listas.',
        })
      })

    return () => {
      active = false
    }
  }, [userId])

  const updateLists = useCallback(
    (update: (lists: Wishlist[]) => Wishlist[]) =>
      setStore((current) => ({ ...current, lists: update(current.lists) })),
    []
  )

  const replaceList = useCallback(
    (list: Wishlist) => {
      updateLists((current) =>
        current.some((item) => item.id === list.id)
          ? current.map((item) => (item.id === list.id ? list : item))
          : [list, ...current]
      )
      return list
    },
    [updateLists]
  )

  const refresh = useCallback(async () => {
    if (!userId) return
    try {
      const lists = await fetchWishlists()
      setStore({ userId, lists, error: '' })
    } catch {
      // Atualização em segundo plano: mantém os dados em cache se falhar.
    }
  }, [userId])

  const refreshList = useCallback(
    async (listId: string) => {
      if (!userId) return
      try {
        replaceList(await fetchWishlist(listId))
      } catch {
        // A lista pode ter sido excluída ou não pertencer ao usuário.
      }
    },
    [replaceList, userId]
  )

  const findWishlist = useCallback(
    (listId: string) =>
      wishlists.find(
        (list) => list.id === listId || list.publicSlug === listId
      ) ?? null,
    [wishlists]
  )

  async function saveActivity(
    list: Wishlist,
    type: WishlistActivityType,
    gift?: Pick<Gift, 'id' | 'name'>,
    actor?: string
  ) {
    const withActivity = appendWishlistActivity(
      list,
      createWishlistActivity(type, { gift, actor, listTitle: list.title })
    )
    await updateRemoteWishlistActivity(list.id, withActivity.activity)
    return replaceList(withActivity)
  }

  async function createWishlist(value: Wishlist) {
    const withActivity = appendWishlistActivity(
      value,
      createWishlistActivity('list_created', { listTitle: value.title })
    )
    const created = await createRemoteWishlist(withActivity, requireUser(userId))
    return replaceList(created)
  }

  async function updateWishlistDetails(
    listId: string,
    details: Omit<Wishlist, 'gifts'>,
    activityType: WishlistActivityType
  ) {
    const nextDetails = appendWishlistActivity(
      { ...details, gifts: [] },
      createWishlistActivity(activityType, { listTitle: details.title })
    )
    const updated = await updateRemoteWishlist(listId, nextDetails)
    return replaceList(updated)
  }

  async function deleteWishlist(listId: string) {
    const imageUrls =
      findWishlist(listId)?.gifts.map((gift) => gift.imageUrl) ?? []
    await deleteRemoteWishlist(listId)
    updateLists((current) => current.filter((list) => list.id !== listId))
    void deleteGiftImages(imageUrls)
  }

  async function addGift(listId: string, gift: Gift) {
    const { list, giftId } = await addRemoteGift(listId, gift)
    return saveActivity(list, 'gift_added', { id: giftId, name: gift.name })
  }

  async function updateGift(listId: string, gift: Gift) {
    const previousImageUrl =
      findWishlist(listId)?.gifts.find((item) => item.id === gift.id)
        ?.imageUrl ?? ''
    const updated = await updateRemoteGift(listId, gift)
    if (previousImageUrl && previousImageUrl !== gift.imageUrl) {
      void deleteGiftImages([previousImageUrl])
    }
    return saveActivity(updated, 'gift_updated', gift)
  }

  async function deleteGift(listId: string, gift: Gift) {
    const updated = await deleteRemoteGift(listId, gift.id)
    void deleteGiftImages([gift.imageUrl])
    return saveActivity(updated, 'gift_deleted', gift)
  }

  async function releaseGiftReservation(listId: string, gift: Gift) {
    const updated = await releaseRemoteGiftReservation(listId, gift.id)
    return saveActivity(updated, 'reservation_released', gift)
  }

  async function releaseReservation(
    listId: string,
    gift: Gift,
    reservation: GiftReservation
  ) {
    const updated = await deleteRemoteReservation(listId, reservation.id)
    return saveActivity(
      updated,
      'reservation_released',
      gift,
      reservation.guestName
    )
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlists,
        isLoading,
        error,
        findWishlist,
        refresh,
        refreshList,
        createWishlist,
        updateWishlistDetails,
        deleteWishlist,
        addGift,
        updateGift,
        deleteGift,
        releaseGiftReservation,
        releaseReservation,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}
