import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/authContext'
import ReserveGiftModal from '../components/gifts/ReserveGiftModal'
import PublicPreview from '../components/public/PublicPreview'
import Icon from '../components/ui/Icon'
import { useWishlist } from '../hooks/useWishlist'
import type { Gift, ReservationGuest, Wishlist } from '../types/wishlist'

function GuestListPage() {
  const { publicSlug, listId } = useParams()
  const { user } = useAuth()
  const { loadPublicWishlist, reservePublicGift } = useWishlist()
  const [list, setList] = useState<Wishlist | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingGift, setPendingGift] = useState<Gift | null>(null)
  const [reservedGift, setReservedGift] = useState<Gift | null>(null)

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
    if (gift.reserved) return
    setPendingGift(gift)
  }

  async function handleReserveConfirm(guest: ReservationGuest) {
    if (!pendingGift) return

    const success = await reservePublicGift(publicKey, pendingGift.id, guest)
    if (!success) {
      setPendingGift(null)
      setError('Este presente já foi reservado.')
      return
    }

    setReservedGift({
      ...pendingGift,
      reserved: true,
      reservedBy: guest.name,
      reservedContact: guest.contact,
    })
    setPendingGift(null)

    const updated = await loadPublicWishlist(publicKey)
    setList(updated)
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
          onCancel={() => setPendingGift(null)}
          onConfirm={handleReserveConfirm}
        />
      ) : null}

      {reservedGift ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-[rgba(36,39,33,0.28)] px-4 backdrop-blur-sm">
          <section className="ui-panel w-full max-w-xl p-8 text-center">
            <span className="mx-auto inline-flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-deep)]">
              <Icon name="check" className="h-12 w-12" />
            </span>
            <h2 className="mt-6 text-3xl font-extrabold">
              Reserva confirmada com sucesso!
            </h2>
            <p className="mt-4 text-sm text-[var(--color-muted)]">
              Você reservou: <strong>{reservedGift.name}</strong>
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
