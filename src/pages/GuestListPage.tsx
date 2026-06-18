import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/authContext'
import ReserveGiftModal from '../components/gifts/ReserveGiftModal'
import PublicPreview from '../components/public/PublicPreview'
import Icon from '../components/ui/Icon'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import { useWishlist } from '../hooks/useWishlist'
import type { Gift, ReservationGuest, Wishlist } from '../types/wishlist'
import {
  getGiftReservations,
  getGiftReservedCount,
  getGiftRemainingAmount,
  isGiftFinancial,
  isGiftFullyReserved,
  normalizeMoneyAmount,
  withGiftAvailability,
} from '../utils/gifts'
import { getListTypeConfig, normalizeWishlistKind } from '../utils/listTypes'
import { usesWishlistPriceRanges } from '../utils/wishlistOptions'

function GuestListPage() {
  const { publicSlug, listId } = useParams()
  const { user } = useAuth()
  const { loadPublicWishlist, reservePublicGift } = useWishlist()
  const [list, setList] = useState<Wishlist | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingGift, setPendingGift] = useState<Gift | null>(null)
  const [reservedGift, setReservedGift] = useState<Gift | null>(null)
  const [isReserving, setIsReserving] = useState(false)
  useBodyScrollLock(Boolean(reservedGift))

  const publicKey = publicSlug ?? listId ?? ''

  useEffect(() => {
    let active = true

    async function load() {
      if (!publicKey) return

      setIsLoading(true)
      setError('')

      try {
        const loaded = await loadPublicWishlist(publicKey)
        if (!active) return
        setList(loaded)
      } catch (loadError) {
        if (!active) return
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Não foi possível carregar a lista.'
        )
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [loadPublicWishlist, publicKey])

  function handleReserveRequest(gift: Gift) {
    if (isGiftFullyReserved(gift)) return
    setPendingGift(gift)
  }

  async function handleReserveConfirm(guest: ReservationGuest) {
    if (!pendingGift) return

    setIsReserving(true)
    setError('')

    try {
      const success = await reservePublicGift(publicKey, pendingGift.id, guest)
      if (!success) {
        setPendingGift(null)
        setError(
          getListTypeConfig(list?.listKind).alreadyReservedError
        )
        return
      }

      const now = new Date().toISOString()
      const contributionAmount = isGiftFinancial(pendingGift)
        ? Math.min(
            getGiftRemainingAmount(pendingGift),
            normalizeMoneyAmount(guest.contributionAmount) ||
              getGiftRemainingAmount(pendingGift)
          )
        : 0
      setReservedGift(withGiftAvailability({
        ...pendingGift,
        reservedCount: getGiftReservedCount(pendingGift) + 1,
        reservations: [
          ...getGiftReservations(pendingGift),
          {
            id: `reservation-${Date.now()}`,
            guestName: guest.name,
            guestContact: guest.contact,
            contributionAmount,
            createdAt: now,
          },
        ],
      }) as Gift)
      setPendingGift(null)

      const updated = await loadPublicWishlist(publicKey)
      setList(updated)
    } catch (reserveError) {
      setError(
        reserveError instanceof Error
          ? reserveError.message
          : 'Não foi possível confirmar a reserva. Tente novamente.'
      )
    } finally {
      setIsReserving(false)
    }
  }

  if (isLoading) {
    return (
      <section className="ui-panel mx-auto max-w-xl p-8 text-center">
        <p className="ui-kicker">Convite especial</p>
        <h1 className="mt-3 text-3xl font-extrabold">
          Carregando lista...
        </h1>
      </section>
    )
  }

  if (!list) {
    return (
      <section className="grid gap-5">
        <p className="ui-kicker">Convite não encontrado</p>
        <h1 className="text-4xl font-extrabold">
          Essa lista não está disponível.
        </h1>
        <p className="ui-muted max-w-xl">
          Confira se o link está correto ou peça um novo link para o anfitrião.
        </p>
        {error ? (
          <p className="rounded-md bg-[rgba(198,29,29,0.1)] px-4 py-3 text-sm font-bold text-[var(--color-danger)]">
            {error}
          </p>
        ) : null}
        <Link to="/" className="ui-button-primary w-fit">
          Voltar ao início
        </Link>
      </section>
    )
  }

  return (
    <section className="grid gap-8">
      {user ? (
        <Link
          to={`/list/${list.id}`}
          className="ui-link inline-flex w-fit items-center gap-2"
        >
          <Icon name="arrow-left" className="h-4 w-4" />
          Voltar para gestão
        </Link>
      ) : null}

      {error ? (
        <p className="rounded-md bg-[rgba(198,29,29,0.1)] px-4 py-3 text-sm font-bold text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      <PublicPreview list={list} onReserve={handleReserveRequest} />

      {pendingGift ? (
        <ReserveGiftModal
          gift={pendingGift}
          listKind={list.listKind}
          showPriceRange={usesWishlistPriceRanges(list.options)}
          isSubmitting={isReserving}
          onCancel={() => setPendingGift(null)}
          onConfirm={handleReserveConfirm}
        />
      ) : null}

      {reservedGift ? (
        <div
          className="fixed inset-0 z-30 grid place-items-center overflow-y-auto bg-[var(--color-modal-backdrop)] px-4 py-8 backdrop-blur-md"
          onClick={() => setReservedGift(null)}
        >
          <section
            className="ui-panel w-full max-w-xl p-8 text-center"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="mx-auto inline-flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-contrast)]">
              <Icon name="check" className="h-12 w-12" />
            </span>
            <h2 className="mt-6 text-3xl font-extrabold">
              {getListTypeConfig(normalizeWishlistKind(list.listKind))
                .reserveSuccessTitle}
            </h2>
            <p className="mt-4 text-sm text-[var(--color-muted)]">
              {
                getListTypeConfig(normalizeWishlistKind(list.listKind))
                  .reserveSuccessPrefix
              }{' '}
              <strong>{reservedGift.name}</strong>
            </p>
            <button
              type="button"
              className="ui-button-primary mx-auto mt-8 w-full max-w-sm"
              onClick={() => setReservedGift(null)}
            >
              Voltar para lista
            </button>
          </section>
        </div>
      ) : null}
    </section>
  )
}

export default GuestListPage
