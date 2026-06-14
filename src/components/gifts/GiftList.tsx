import type { Gift } from '../../types/wishlist'
import Icon from '../ui/Icon'

type GiftListProps = {
  gifts: Gift[]
  onReserve?: (gift: Gift) => void
  onReleaseReserve?: (gift: Gift) => void
  onEdit?: (gift: Gift) => void
}

const photoClasses = ['ui-photo-gift', 'ui-photo-table', 'ui-photo-kitchen']

function priorityClass(priority: Gift['priority']) {
  if (priority === 'Alta') {
    return 'bg-[var(--color-tertiary-soft)] text-[var(--color-tertiary-deep)]'
  }

  if (priority === 'Média') {
    return 'bg-[var(--color-secondary-soft)] text-[var(--color-secondary-deep)]'
  }

  return 'bg-[rgba(119,119,116,0.13)] text-[var(--color-muted)]'
}

function GiftList({ gifts, onReserve, onReleaseReserve, onEdit }: GiftListProps) {
  if (!gifts.length) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-line)] bg-[rgba(255,253,248,0.78)] p-8 text-center shadow-[var(--shadow-soft)]">
        <p className="text-sm font-bold text-[var(--color-text)]">
          Nenhum presente cadastrado
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Quando você adicionar itens, eles aparecem aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {gifts.map((gift, index) => {
        const photoClass = photoClasses[index % photoClasses.length]

        return (
          <article
            key={gift.id}
            className={
              onEdit
                ? 'ui-panel cursor-pointer overflow-hidden p-3 transition hover:-translate-y-0.5 hover:border-[var(--color-primary-deep)]'
                : 'ui-panel overflow-hidden p-3'
            }
            role={onEdit ? 'button' : undefined}
            tabIndex={onEdit ? 0 : undefined}
            onClick={onEdit ? () => onEdit(gift) : undefined}
            onKeyDown={
              onEdit
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onEdit(gift)
                    }
                  }
                : undefined
            }
          >
            <div className={`ui-photo relative aspect-[1.15/1] ${photoClass}`}>
              {gift.imageUrl ? (
                <img
                  src={gift.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[var(--color-primary-deep)]">
                  <Icon name="gift" className="h-16 w-16 opacity-80" />
                </div>
              )}

              <span
                className={
                  gift.reserved
                    ? 'ui-badge absolute left-3 top-3 bg-[var(--color-tertiary-soft)] text-[var(--color-tertiary-deep)]'
                    : 'ui-badge absolute left-3 top-3 bg-[var(--color-primary-soft)] text-[var(--color-primary-deep)]'
                }
              >
                <span className="mr-1 h-2 w-2 rounded-full bg-current" />
                {gift.reserved ? 'Reservado' : 'Disponível'}
              </span>
            </div>

            <div className="px-2 pb-2 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="break-words text-lg font-extrabold">
                    {gift.name}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-[var(--color-muted)]">
                    {gift.category || 'Presente'}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-[var(--color-muted)]">
                  Qtd: 1
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {gift.priority ? (
                  <span className={`ui-badge ${priorityClass(gift.priority)}`}>
                    Prioridade {gift.priority}
                  </span>
                ) : null}
                {gift.hasDiscount ? (
                  <span className="ui-badge bg-[var(--color-primary-soft)] text-[var(--color-primary-deep)]">
                    Com desconto
                  </span>
                ) : null}
              </div>

              {gift.note ? (
                <p className="mt-3 break-words text-sm leading-6 text-[var(--color-muted)]">
                  {gift.note}
                </p>
              ) : null}

              <div className="mt-5">
                <p className="text-xs font-medium text-[var(--color-muted)]">
                  Faixa de preço
                </p>
                <p className="mt-1 text-xl font-extrabold text-[var(--color-primary-deep)]">
                  {gift.priceRange || 'A definir'}
                </p>
              </div>

              {gift.reservedBy ? (
                <div className="mt-3 rounded-md bg-[var(--color-bg-soft)] px-3 py-2 text-xs font-bold text-[var(--color-secondary-deep)]">
                  <p>Reservado por: {gift.reservedBy}</p>
                  {gift.reservedContact ? (
                    <p className="mt-1 font-semibold text-[var(--color-muted)]">
                      Contato: {gift.reservedContact}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-5 grid gap-2">
                {onEdit ? (
                  <button
                    type="button"
                    className="ui-button-secondary w-full"
                    onClick={(event) => {
                      event.stopPropagation()
                      onEdit(gift)
                    }}
                  >
                    Editar presente
                  </button>
                ) : null}

                {onReserve ? (
                  <button
                    type="button"
                    className={
                      gift.reserved
                        ? 'ui-button-secondary w-full cursor-not-allowed opacity-70'
                        : 'ui-button-primary w-full'
                    }
                    disabled={gift.reserved}
                    onClick={(event) => {
                      event.stopPropagation()
                      onReserve(gift)
                    }}
                  >
                    <Icon name="heart" className="h-5 w-5" />
                    {gift.reserved ? 'Já reservado' : 'Reservar presente'}
                  </button>
                ) : null}

                {onReleaseReserve && gift.reserved ? (
                  <button
                    type="button"
                    className="ui-button-secondary w-full"
                    onClick={(event) => {
                      event.stopPropagation()
                      onReleaseReserve(gift)
                    }}
                  >
                    Liberar reserva
                  </button>
                ) : null}

                {gift.link ? (
                  <a
                    href={gift.link}
                    target="_blank"
                    rel="noreferrer"
                    className="ui-button-secondary w-full"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Ver produto
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default GiftList
