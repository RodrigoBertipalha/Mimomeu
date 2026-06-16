import { useState, type FormEvent } from 'react'
import type { Gift, ReservationGuest } from '../../types/wishlist'
import Icon from '../ui/Icon'

type ReserveGiftModalProps = {
  gift: Gift
  onCancel: () => void
  onConfirm: (guest: ReservationGuest) => void
}

function ReserveGiftModal({ gift, onCancel, onConfirm }: ReserveGiftModalProps) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return

    onConfirm({
      name: name.trim(),
      contact: contact.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-[var(--color-modal-backdrop)] px-4 backdrop-blur-md">
      <section className="ui-panel w-full max-w-xl p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="ui-kicker">Reserva de presente</p>
            <h2 className="mt-2 text-2xl font-extrabold">
              Confirmar reserva
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              Informe seus dados para que o anfitrião saiba quem reservou este
              presente.
            </p>
          </div>
          <button
            type="button"
            className="ui-icon-button"
            onClick={onCancel}
            aria-label="Cancelar reserva"
          >
            <Icon name="arrow-left" />
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
              {gift.priceRange || 'Faixa de preço não informada'}
            </p>
          </div>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="ui-label">
            Seu nome
            <input
              className="ui-field"
              placeholder="Ex: Mariana Silva"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label className="ui-label">
            Telefone ou e-mail
            <input
              className="ui-field"
              placeholder="Opcional"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
            />
          </label>

          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="ui-button-secondary"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button type="submit" className="ui-button-primary">
              Confirmar reserva
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ReserveGiftModal
