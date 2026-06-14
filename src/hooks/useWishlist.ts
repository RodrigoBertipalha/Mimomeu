import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/authContext'
import {
  addRemoteGift,
  createRemoteWishlist,
  fetchPublicWishlist,
  fetchWishlist,
  fetchWishlists,
  releaseRemoteGiftReservation,
  reserveRemotePublicGift,
  updateRemoteGift,
  updateRemoteWishlist,
} from '../services/wishlistRepository'
import type { Gift, ReservationGuest, Wishlist } from '../types/wishlist'
import {
  clearWishlist,
  getWishlist,
  loadWishlist,
  loadWishlists,
  normalizeWishlist,
  saveWishlist,
  setActiveWishlist,
} from '../utils/storage'

export function useWishlist() {
  const { user, isConfigured } = useAuth()
  const shouldUseRemote = Boolean(isConfigured && user)
  const shouldUseLocal = !isConfigured
  const canUsePublicRemote = Boolean(isConfigured)
  const [wishlist, setWishlist] = useState<Wishlist | null>(() =>
    shouldUseLocal ? loadWishlist() : null
  )
  const [wishlists, setWishlists] = useState<Wishlist[]>(() =>
    shouldUseLocal ? loadWishlists() : []
  )
  const [isLoading, setIsLoading] = useState(shouldUseRemote)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setError('')

      if (!shouldUseRemote) {
        if (!shouldUseLocal) {
          setWishlists([])
          setWishlist(null)
          setIsLoading(false)
          return
        }

        setWishlists(loadWishlists())
        setWishlist(loadWishlist())
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const lists = await fetchWishlists()
        if (!active) return
        setWishlists(lists)
        setWishlist(lists[0] ?? null)
      } catch (loadError) {
        if (!active) return
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Não foi possível carregar suas listas.'
        )
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [shouldUseLocal, shouldUseRemote, user?.id])

  function persistLocal(value: Wishlist) {
    const saved = saveWishlist(value)
    setWishlist(saved)
    setWishlists(loadWishlists())
    return saved
  }

  async function refresh() {
    setError('')

    if (shouldUseRemote) {
      const lists = await fetchWishlists()
      setWishlists(lists)
      return lists
    }

    if (!shouldUseLocal) {
      setWishlists([])
      return []
    }

    const lists = loadWishlists()
    setWishlists(lists)
    return lists
  }

  async function createWishlist(value: Wishlist) {
    if (shouldUseRemote && user) {
      const created = await createRemoteWishlist(value, user.id)
      setWishlist(created)
      await refresh()
      return created
    }

    if (!shouldUseLocal) {
      throw new Error('Faça login para criar listas.')
    }

    const nextValue = normalizeWishlist({ ...value, gifts: value.gifts ?? [] })
    return persistLocal(nextValue)
  }

  function selectWishlist(listId: string) {
    if (!shouldUseLocal && !shouldUseRemote) return null

    const selected =
      wishlists.find((list) => list.id === listId) ??
      (shouldUseLocal ? getWishlist(listId) : null)
    if (!selected) return null

    if (!shouldUseRemote) {
      const active = setActiveWishlist(selected)
      setWishlist(active)
      return active
    }

    setWishlist(selected)
    return selected
  }

  const findWishlist = useCallback((listId: string) => {
    return (
      wishlists.find(
        (list) => list.id === listId || list.publicSlug === listId
      ) ??
      (shouldUseLocal ? getWishlist(listId) : null)
    )
  }, [shouldUseLocal, wishlists])

  async function loadWishlistById(listId: string) {
    if (shouldUseRemote) {
      const loaded = await fetchWishlist(listId)
      setWishlist(loaded)
      setWishlists((current) => {
        const exists = current.some((list) => list.id === loaded.id)
        return exists
          ? current.map((list) => (list.id === loaded.id ? loaded : list))
          : [loaded, ...current]
      })
      return loaded
    }

    return findWishlist(listId)
  }

  const loadPublicWishlist = useCallback(async (slugOrId: string) => {
    if (canUsePublicRemote) {
      return fetchPublicWishlist(slugOrId)
    }

    return findWishlist(slugOrId)
  }, [canUsePublicRemote, findWishlist])

  async function updateWishlistDetails(
    listId: string,
    details: Omit<Wishlist, 'gifts'>
  ) {
    if (shouldUseRemote) {
      const updated = await updateRemoteWishlist(listId, details)
      setWishlist(updated)
      await refresh()
      return updated
    }

    if (!shouldUseLocal) return null

    const current = findWishlist(listId)
    if (!current) return null

    return persistLocal({ ...details, gifts: current.gifts })
  }

  async function addGift(listId: string, gift: Gift) {
    if (shouldUseRemote) {
      const updated = await addRemoteGift(listId, gift)
      setWishlist(updated)
      await refresh()
      return updated
    }

    if (!shouldUseLocal) return null

    const current = findWishlist(listId)
    if (!current) return null

    return persistLocal({
      ...current,
      gifts: [...current.gifts, gift],
    })
  }

  async function updateGift(listId: string, gift: Gift) {
    if (shouldUseRemote) {
      const updated = await updateRemoteGift(listId, gift)
      setWishlist(updated)
      await refresh()
      return updated
    }

    if (!shouldUseLocal) return null

    const current = findWishlist(listId)
    if (!current) return null

    return persistLocal({
      ...current,
      gifts: current.gifts.map((item) => (item.id === gift.id ? gift : item)),
    })
  }

  const reserveGift = useCallback(async (
    listId: string,
    giftId: string,
    guest: ReservationGuest
  ) => {
    if (!shouldUseLocal) return false

    const current = findWishlist(listId)
    if (!current) return false

    let reserved = false
    const nextValue: Wishlist = {
      ...current,
      gifts: current.gifts.map((gift) => {
        if (gift.id !== giftId || gift.reserved) return gift

        reserved = true
        return {
          ...gift,
          reserved: true,
          reservedBy: guest.name,
          reservedContact: guest.contact,
        }
      }),
    }

    if (!reserved) return false
    persistLocal(nextValue)
    return true
  }, [findWishlist, shouldUseLocal])

  const reservePublicGift = useCallback(async (
    slugOrId: string,
    giftId: string,
    guest: ReservationGuest
  ) => {
    if (canUsePublicRemote) {
      return reserveRemotePublicGift(slugOrId, giftId, guest)
    }

    return reserveGift(slugOrId, giftId, guest)
  }, [canUsePublicRemote, reserveGift])

  async function releaseGiftReservation(listId: string, giftId: string) {
    if (shouldUseRemote) {
      const updated = await releaseRemoteGiftReservation(listId, giftId)
      setWishlist(updated)
      await refresh()
      return updated
    }

    if (!shouldUseLocal) return null

    const current = findWishlist(listId)
    if (!current) return null

    return persistLocal({
      ...current,
      gifts: current.gifts.map((gift) =>
        gift.id === giftId
          ? {
              ...gift,
              reserved: false,
              reservedBy: '',
              reservedContact: '',
            }
          : gift
      ),
    })
  }

  function resetWishlist() {
    clearWishlist()
    setWishlist(null)
    void refresh()
  }

  return {
    wishlist,
    wishlists,
    isLoading,
    error,
    isRemote: shouldUseRemote,
    createWishlist,
    selectWishlist,
    findWishlist,
    loadWishlistById,
    loadPublicWishlist,
    updateWishlistDetails,
    addGift,
    updateGift,
    reserveGift,
    reservePublicGift,
    releaseGiftReservation,
    resetWishlist,
    refresh,
  }
}
