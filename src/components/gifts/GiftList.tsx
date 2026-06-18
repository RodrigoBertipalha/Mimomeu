import type { Gift, WishlistKind } from '../../types/wishlist'
import {
  formatMoney,
  getGiftAvailableCount,
  getGiftContributedAmount,
  getGiftFundingMode,
  getGiftQuantity,
  getGiftRemainingAmount,
  getGiftReservedCount,
  getGiftReservations,
  getGiftTargetAmount,
  isGiftFinancial,
  isGiftFullyReserved,
} from '../../utils/gifts'
import { getListTypeConfig, normalizeWishlistKind } from '../../utils/listTypes'
import Icon from '../ui/Icon'

type GiftListProps = {
  gifts: Gift[]
  listKind?: WishlistKind
  showCategories?: boolean
  showPriceRange?: boolean
  onReserve?: (gift: Gift) => void
  onReleaseReserve?: (gift: Gift) => void
  onEdit?: (gift: Gift) => void
  emptyTitle?: string
  emptyDescription?: string
}

const photoClasses = ['ui-photo-gift', 'ui-photo-table', 'ui-photo-kitchen']

function priorityClass(priority: Gift['priority']) {
  if (priority === 'Alta') {
    return 'border-[rgba(255,181,154,0.38)] bg-[rgba(255,181,154,0.14)] text-[var(--color-secondary-deep)]'
  }

  if (priority === 'Média') {
    return 'border-[rgba(190,205,164,0.34)] bg-[rgba(190,205,164,0.13)] text-[var(--color-primary-deep)]'
  }

  return 'border-[rgba(255,255,255,0.16)] bg-[rgba(17,19,22,0.46)] text-[var(--color-muted)]'
}

