import { useState, type FormEvent } from 'react'
import type { Wishlist, WishlistKind } from '../../types/wishlist'
import {
  getListTypeConfig,
  normalizeWishlistKind,
} from '../../utils/listTypes'
import {
  createDefaultWishlistOptions,
  normalizeWishlistOptions,
} from '../../utils/wishlistOptions'
import Icon from '../ui/Icon'
import ListOptionsEditor from './ListOptionsEditor'

type ListFormProps = {
  onSubmit: (value: Wishlist) => void
  initialValue?: Wishlist
  submitLabel?: string
  resetOnSubmit?: boolean
  title?: string
  description?: string
  framed?: boolean
  showOptionsSetup?: boolean
  submitDisabled?: boolean
  onCancel?: () => void
}

function createInitialState(): Wishlist {
  const now = new Date().toISOString()

  return {
    id: '',
    listKind: 'gift',
    title: '',
    eventDate: '',
    eventType: '',
    ownerName: '',
    message: '',
    options: createDefaultWishlistOptions('gift'),
    gifts: [],
    activity: [],
    createdAt: now,
    updatedAt: now,
  }
}

function ListForm({
  onSubmit,
  initialValue,
  submitLabel,
  resetOnSubmit = true,
  title,
  description,
  framed = true,
  showOptionsSetup = false,
  submitDisabled = false,
  onCancel,
}: ListFormProps) {
  const [formData, setFormData] = useState<Wishlist>(
    initialValue
      ? {
          ...initialValue,
          listKind: normalizeWishlistKind(initialValue.listKind),
          options: normalizeWishlistOptions(
            initialValue.options,
            initialValue.listKind
          ),
        }
      : createInitialState()
  )
  const [formError, setFormError] = useState('')

  function handleChange(field: keyof Wishlist, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFormError('')
  }

  function handleKindChange(value: WishlistKind) {
    const listKind = normalizeWishlistKind(value)
    const config = getListTypeConfig(listKind)

    setFormData((prev) => ({
      ...prev,
      listKind,
      eventType: config.defaultEventType,
      options: createDefaultWishlistOptions(listKind),
    }))
    setFormError('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const listKind = normalizeWishlistKind(formData.listKind)
    const config = getListTypeConfig(listKind)

    if (!formData.title.trim()) {
      setFormError('Informe o nome do evento para salvar a lista.')
      return
    }

    if (!formData.eventType) {
      setFormError(`Escolha ${config.eventLabel.toLowerCase()}.`)
      return
    }

    onSubmit({
      ...formData,
      listKind,
      options: normalizeWishlistOptions(formData.options, listKind),
    })
    if (resetOnSubmit) {
      setFormData(createInitialState())
    }
  }

  const listKind = normalizeWishlistKind(formData.listKind)
  const config = getListTypeConfig(listKind)

  return (
    <form
      className={framed ? 'ui-panel p-5 sm:p-6' : 'grid gap-5'}
      onSubmit={handleSubmit}
    >
      {title || description ? (
        <div className="space-y-1">
          {title ? <h2 className="text-base font-extrabold">{title}</h2> : null}
          {description ? (
            <p className="text-sm leading-6 text-[var(--color-muted)]">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-5">
        <label className="ui-label">
          <span className="flex items-center justify-between gap-3">
            Tipo da lista
            <span className="text-[10px] font-bold text-[var(--color-primary-deep)]">
              Obrigatório
            </span>
          </span>
          <select
            className="ui-field"
            value={listKind}
            onChange={(event) =>
              handleKindChange(event.target.value as WishlistKind)
            }
            required
          >
            <option value="gift">Lista de presentes</option>
            <option value="potluck">Confraternização</option>
          </select>
          <span className="text-xs font-semibold text-[var(--color-muted)]">
            {config.description}
          </span>
        </label>

        <label className="ui-label">
          <span className="flex items-center justify-between gap-3">
            Nome do evento
            <span className="text-[10px] font-bold text-[var(--color-primary-deep)]">
              Obrigatório
            </span>
          </span>
          <input
            className="ui-field"
            placeholder="Ex: Aniversário da Júlia"
            value={formData.title}
            onChange={(event) => handleChange('title', event.target.value)}
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="ui-label">
            <span className="flex items-center justify-between gap-3">
              {config.eventLabel}
              <span className="text-[10px] font-bold text-[var(--color-primary-deep)]">
                Obrigatório
              </span>
            </span>
            <select
              className="ui-field"
              value={formData.eventType}
              onChange={(event) => handleChange('eventType', event.target.value)}
              required
            >
              <option value="">{config.eventPlaceholder}</option>
              {config.eventTypes.map((eventType) => (
                <option key={eventType} value={eventType}>
                  {eventType}
                </option>
              ))}
            </select>
          </label>

          <label className="ui-label">
            <span className="flex items-center justify-between gap-3">
              Data do evento
              <span className="text-[10px] font-semibold text-[var(--color-subtle)]">
                Opcional
              </span>
            </span>
            <input
              type="date"
              className="ui-field"
              value={formData.eventDate}
              onChange={(event) => handleChange('eventDate', event.target.value)}
            />
          </label>
        </div>

        <label className="ui-label">
          <span className="flex items-center justify-between gap-3">
            Responsável
            <span className="text-[10px] font-semibold text-[var(--color-subtle)]">
              Opcional
            </span>
          </span>
          <input
            className="ui-field"
            placeholder="Seu nome"
            value={formData.ownerName}
            onChange={(event) => handleChange('ownerName', event.target.value)}
          />
        </label>

        <label className="ui-label">
          <span className="flex items-center justify-between gap-3">
            Descrição da lista
            <span className="text-[10px] font-semibold text-[var(--color-subtle)]">
              Opcional
            </span>
          </span>
          <textarea
            className="ui-field min-h-[136px] resize-y"
            placeholder="Conte um pouco sobre o evento ou deixe uma mensagem para seus convidados..."
            value={formData.message}
            onChange={(event) => handleChange('message', event.target.value)}
          />
        </label>

        {showOptionsSetup ? (
          <section className="grid gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-[var(--color-text)]">
                {config.optionsTitle}
              </h3>
              <p className="text-sm leading-6 text-[var(--color-muted)]">
                {config.optionsDescription}
              </p>
            </div>

            <ListOptionsEditor
              value={formData.options}
              listKind={listKind}
              onChange={(options) =>
                setFormData((prev) => ({ ...prev, options }))
              }
            />
          </section>
        ) : null}
      </div>

      {formError ? (
        <p className="rounded-md bg-[rgba(198,29,29,0.1)] px-4 py-3 text-sm font-bold text-[var(--color-danger)]">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {onCancel ? (
          <button
            type="button"
            className="ui-button-secondary w-full"
            onClick={onCancel}
          >
            Cancelar
          </button>
        ) : null}
        <button
          type="submit"
          className="ui-button-primary w-full"
          disabled={submitDisabled}
        >
          {submitLabel ?? 'Salvar lista'}
          {showOptionsSetup ? (
            <Icon name="arrow-right" className="h-5 w-5" />
          ) : null}
        </button>
      </div>
    </form>
  )
}

export default ListForm
