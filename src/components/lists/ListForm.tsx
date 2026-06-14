import { useState, type FormEvent } from 'react'
import type { Wishlist } from '../../types/wishlist'

type ListFormProps = {
  onSubmit: (value: Wishlist) => void
  initialValue?: Wishlist
  submitLabel?: string
  resetOnSubmit?: boolean
  title?: string
  description?: string
  framed?: boolean
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
  onCancel,
}: ListFormProps) {
  const [formData, setFormData] = useState<Wishlist>(
    initialValue ?? createInitialState()
  )

  function handleChange(field: keyof Wishlist, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formData.title.trim()) return
    onSubmit(formData)
    if (resetOnSubmit) {
      setFormData(createInitialState())
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
        </button>
      </div>
    </form>
  )
}

export default ListForm
