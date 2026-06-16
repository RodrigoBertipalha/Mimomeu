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
  updateRemoteWishlistActivity,
} from '../services/wishlistRepository'
import type {
  Gift,
  ReservationGuest,
  Wishlist,
  WishlistActivityType,
} from '../types/wishlist'
import {
  appendWishlistActivity,
  createWishlistActivity,
} from '../utils/activity'
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

  function appendActivityToDetails(
    details: Omit<Wishlist, 'gifts'>,
    type?: WishlistActivityType
  ) {
    if (!type) return details

    const listForActivity: Wishlist = {
      ...details,
      gifts: [],
    }

    return {
      ...details,
      activity: appendWishlistActivity(
        listForActivity,
        createWishlistActivity(type, { listTitle: details.title })
      ).activity,
    }
  }

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
    const normalizedValue = normalizeWishlist(value)
    const nextValue = normalizedValue.activity.length
      ? normalizedValue
      : appendWishlistActivity(
          normalizedValue,
          createWishlistActivity('list_created', {
            listTitle: normalizedValue.title,
            now: normalizedValue.createdAt,
          })
        )

    if (shouldUseRemote && user) {
      const created = await createRemoteWishlist(nextValue, user.id)
      setWishlist(created)
      await refresh()
      return created
    }

    if (!shouldUseLocal) {
      throw new Error('Faça login para criar listas.')
    }

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
    details: Omit<Wishlist, 'gifts'>,
    activityType?: WishlistActivityType
  ) {
    const nextDetails = appendActivityToDetails(details, activityType)

    if (shouldUseRemote) {
      const updated = await updateRemoteWishlist(listId, nextDetails)
      setWishlist(updated)
      await refresh()
      return updated
    }

    if (!shouldUseLocal) return null

    const current = findWishlist(listId)
    if (!current) return null

    return persistLocal({ ...nextDetails, gifts: current.gifts })
  }

  async function addGift(listId: string, gift: Gift) {
    const now = new Date().toISOString()
    const giftWithDates: Gift = {
      ...gift,
      createdAt: gift.createdAt ?? now,
      updatedAt: now,
    }

    if (shouldUseRemote) {
      const updated = await addRemoteGift(listId, giftWithDates)
      const savedGift =
        updated.gifts.find((item) => item.name === giftWithDates.name) ??
        giftWithDates
      const withActivity = appendWishlistActivity(
        updated,
        createWishlistActivity('gift_added', {
          gift: savedGift,
          now,
        })
      )

      await updateRemoteWishlistActivity(listId, withActivity.activity)
      setWishlist(withActivity)
      await refresh()
      return withActivity
    }

    if (!shouldUseLocal) return null

    const current = findWishlist(listId)
    if (!current) return null

    return persistLocal(
      appendWishlistActivity(
        {
          ...current,
          gifts: [...current.gifts, giftWithDates],
        },
        createWishlistActivity('gift_added', {
          gift: giftWithDates,
          now,
        })
      )
    )
  }

  async function updateGift(listId: string, gift: Gift) {
    const now = new Date().toISOString()
    const current = findWishlist(listId)
    const originalGift = current?.gifts.find((item) => item.id === gift.id)
    const giftWithDates: Gift = {
      ...gift,
      createdAt: gift.createdAt ?? originalGift?.createdAt ?? now,
      updatedAt: now,
      reservedAt: gift.reservedAt ?? originalGift?.reservedAt ?? '',
    }

    if (shouldUseRemote) {
      const updated = await updateRemoteGift(listId, giftWithDates)
      const withActivity = appendWishlistActivity(
        updated,
        createWishlistActivity('gift_updated', {
          gift: giftWithDates,
          now,
        })
      )

      await updateRemoteWishlistActivity(listId, withActivity.activity)
      setWishlist(withActivity)
      await refresh()
      return withActivity
    }

    if (!shouldUseLocal) return null

    if (!current) return null

    return persistLocal(
      appendWishlistActivity(
        {
          ...current,
          gifts: current.gifts.map((item) =>
            item.id === gift.id ? giftWithDates : item
          ),
        },
        createWishlistActivity('gift_updated', {
          gift: giftWithDates,
          now,
        })
      )
    )
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
    let reservedGift: Gift | null = null
    const now = new Date().toISOString()
    const nextValue: Wishlist = {
      ...current,
      gifts: current.gifts.map((gift) => {
        if (gift.id !== giftId || gift.reserved) return gift

        reserved = true
        reservedGift = {
          ...gift,
          reserved: true,
          reservedBy: guest.name,
          reservedContact: guest.contact,
          reservedAt: now,
          updatedAt: now,
        }

        return reservedGift
      }),
    }

    if (!reserved) return false
    persistLocal(
      appendWishlistActivity(
        nextValue,
        createWishlistActivity('gift_reserved', {
          actor: guest.name,
          gift: reservedGift ?? undefined,
          now,
        })
      )
    )
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
    const current = findWishlist(listId)
    const releasedGift = current?.gifts.find((gift) => gift.id === giftId)
    const now = new Date().toISOString()

    if (shouldUseRemote) {
      const updated = await releaseRemoteGiftReservation(listId, giftId)
      const withActivity = appendWishlistActivity(
        updated,
        createWishlistActivity('reservation_released', {
          gift: releasedGift ?? updated.gifts.find((gift) => gift.id === giftId),
          now,
        })
      )

      await updateRemoteWishlistActivity(listId, withActivity.activity)
      setWishlist(withActivity)
      await refresh()
      return withActivity
    }

    if (!shouldUseLocal) return null

    if (!current) return null

    return persistLocal(
      appendWishlistActivity(
        {
          ...current,
          gifts: current.gifts.map((gift) =>
            gift.id === giftId
              ? {
                  ...gift,
                  reserved: false,
                  reservedBy: '',
                  reservedContact: '',
                  reservedAt: '',
                  updatedAt: now,
                }
              : gift
          ),
        },
        createWishlistActivity('reservation_released', {
          gift: releasedGift,
          now,
        })
      )
    )
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
