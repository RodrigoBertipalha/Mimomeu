import { useState, type FormEvent } from 'react'
import type { Wishlist } from '../../types/wishlist'
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
  onCancel?: () => void
}

function createInitialState(): Wishlist {
  const now = new Date().toISOString()

  return {
    id: '',
    title: '',
    eventDate: '',
    eventType: '',
    ownerName: '',
    message: '',
    options: createDefaultWishlistOptions(),
    gifts: [],
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
  onCancel,
}: ListFormProps) {
  const [formData, setFormData] = useState<Wishlist>(
    initialValue
      ? {
          ...initialValue,
          options: normalizeWishlistOptions(initialValue.options),
        }
      : createInitialState()
  )
  const [optionsMode, setOptionsMode] = useState<'default' | 'custom'>(
    initialValue ? 'custom' : 'default'
  )

  function handleChange(field: keyof Wishlist, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formData.title.trim()) return
    onSubmit({
      ...formData,
      options:
        showOptionsSetup && optionsMode === 'default'
          ? createDefaultWishlistOptions()
          : normalizeWishlistOptions(formData.options),
    })
    if (resetOnSubmit) {
      setFormData(createInitialState())
      setOptionsMode('default')
    }
  }

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
          Nome do evento
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
            Tipo de evento
            <select
              className="ui-field"
              value={formData.eventType}
              onChange={(event) => handleChange('eventType', event.target.value)}
              required
            >
              <option value="">Selecione uma opção</option>
              <option value="Aniversário">Aniversário</option>
              <option value="Casamento">Casamento</option>
              <option value="Chá de bebê">Chá de bebê</option>
              <option value="Formatura">Formatura</option>
              <option value="Confraternização">Confraternização</option>
              <option value="Casa nova">Casa nova</option>
              <option value="Outro">Outro</option>
            </select>
          </label>

          <label className="ui-label">
            Data do evento
            <input
              type="date"
              className="ui-field"
              value={formData.eventDate}
              onChange={(event) => handleChange('eventDate', event.target.value)}
            />
          </label>
        </div>

        <label className="ui-label">
          Responsável
          <input
            className="ui-field"
            placeholder="Seu nome"
            value={formData.ownerName}
            onChange={(event) => handleChange('ownerName', event.target.value)}
          />
        </label>

        <label className="ui-label">
          Descrição da lista
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
                Opções da lista
              </h3>
              <p className="text-sm leading-6 text-[var(--color-muted)]">
                Categorias e faixas usadas ao cadastrar presentes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-lg bg-[var(--color-bg-soft)] p-1">
              <button
                type="button"
                className={
                  optionsMode === 'default'
                    ? 'ui-button-primary h-11'
                    : 'ui-button-secondary h-11 border-transparent bg-transparent'
                }
                onClick={() => setOptionsMode('default')}
              >
                Padrão
              </button>
              <button
                type="button"
                className={
                  optionsMode === 'custom'
                    ? 'ui-button-primary h-11'
                    : 'ui-button-secondary h-11 border-transparent bg-transparent'
                }
                onClick={() => setOptionsMode('custom')}
              >
                Personalizar
              </button>
            </div>

            {optionsMode === 'custom' ? (
              <ListOptionsEditor
                value={formData.options}
                onChange={(options) =>
                  setFormData((prev) => ({ ...prev, options }))
                }
              />
            ) : (
              <div className="grid gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-4">
                <div className="flex flex-wrap gap-2">
                  {createDefaultWishlistOptions().categories.map((category) => (
                    <span
                      key={category}
                      className="ui-badge bg-[var(--color-card)] text-[var(--color-muted)]"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {createDefaultWishlistOptions().priceRanges.map(
                    (priceRange) => (
                      <span
                        key={priceRange}
                        className="ui-badge bg-[var(--color-card)] text-[var(--color-muted)]"
                      >
                        {priceRange}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </section>
        ) : null}
      </div>

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
        <button type="submit" className="ui-button-primary w-full">
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
