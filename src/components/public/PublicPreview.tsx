import type { Gift, Wishlist } from '../../types/wishlist'
import GiftList from '../gifts/GiftList'
import Icon from '../ui/Icon'

type PublicPreviewProps = {
  list: Wishlist
  onReserve?: (gift: Gift) => void
}

function PublicPreview({ list, onReserve }: PublicPreviewProps) {
  const categories = Array.from(
    new Set(list.gifts.map((gift) => gift.category).filter(Boolean))
  )
  const eventName = list.title || 'sua lista'
  const ownerNames = list.ownerName || 'quem está celebrando'

  return (
    <section className="grid gap-8">
      <header className="grid items-start gap-8 lg:grid-cols-[1fr_180px]">
        <div>
          <span className="ui-badge bg-[var(--color-secondary-soft)] text-[var(--color-secondary-deep)]">
            Convite especial
          </span>
          <h2 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
            Você foi convidado para:{' '}
            <span className="italic text-[var(--color-primary-deep)]">
              {eventName}
            </span>
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--color-muted)]">
            Estamos muito felizes em compartilhar esse momento com você. Escolha
            um presente da lista de {ownerNames} para celebrar com carinho.
          </p>
        </div>

        <div className="ui-photo ui-photo-gift hidden aspect-square rounded-full border-[10px] border-white shadow-[var(--shadow-soft)] lg:block" />
      </header>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-3">
          <span className="ui-badge bg-[var(--color-primary-deep)] text-white">
            Todos
          </span>
          {(categories.length ? categories : ['Cozinha', 'Decoração', 'Casa']).map(
            (category) => (
              <span
                key={category}
                className="ui-badge bg-[rgba(119,119,116,0.13)] text-[var(--color-muted)]"
              >
                {category}
              </span>
            )
          )}
        </div>

        <div className="flex items-center gap-3 text-sm font-bold text-[var(--color-secondary-deep)]">
          Ordenar:
          <span className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--color-bg-soft)] px-4 text-[var(--color-primary-deep)]">
            Mais desejados
            <Icon name="filter" className="h-4 w-4" />
          </span>
        </div>
      </div>

      <GiftList gifts={list.gifts} onReserve={onReserve} />
    </section>
  )
}

export default PublicPreview
