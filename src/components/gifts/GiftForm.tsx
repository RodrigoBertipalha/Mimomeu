import { useState, type ChangeEvent, type FormEvent } from 'react'
import type { Gift, GiftPriority } from '../../types/wishlist'
import Icon from '../ui/Icon'

type GiftFormProps = {
  onSubmit: (gift: Gift) => void
  initialValue?: Gift
  submitLabel?: string
  title?: string
  description?: string
  onCancel?: () => void
}

const blankState = {
  name: '',
  link: '',
  note: '',
  category: '',
  priceRange: '',
  imageUrl: '',
  hasDiscount: false,
  priority: '' as GiftPriority,
}

function createState(value?: Gift) {
  return value
    ? {
        name: value.name,
        link: value.link,
        note: value.note,
        category: value.category,
        priceRange: value.priceRange,
        imageUrl: value.imageUrl,
        hasDiscount: value.hasDiscount,
        priority: value.priority,
      }
    : blankState
}

function isValidUrl(value: string) {
  if (!value.trim()) return true

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function GiftForm({
  onSubmit,
  initialValue,
  submitLabel,
  title,
  description,
  onCancel,
}: GiftFormProps) {
  const [formData, setFormData] = useState(createState(initialValue))
  const [linkError, setLinkError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  function handleChange(field: keyof typeof blankState, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === 'link') setLinkError('')
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      window.alert('Escolha uma imagem de até 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleChange('imageUrl', reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formData.name.trim()) return

    if (!isValidUrl(formData.link)) {
      setLinkError('Informe uma URL começando com http:// ou https://.')
      return
    }

    onSubmit({
      id: initialValue?.id ?? `gift-${Date.now()}`,
      name: formData.name.trim(),
      link: formData.link.trim(),
      note: formData.note.trim(),
      category: formData.category.trim(),
      priceRange: formData.priceRange,
      imageUrl: formData.imageUrl,
      hasDiscount: formData.hasDiscount,
      priority: formData.priority,
      reserved: initialValue?.reserved ?? false,
      reservedBy: initialValue?.reservedBy ?? '',
      reservedContact: initialValue?.reservedContact ?? '',
    })

    if (!initialValue) {
      setFormData(blankState)
      setSuccessMessage('Presente adicionado à lista.')
      setTimeout(() => setSuccessMessage(''), 2500)
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      {title || description ? (
        <div className="text-center">
          {title ? (
            <h2 className="text-3xl font-extrabold text-[var(--color-primary-deep)]">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--color-muted)]">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <label className="ui-label">
        Imagem do presente
        <span className="ui-dropzone">
          {formData.imageUrl ? (
            <img
              src={formData.imageUrl}
              alt=""
              className="h-44 w-full rounded-lg object-cover"
            />
          ) : (
            <>
              <Icon name="camera" className="h-9 w-9 text-[var(--color-muted)]" />
              <span>Toque para carregar ou arraste uma foto</span>
              <span className="text-xs text-[var(--color-subtle)]">
                JPG, PNG até 5MB
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={handleImageChange}
          />
        </span>
      </label>

      <label className="ui-label">
        Nome do presente
        <input
          className="ui-field"
          placeholder="Ex: Tênis de corrida"
          value={formData.name}
          onChange={(event) => handleChange('name', event.target.value)}
          required
        />
      </label>

      <label className="ui-label">
        Descrição
        <textarea
          className="ui-field min-h-[112px] resize-y"
          placeholder="Conte detalhes como tamanho, cor ou preferência."
          value={formData.note}
          onChange={(event) => handleChange('note', event.target.value)}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="ui-label">
          Faixa de preço
          <select
            className="ui-field"
            value={formData.priceRange}
            onChange={(event) => handleChange('priceRange', event.target.value)}
          >
            <option value="">Selecione uma faixa</option>
            <option value="Até R$ 100">Até R$ 100</option>
            <option value="R$ 100 - 300">R$ 100 - 300</option>
            <option value="R$ 300 - 700">R$ 300 - 700</option>
            <option value="Acima de R$ 700">Acima de R$ 700</option>
          </select>
        </label>

        <label className="ui-label">
          Prioridade
          <select
            className="ui-field"
            value={formData.priority}
            onChange={(event) =>
              handleChange('priority', event.target.value as GiftPriority)
            }
          >
            <option value="">Sem prioridade</option>
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="ui-label">
          Categoria
          <input
            className="ui-field"
            placeholder="Ex: Cozinha"
            value={formData.category}
            onChange={(event) => handleChange('category', event.target.value)}
          />
        </label>

        <label className="ui-label">
          Desconto
          <span className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--color-line)] bg-[var(--color-card-soft)] px-3 text-sm font-semibold text-[var(--color-text)]">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--color-primary-deep)]"
              checked={formData.hasDiscount}
              onChange={(event) =>
                handleChange('hasDiscount', event.target.checked)
              }
            />
            Está com desconto
          </span>
        </label>
      </div>

      <label className="ui-label">
        Link do produto
        <input
          className="ui-field"
          placeholder="https://..."
          value={formData.link}
          onChange={(event) => handleChange('link', event.target.value)}
          aria-invalid={Boolean(linkError)}
        />
        {linkError ? (
          <span className="text-xs font-semibold text-[var(--color-danger)]">
            {linkError}
          </span>
        ) : null}
      </label>

      {successMessage ? (
        <p className="rounded-md bg-[var(--color-primary-soft)] px-4 py-3 text-sm font-bold text-[var(--color-primary-deep)]">
          {successMessage}
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
        <button type="submit" className="ui-button-primary w-full">
          {submitLabel ?? 'Adicionar presente'}
          <Icon name="gift" className="h-5 w-5" />
        </button>
      </div>
    </form>
  )
}

export default GiftForm
