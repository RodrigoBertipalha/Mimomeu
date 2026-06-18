import { useState, type FormEvent } from 'react'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import type { Gift, ReservationGuest, WishlistKind } from '../../types/wishlist'
import {
  formatMoney,
  getGiftContributedAmount,
  getGiftFundingMode,
  getGiftRemainingAmount,
  getGiftTargetAmount,
  getGiftAvailableCount,
  getGiftQuantity,
  getGiftReservedCount,
  isGiftFinancial,
  normalizeMoneyAmount,
} from '../../utils/gifts'
import { getListTypeConfig, normalizeWishlistKind } from '../../utils/listTypes'
import Icon from '../ui/Icon'

type ReserveGiftModalProps = {
  gift: Gift
  listKind?: WishlistKind
  showPriceRange?: boolean
  isSubmitting?: boolean
  onCancel: () => void
  onConfirm: (guest: ReservationGuest) => void
}

function ReserveGiftModal({
  gift,
  listKind = 'gift',
  showPriceRange,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: ReserveGiftModalProps) {
  const normalizedListKind = normalizeWishlistKind(listKind)
  const config = getListTypeConfig(normalizedListKind)
  const shouldShowPriceRange = showPriceRange ?? config.showPriceRange
  const quantity = getGiftQuantity(gift)
  const reservedCount = getGiftReservedCount(gift)
  const availableCount = getGiftAvailableCount(gift)
  const isFinancial = isGiftFinancial(gift)
  const targetAmount = getGiftTargetAmount(gift)
  const contributedAmount = getGiftContributedAmount(gift)
  const remainingAmount = getGiftRemainingAmount(gift)
  const isSharedFunding = getGiftFundingMode(gift) === 'shared'
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [contributionAmount, setContributionAmount] = useState('')
  const [formError, setFormError] = useState('')
  useBodyScrollLock()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      setFormError(
        isFinancial
          ? 'Informe seu nome para confirmar a contribuição.'
          : 'Informe seu nome para confirmar a reserva.'
      )
      return
    }

    const amount = isFinancial
      ? isSharedFunding
        ? normalizeMoneyAmount(contributionAmount)
        : remainingAmount
      : undefined

    if (isFinancial && (!amount || amount <= 0)) {
      setFormError('Informe um valor de contribuição.')
      return
    }

    if (isFinancial && amount && amount > remainingAmount) {
      setFormError(`O valor máximo em aberto é ${formatMoney(remainingAmount)}.`)
      return
    }

    onConfirm({
      name: name.trim(),
      contact: contact.trim(),
      contributionAmount: amount,
    })
  }

  return (
    <div
      className="fixed inset-0 z-30 grid place-items-center overflow-y-auto bg-[var(--color-modal-backdrop)] px-4 py-8 backdrop-blur-md"
      onClick={onCancel}
    >
      <section
        className="ui-panel w-full max-w-xl p-6 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="ui-kicker">{config.reserveModalKicker}</p>
            <h2 className="mt-2 text-2xl font-extrabold">
              {isFinancial ? 'Confirmar contribuição' : config.reserveModalTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              {isFinancial
                ? 'Informe seus dados para registrar sua contribuição neste presente.'
                : config.reserveModalDescription}
            </p>
          </div>
          <button
            type="button"
            className="ui-button-secondary h-10 px-4"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Fechar
          </button>
        </div>

        <div className="mt-6 flex items-center gap-4 rounded-lg bg-[var(--color-bg-soft)] p-4">
          <div className="ui-photo ui-photo-gift h-20 w-20 shrink-0">
            {gift.imageUrl ? (
              <img
                src={gift.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[var(--color-primary-deep)]">
                <Icon name="gift" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="break-words text-base font-extrabold">{gift.name}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {isFinancial
                ? `${formatMoney(contributedAmount)} arrecadados de ${formatMoney(targetAmount)}`
                : shouldShowPriceRange
                ? gift.priceRange || 'Faixa de preço não informada'
                : `${reservedCount} de ${quantity} combinados · ${availableCount} em aberto`}
            </p>
          </div>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="ui-label">
            <span className="flex items-center justify-between gap-3">
              Seu nome
              <span className="text-[10px] font-bold text-[var(--color-primary-deep)]">
                Obrigatório
              </span>
            </span>
            <input
              className="ui-field"
              placeholder="Ex: Mariana Silva"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setFormError('')
              }}
              required
            />
          </label>

          {isFinancial ? (
            <label className="ui-label">
              <span className="flex items-center justify-between gap-3">
                Valor da contribuição
                <span className="text-[10px] font-bold text-[var(--color-primary-deep)]">
                  {isSharedFunding ? 'Obrigatório' : 'Valor cheio'}
                </span>
              </span>
              <input
                type="number"
                min="1"
                step="0.01"
                max={remainingAmount || undefined}
                className="ui-field"
                value={
                  isSharedFunding ? contributionAmount : String(remainingAmount)
                }
                placeholder={`Até ${formatMoney(remainingAmount)}`}
                disabled={!isSharedFunding || isSubmitting}
                onChange={(event) => {
                  setContributionAmount(event.target.value)
                  setFormError('')
                }}
              />
              <span className="text-xs font-semibold text-[var(--color-muted)]">
                {isSharedFunding
                  ? `Faltam ${formatMoney(remainingAmount)} para fechar.`
                  : `Você vai contribuir com ${formatMoney(remainingAmount)} e fechar este presente.`}
              </span>
            </label>
          ) : null}

          <label className="ui-label">
            <span className="flex items-center justify-between gap-3">
              Telefone ou e-mail
              <span className="text-[10px] font-semibold text-[var(--color-subtle)]">
                Opcional
              </span>
            </span>
            <input
              className="ui-field"
              placeholder="Opcional"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
            />
          </label>

          {formError ? (
            <p className="rounded-md bg-[rgba(198,29,29,0.1)] px-4 py-3 text-sm font-bold text-[var(--color-danger)]">
              {formError}
            </p>
          ) : null}

          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="ui-button-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="ui-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Confirmando...'
                : isFinancial
                  ? 'Confirmar contribuição'
                  : config.reserveConfirmLabel}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ReserveGiftModal
