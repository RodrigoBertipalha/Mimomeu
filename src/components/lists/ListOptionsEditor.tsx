import { useState, type KeyboardEvent } from 'react'
import type { WishlistKind, WishlistOptions } from '../../types/wishlist'
import { getListTypeConfig, normalizeWishlistKind } from '../../utils/listTypes'
import {
  createDefaultWishlistOptions,
  usesWishlistCategories,
  usesWishlistPriceRanges,
} from '../../utils/wishlistOptions'
import Icon from '../ui/Icon'

type ListOptionsEditorProps = {
  value: WishlistOptions
  listKind?: WishlistKind
  onChange: (value: WishlistOptions) => void
}

type OptionGroupProps = {
  label: string
  addLabel: string
  placeholder: string
  values: string[]
  onChange: (values: string[]) => void
}

function cleanValues(values: string[]) {
  const seen = new Set<string>()

  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function OptionGroup({
  label,
  addLabel,
  placeholder,
  values,
  onChange,
}: OptionGroupProps) {
  const [draft, setDraft] = useState('')

  function handleUpdate(index: number, nextValue: string) {
    onChange(values.map((value, itemIndex) => (itemIndex === index ? nextValue : value)))
  }

  function handleBlur() {
    onChange(cleanValues(values))
  }

  function handleAdd() {
    const nextValue = draft.trim()
    if (!nextValue) return

    onChange(cleanValues([...values, nextValue]))
    setDraft('')
  }

  function handleRemove(index: number) {
    if (values.length <= 1) return
    onChange(values.filter((_, itemIndex) => itemIndex !== index))
  }

  function handleValueKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    event.currentTarget.blur()
  }

  function handleDraftKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    handleAdd()
  }

  return (
    <section className="grid gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-4">
      <p className="text-sm font-extrabold text-[var(--color-text)]">{label}</p>

      <div className="grid gap-2">
        {values.map((value, index) => (
          <div
            key={`${label}-${index}`}
            className="grid gap-2 sm:grid-cols-[1fr_auto]"
          >
            <input
              className="ui-field w-full"
              value={value}
              onBlur={handleBlur}
              onKeyDown={handleValueKeyDown}
              onChange={(event) => handleUpdate(index, event.target.value)}
            />
            <button
              type="button"
              className="ui-button-secondary h-11 px-4"
              disabled={values.length <= 1}
              aria-label={`Remover ${value}`}
              onClick={() => handleRemove(index)}
            >
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          className="ui-field w-full"
          placeholder={placeholder}
          value={draft}
          onKeyDown={handleDraftKeyDown}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button
          type="button"
          className="ui-button-secondary h-11"
          onClick={handleAdd}
        >
          <Icon name="plus" className="h-4 w-4" />
          {addLabel}
        </button>
      </div>
    </section>
  )
}

function ListOptionsEditor({
  value,
  listKind,
  onChange,
}: ListOptionsEditorProps) {
  const normalizedListKind = normalizeWishlistKind(listKind)
  const config = getListTypeConfig(normalizedListKind)
  const defaultOptions = createDefaultWishlistOptions(normalizedListKind)
  const defaultPriceRanges = defaultOptions.priceRanges.length
    ? defaultOptions.priceRanges
    : ['A combinar']
  const categoriesEnabled = usesWishlistCategories(value)
  const priceRangesEnabled = usesWishlistPriceRanges(value)
  const categories = categoriesEnabled ? value.categories : defaultOptions.categories
  const priceRanges = priceRangesEnabled
    ? value.priceRanges
    : defaultPriceRanges

  function handleToggleCategories(enabled: boolean) {
    onChange({
      ...value,
      categories: enabled ? defaultOptions.categories : [],
    })
  }

  function handleTogglePriceRanges(enabled: boolean) {
    onChange({
      ...value,
      priceRanges: enabled ? defaultPriceRanges : [],
    })
  }

  return (
    <div className="grid gap-4">
      <label className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-extrabold text-[var(--color-text)]">
        Usar categorias
        <input
          type="checkbox"
          className="h-4 w-4 accent-[var(--color-primary-deep)]"
          checked={categoriesEnabled}
          onChange={(event) => handleToggleCategories(event.target.checked)}
        />
      </label>

      {categoriesEnabled ? (
        <OptionGroup
          label={config.categoryGroupLabel}
          addLabel={config.categoryAddLabel}
          placeholder={config.categoryPlaceholder}
          values={categories}
          onChange={(categories) =>
            onChange({ ...value, categories: cleanValues(categories) })
          }
        />
      ) : null}

      <label className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-extrabold text-[var(--color-text)]">
        Usar faixas de preço
        <input
          type="checkbox"
          className="h-4 w-4 accent-[var(--color-primary-deep)]"
          checked={priceRangesEnabled}
          onChange={(event) => handleTogglePriceRanges(event.target.checked)}
        />
      </label>

      {priceRangesEnabled ? (
        <OptionGroup
          label="Faixas de preço"
          addLabel="Adicionar"
          placeholder="Nova faixa"
          values={priceRanges}
          onChange={(priceRanges) =>
            onChange({ ...value, priceRanges: cleanValues(priceRanges) })
          }
        />
      ) : null}
    </div>
  )
}

export default ListOptionsEditor