function GiftList({
  gifts,
  listKind = 'gift',
  showCategories = true,
  showPriceRange,
  onReserve,
  onReleaseReserve,
  onEdit,
  emptyTitle,
  emptyDescription,
}: GiftListProps) {
  const normalizedListKind = normalizeWishlistKind(listKind)
  const config = getListTypeConfig(normalizedListKind)
  const shouldShowPriceRange = showPriceRange ?? config.showPriceRange

  if (!gifts.length) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-line)] bg-[var(--color-empty-bg)] p-8 text-center shadow-[var(--shadow-soft)]">
        <p className="text-sm font-bold text-[var(--color-text)]">
          {emptyTitle ?? `Nenhum ${config.itemSingular} cadastrado`}
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {emptyDescription ??
            `Quando você adicionar ${config.itemPlural}, eles aparecem aqui.`}
        </p>
      </div>
    )
  }

  return (
    <div
      className={
        onEdit
          ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
          : 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3'
      }
    >
      {gifts.map((gift, index) => {
        const quantity = getGiftQuantity(gift)
        const reservedCount = getGiftReservedCount(gift)
        const availableCount = getGiftAvailableCount(gift)
        const isFull = isGiftFullyReserved(gift)
        const isFinancial = isGiftFinancial(gift)
        const targetAmount = getGiftTargetAmount(gift)
        const contributedAmount = getGiftContributedAmount(gift)
        const remainingAmount = getGiftRemainingAmount(gift)
        const contributionProgress = targetAmount
          ? Math.min(100, Math.round((contributedAmount / targetAmount) * 100))
          : 0
        const reservations = getGiftReservations(gift)
        const photoClass = photoClasses[index % photoClasses.length]
        const photoContainerClass = onEdit
          ? `relative aspect-[4/5] overflow-hidden ${photoClass}`
          : `ui-photo relative aspect-[1.15/1] ${photoClass}`
        const badgeBase =
          'inline-flex min-h-8 items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-bold backdrop-blur-md'

        return (
          <article
            key={gift.id}
            className={
              onEdit
                ? 'ui-panel cursor-pointer overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary-deep)]'
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
            <div className={photoContainerClass}>
              {gift.imageUrl ? (
                <img
                  src={gift.imageUrl}
                  alt=""
                  className={
                    isFull && onEdit
                      ? 'h-full w-full object-cover opacity-60 grayscale-[30%] transition duration-700 hover:scale-105'
                      : 'h-full w-full object-cover transition duration-700 hover:scale-105'
                  }
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[var(--color-primary-deep)]">
                  <Icon name="gift" className="h-16 w-16 opacity-80" />
                </div>
              )}

              {onEdit ? (
                <button
                  type="button"
                  className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(17,19,22,0.74)] text-[var(--color-muted)] backdrop-blur-md transition hover:bg-[rgba(17,19,22,0.9)] hover:text-[var(--color-primary-deep)] focus:outline-none focus:ring-4 focus:ring-[rgba(141,163,130,0.2)]"
                  aria-label={`Editar ${gift.name}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    onEdit(gift)
                  }}
                >
                  <Icon name="edit" className="h-5 w-5" />
                </button>
              ) : null}

              {isFull && onEdit ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[rgba(17,19,22,0.16)]">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(51,53,56,0.72)] px-4 py-2 text-sm font-bold text-[var(--color-muted)] backdrop-blur-md">
                    <Icon name="lock" className="h-4 w-4" />
                    {config.reservedLabel}
                  </span>
                </div>
              ) : null}

              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                <span
                  className={
                    isFull
                      ? `${badgeBase} border-[rgba(255,255,255,0.14)] bg-[rgba(51,53,56,0.58)] text-[var(--color-muted)]`
                      : `${badgeBase} border-[rgba(190,205,164,0.34)] bg-[rgba(190,205,164,0.13)] text-[var(--color-primary-deep)]`
                  }
                >
                  {isFull
                    ? isFinancial
                      ? 'Meta completa'
                      : config.reservedLabel
                    : isFinancial
                      ? getGiftFundingMode(gift) === 'shared'
                        ? 'Presente em grupo'
                        : 'Valor cheio'
                    : normalizedListKind === 'potluck'
                      ? `Faltam ${availableCount}`
                      : config.availableLabel}
                </span>
                {config.showPriority && gift.priority ? (
                  <span className={`${badgeBase} ${priorityClass(gift.priority)}`}>
                    {gift.priority === 'Alta' ? (
                      <Icon name="star" className="h-3.5 w-3.5" />
                    ) : null}
                    {gift.priority} prioridade
                  </span>
                ) : null}
                {config.showDiscount && gift.hasDiscount ? (
                  <span
                    className={`${badgeBase} border-[rgba(190,205,164,0.34)] bg-[rgba(190,205,164,0.13)] text-[var(--color-primary-deep)]`}
                  >
                    Com desconto
                  </span>
                ) : null}
              </div>
            </div>

            <div className={onEdit ? 'p-5' : 'px-2 pb-2 pt-4'}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="break-words text-lg font-extrabold">
                    {gift.name}
                  </h3>
                  {showCategories ? (
                    <p className="mt-1 text-xs font-semibold text-[var(--color-muted)]">
                      {gift.category || (isFinancial ? 'Financeiro' : config.itemSingular)}
                    </p>
                  ) : null}
                </div>
                <span className="shrink-0 text-xs font-medium text-[var(--color-muted)]">
                  {isFinancial
                    ? `${contributionProgress}%`
                    : normalizedListKind === 'potluck'
                    ? `${reservedCount}/${quantity}`
                    : 'Qtd: 1'}
                </span>
              </div>

              {gift.note ? (
                <p className="mt-3 break-words text-sm leading-6 text-[var(--color-muted)]">
                  {gift.note}
                </p>
              ) : null}

              {isFinancial ? (
                <div className="mt-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-[var(--color-muted)]">
                        Arrecadado
                      </p>
                      <p className="mt-1 text-xl font-extrabold text-[var(--color-primary-deep)]">
                        {formatMoney(contributedAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-[var(--color-muted)]">
                        Meta
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-[var(--color-text)]">
                        {formatMoney(targetAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="ui-progress-track mt-3 h-2">
                    <div
                      className="ui-progress-value"
                      style={{ width: `${contributionProgress}%` }}
                    />
                  </div>
                  {!isFull ? (
                    <p className="mt-2 text-xs font-semibold text-[var(--color-muted)]">
                      Faltam {formatMoney(remainingAmount)}
                    </p>
                  ) : null}
                </div>
              ) : shouldShowPriceRange ? (
                <div className="mt-5">
                  <p className="text-xs font-medium text-[var(--color-muted)]">
                    Faixa de preço
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-[var(--color-primary-deep)]">
                    {gift.priceRange || 'A definir'}
                  </p>
                </div>
              ) : (
                <div className="mt-5">
                  <p className="text-xs font-medium text-[var(--color-muted)]">
                    Reservas combinadas
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-[var(--color-primary-deep)]">
                    {reservedCount} de {quantity}
                  </p>
                </div>
              )}

              {reservations.length ? (
                <div className="mt-3 rounded-md bg-[var(--color-bg-soft)] px-3 py-2 text-xs font-bold text-[var(--color-secondary-deep)]">
                  <p>
                    {isFinancial
                      ? 'Contribuíram:'
                      : normalizedListKind === 'potluck'
                      ? 'Vai levar:'
                      : 'Reservado por:'}{' '}
                    {reservations.map((reservation) => reservation.guestName).join(', ')}
                  </p>
                  {onEdit
                    ? reservations
                        .filter(
                          (reservation) =>
                            reservation.guestContact ||
                            reservation.contributionAmount
                        )
                        .map((reservation) => (
                          <p
                            key={reservation.id}
                            className="mt-1 font-semibold text-[var(--color-muted)]"
                          >
                            {reservation.guestName}: {' '}
                            {isFinancial
                              ? formatMoney(reservation.contributionAmount)
                              : reservation.guestContact}
                            {isFinancial && reservation.guestContact
                              ? ` · ${reservation.guestContact}`
                              : ''}
                          </p>
                        ))
                    : null}
                </div>
              ) : null}

              <div className="mt-5 grid gap-2">
                {onReserve ? (
                  <button
                    type="button"
                    className={
                      isFull
                        ? 'ui-button-secondary w-full cursor-not-allowed opacity-70'
                        : 'ui-button-primary w-full'
                    }
                    disabled={isFull}
                    onClick={(event) => {
                      event.stopPropagation()
                      onReserve(gift)
                    }}
                  >
                    <Icon name="heart" className="h-5 w-5" />
                    {isFull
                      ? isFinancial
                        ? 'Meta completa'
                        : config.unavailableLabel
                      : isFinancial
                        ? getGiftFundingMode(gift) === 'shared'
                          ? 'Contribuir com grupo'
                          : 'Contribuir valor cheio'
                        : config.reserveActionLabel}
                  </button>
                ) : null}

                {onReleaseReserve && reservedCount > 0 ? (
                  <button
                    type="button"
                    className="ui-button-secondary w-full"
                    onClick={(event) => {
                      event.stopPropagation()
                      onReleaseReserve(gift)
                    }}
                  >
                    {config.releaseActionLabel}
                  </button>
                ) : null}

                {config.showProductLink && gift.link ? (
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
