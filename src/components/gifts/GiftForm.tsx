import { useState, type ChangeEvent, type FormEvent } from 'react'
import type {
  Gift,
  GiftFundingMode,
  GiftKind,
  GiftPriority,
  WishlistKind,
  WishlistOptions,
} from '../../types/wishlist'
import {
  formatMoney,
  getGiftQuantity,
  getGiftReservedCount,
  normalizeGiftFundingMode,
  normalizeGiftKind,
  normalizeGiftQuantity,
  normalizeMoneyAmount,
} from '../../utils/gifts'
import {
  getListTypeConfig,
  normalizeWishlistKind,
} from '../../utils/listTypes'
import {
  includeCurrentOption,
  normalizeWishlistOptions,
  usesWishlistCategories,
  usesWishlistPriceRanges,
} from '../../utils/wishlistOptions'
import Icon from '../ui/Icon'

type GiftFormProps = {
  onSubmit: (gift: Gift) => void
  initialValue?: Gift
  submitLabel?: string
  title?: string
  description?: string
  listKind?: WishlistKind
  options?: WishlistOptions
  previewGifts?: Gift[]
  listPreviewTitle?: string
  draftKey?: string
  allowDraftSave?: boolean
  onCancel?: () => void
}

type PreviewGift = Gift & { isDraft?: boolean }

const blankState = {
  giftKind: 'physical' as GiftKind,
  fundingMode: 'full' as GiftFundingMode,
  targetAmount: '',
  name: '',
  link: '',
  note: '',
  category: '',
  priceRange: '',
  imageUrl: '',
  hasDiscount: false,
  priority: '' as GiftPriority,
  quantity: '1',
}

type GiftFormState = typeof blankState

function createGiftId() {
  return `gift-${Date.now()}`
}

function normalizePriority(value: unknown): GiftPriority {
  return value === 'Baixa' || value === 'Média' || value === 'Alta' ? value : ''
}

function createState(value?: Gift): GiftFormState {
  return value
      ? {
        giftKind: normalizeGiftKind(value.giftKind),
        fundingMode: normalizeGiftFundingMode(value.fundingMode),
        targetAmount: value.targetAmount ? String(value.targetAmount) : '',
        name: value.name,
        link: value.link,
        note: value.note,
        category: value.category,
        priceRange: value.priceRange,
        imageUrl: value.imageUrl,
        hasDiscount: value.hasDiscount,
        priority: value.priority,
        quantity: String(value.quantity ?? 1),
      }
    : { ...blankState }
}

function loadDraft(draftKey?: string) {
  if (!draftKey) return null

  try {
    const raw = localStorage.getItem(draftKey)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<GiftFormState>

    return {
      ...blankState,
      name: parsed.name ?? '',
      giftKind: normalizeGiftKind(parsed.giftKind),
      fundingMode: normalizeGiftFundingMode(parsed.fundingMode),
      targetAmount:
        typeof parsed.targetAmount === 'string' ||
        typeof parsed.targetAmount === 'number'
          ? String(parsed.targetAmount)
          : '',
      link: parsed.link ?? '',
      note: parsed.note ?? '',
      category: parsed.category ?? '',
      priceRange: parsed.priceRange ?? '',
      imageUrl: parsed.imageUrl ?? '',
      hasDiscount: Boolean(parsed.hasDiscount),
      priority: normalizePriority(parsed.priority),
      quantity:
        typeof parsed.quantity === 'string' || typeof parsed.quantity === 'number'
          ? String(parsed.quantity)
          : '1',
    }
  } catch {
    return null
  }
}

function hasDraftContent(value: GiftFormState) {
  return Boolean(
    value.name.trim() ||
      value.giftKind !== 'physical' ||
      value.fundingMode !== 'full' ||
      value.targetAmount.trim() ||
      value.link.trim() ||
      value.note.trim() ||
      value.category.trim() ||
      value.priceRange ||
      value.imageUrl ||
      value.hasDiscount ||
      value.priority ||
      value.quantity !== '1'
  )
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

function createPreviewGift(
  formData: GiftFormState,
  initialValue?: Gift
): PreviewGift | null {
  if (!hasDraftContent(formData)) return null

  return {
    id: initialValue?.id ?? 'gift-draft-preview',
    giftKind: normalizeGiftKind(formData.giftKind),
    fundingMode: normalizeGiftFundingMode(formData.fundingMode),
    targetAmount: normalizeMoneyAmount(formData.targetAmount),
    contributedAmount: initialValue?.contributedAmount ?? 0,
    name: formData.name.trim() || 'Presente em rascunho',
    link: formData.link.trim(),
    note: formData.note.trim(),
    category: formData.category.trim(),
    priceRange: formData.priceRange,
    imageUrl: formData.imageUrl,
    hasDiscount: formData.hasDiscount,
    priority: formData.priority,
    quantity: normalizeGiftQuantity(formData.quantity),
    reserved: initialValue?.reserved ?? false,
    reservedBy: initialValue?.reservedBy ?? '',
    reservedContact: initialValue?.reservedContact ?? '',
    reservedCount: initialValue?.reservedCount ?? 0,
    reservations: initialValue?.reservations ?? [],
    createdAt: initialValue?.createdAt,
    updatedAt: initialValue?.updatedAt,
    reservedAt: initialValue?.reservedAt,
    isDraft: !initialValue,
  }
}

function createPreviewItems(
  previewGifts: Gift[],
  draftGift: PreviewGift | null,
  initialValue?: Gift
) {
  if (initialValue) {
    const hasInitialGift = previewGifts.some((gift) => gift.id === initialValue.id)

    if (!hasInitialGift && draftGift) return [draftGift, ...previewGifts]

    return previewGifts.map((gift) =>
      gift.id === initialValue.id && draftGift ? draftGift : gift
    )
  }

  return draftGift ? [draftGift, ...previewGifts] : previewGifts
}

function GiftPreviewList({
  gifts,
  title,
  listKind,
  showPriceRange,
}: {
  gifts: PreviewGift[]
  title: string
  listKind: WishlistKind
  showPriceRange: boolean
}) {
  const config = getListTypeConfig(listKind)
  const countLabel = `${gifts.length} ${gifts.length === 1 ? 'item' : 'itens'}`

  return (
    <aside className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-4 lg:sticky lg:top-4">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] pb-4">
        <h3 className="text-xl font-extrabold">{title}</h3>
        <span className="ui-badge shrink-0 bg-[var(--color-card)] text-[var(--color-muted)]">
          {countLabel}
        </span>
      </div>

      {gifts.length ? (
        <div className="mt-4 grid max-h-[430px] gap-3 overflow-y-auto pr-1">
          {gifts.slice(0, 7).map((gift) => (
            <article
              key={gift.isDraft ? 'draft-preview' : gift.id}
              className={
                gift.reserved
                  ? 'flex items-center gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-card)] p-3 opacity-70'
                  : 'flex items-center gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-card)] p-3'
              }
            >
              <div className="ui-photo h-16 w-16 shrink-0 rounded-md">
                {gift.imageUrl ? (
                  <img
                    src={gift.imageUrl}
                    alt=""
                    className={
                      gift.reserved
                        ? 'h-full w-full object-cover grayscale'
                        : 'h-full w-full object-cover'
                    }
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--color-primary-deep)]">
                    <Icon name="gift" className="h-7 w-7 opacity-80" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4
                    className={
                      gift.reserved
                        ? 'truncate text-sm font-extrabold line-through decoration-[var(--color-muted)]'
                        : 'truncate text-sm font-extrabold'
                    }
                  >
                    {gift.name}
                  </h4>
                  {gift.priority === 'Alta' ? (
                    <Icon
                      name="star"
                      className="h-3.5 w-3.5 shrink-0 text-[var(--color-secondary-deep)]"
                    />
                  ) : null}
                </div>

                <p className="mt-1 flex items-center gap-1 truncate text-sm font-semibold text-[var(--color-muted)]">
                  {gift.reserved ? (
                    <>
                      <Icon name="lock" className="h-3.5 w-3.5 shrink-0" />
                      Reservado
                    </>
                  ) : (
                    gift.giftKind === 'financial'
                      ? `Meta ${formatMoney(gift.targetAmount)}`
                      : showPriceRange
                      ? gift.priceRange || 'Faixa a definir'
                      : `${getGiftReservedCount(gift)} de ${getGiftQuantity(
                          gift
                        )} combinados`
                  )}
                </p>

                {gift.isDraft ? (
                  <span className="mt-2 inline-flex rounded-md border border-[rgba(190,205,164,0.34)] bg-[rgba(190,205,164,0.13)] px-2 py-1 text-xs font-bold text-[var(--color-primary-deep)]">
                    Rascunho
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-[var(--color-line)] bg-[var(--color-card)] p-5 text-center">
          <p className="text-sm font-bold text-[var(--color-text)]">
            Nenhum item na lista
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            O primeiro {config.itemSingular} aparece aqui enquanto você preenche.
          </p>
        </div>
      )}

      <p className="mt-4 border-t border-[var(--color-line)] pt-4 text-center text-sm leading-6 text-[var(--color-muted)]">
        Itens adicionados aparecem aqui em tempo real.
      </p>
    </aside>
  )
}

function GiftForm({
  onSubmit,
  initialValue,
  submitLabel,
  title,
  description,
  listKind = 'gift',
  options,
  previewGifts = [],
  listPreviewTitle = 'Prévia da sua lista',
  draftKey,
  allowDraftSave = false,
  onCancel,
}: GiftFormProps) {
  const normalizedListKind = normalizeWishlistKind(listKind)
  const config = getListTypeConfig(normalizedListKind)
  const [formData, setFormData] = useState(() =>
    initialValue ? createState(initialValue) : loadDraft(draftKey) ?? createState()
  )
  const [linkError, setLinkError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [draftMessage, setDraftMessage] = useState('')
  const [formError, setFormError] = useState('')
  const wishlistOptions = normalizeWishlistOptions(options, normalizedListKind)
  const showCategories = usesWishlistCategories(wishlistOptions)
  const priceRangesEnabled = usesWishlistPriceRanges(wishlistOptions)
  const canUseFinancialGift = normalizedListKind === 'gift'
  const currentGiftKind = canUseFinancialGift
    ? normalizeGiftKind(formData.giftKind)
    : 'physical'
  const isFinancialGift = currentGiftKind === 'financial'
  const currentFundingMode = normalizeGiftFundingMode(formData.fundingMode)
  const showPriceRange = priceRangesEnabled && !isFinancialGift
  const showDiscount = config.showDiscount && !isFinancialGift
  const categoryOptions = includeCurrentOption(
    wishlistOptions.categories,
    formData.category
  )
  const priceRangeOptions = includeCurrentOption(
    wishlistOptions.priceRanges,
    formData.priceRange
  )
  const draftPreviewGift = createPreviewGift(formData, initialValue)
  const previewItems = createPreviewItems(
    previewGifts,
    draftPreviewGift,
    initialValue
  )

  function handleChange(field: keyof GiftFormState, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFormError('')
    setDraftMessage('')
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

  function handleSaveDraft() {
    if (!draftKey) return

    if (!hasDraftContent(formData)) {
      setDraftMessage('Preencha algum detalhe antes de guardar.')
      return
    }

    localStorage.setItem(draftKey, JSON.stringify(formData))
    setDraftMessage('Rascunho guardado.')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formData.name.trim()) {
      setFormError(`Informe o nome do ${config.itemSingular} para adicionar à lista.`)
      return
    }

    const now = new Date().toISOString()
    const nextQuantity = config.showQuantity
      ? normalizeGiftQuantity(formData.quantity)
      : 1
    const nextTargetAmount = isFinancialGift
      ? normalizeMoneyAmount(formData.targetAmount)
      : 0

    if (
      config.showQuantity &&
      initialValue &&
      nextQuantity < getGiftReservedCount(initialValue)
    ) {
      setFormError(
        `Este item já tem ${getGiftReservedCount(
          initialValue
        )} reservas. Libere reservas antes de reduzir o total.`
      )
      return
    }

    if (isFinancialGift && nextTargetAmount <= 0) {
      setFormError('Informe a meta financeira deste presente.')
      return
    }

    if (
      isFinancialGift &&
      initialValue &&
      nextTargetAmount < normalizeMoneyAmount(initialValue.contributedAmount)
    ) {
      setFormError(
        'A meta não pode ficar abaixo do valor que já foi contribuído.'
      )
      return
    }

    if (config.showProductLink && !isValidUrl(formData.link)) {
      setLinkError('Informe uma URL começando com http:// ou https://.')
      return
    }

    onSubmit({
      id: initialValue?.id ?? createGiftId(),
      giftKind: currentGiftKind,
      fundingMode: isFinancialGift ? currentFundingMode : 'full',
      targetAmount: nextTargetAmount,
      contributedAmount: initialValue?.contributedAmount ?? 0,
      name: formData.name.trim(),
      link: config.showProductLink ? formData.link.trim() : '',
      note: formData.note.trim(),
      category: showCategories ? formData.category.trim() : '',
      priceRange: showPriceRange ? formData.priceRange : '',
      imageUrl: config.showImage ? formData.imageUrl : '',
      hasDiscount: showDiscount ? formData.hasDiscount : false,
      priority: config.showPriority ? formData.priority : '',
      quantity: isFinancialGift ? 1 : nextQuantity,
      reserved: initialValue?.reserved ?? false,
      reservedBy: initialValue?.reservedBy ?? '',
      reservedContact: initialValue?.reservedContact ?? '',
      reservedCount: initialValue?.reservedCount ?? 0,
      reservations: initialValue?.reservations ?? [],
      createdAt: initialValue?.createdAt ?? now,
      updatedAt: now,
      reservedAt: initialValue?.reservedAt ?? '',
    })

    if (draftKey) localStorage.removeItem(draftKey)

    if (!initialValue) {
      setFormData(createState())
      setSuccessMessage(`${config.itemSingular[0].toUpperCase()}${config.itemSingular.slice(1)} adicionado à lista.`)
      setDraftMessage('')
      setTimeout(() => setSuccessMessage(''), 2500)
    }
  }

  return (
    <form
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5">
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

        {canUseFinancialGift ? (
          <div className="grid gap-4 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-4">
            <label className="ui-label">
              Tipo do presente
              <select
                className="ui-field"
                value={currentGiftKind}
                onChange={(event) =>
                  handleChange('giftKind', event.target.value)
                }
              >
                <option value="physical">Presente comum</option>
                <option value="financial">Presente financeiro</option>
              </select>
            </label>

            {isFinancialGift ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="ui-label">
                  <span className="flex items-center justify-between gap-3">
                    Meta do presente
                    <span className="text-[10px] font-bold text-[var(--color-primary-deep)]">
                      Obrigatório
                    </span>
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    className="ui-field"
                    placeholder="Ex: 2400"
                    value={formData.targetAmount}
                    onChange={(event) =>
                      handleChange('targetAmount', event.target.value)
                    }
                  />
                </label>

                <label className="ui-label">
                  Forma de contribuição
                  <select
                    className="ui-field"
                    value={currentFundingMode}
                    onChange={(event) =>
                      handleChange('fundingMode', event.target.value)
                    }
                  >
                    <option value="full">Uma pessoa fecha o valor</option>
                    <option value="shared">Várias pessoas contribuem</option>
                  </select>
                </label>
              </div>
            ) : null}
          </div>
        ) : null}

        {config.showImage ? (
          <label className="ui-label">
            <span className="flex items-center justify-between gap-3">
              {config.itemImageLabel}
              <span className="text-[10px] font-semibold text-[var(--color-subtle)]">
                Opcional
              </span>
            </span>
            <span className="ui-dropzone">
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt=""
                  className="h-44 w-full rounded-lg object-cover"
                />
              ) : (
                <>
                  <Icon
                    name="camera"
                    className="h-9 w-9 text-[var(--color-muted)]"
                  />
                  <span>{config.itemImageEmptyLabel}</span>
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
        ) : null}

        <label className="ui-label">
          <span className="flex items-center justify-between gap-3">
            {config.itemNameLabel}
            <span className="text-[10px] font-bold text-[var(--color-primary-deep)]">
              Obrigatório
            </span>
          </span>
          <input
            className="ui-field"
            placeholder={config.itemNamePlaceholder}
            value={formData.name}
            onChange={(event) => handleChange('name', event.target.value)}
            required
          />
        </label>

        <label className="ui-label">
          <span className="flex items-center justify-between gap-3">
            {config.itemDescriptionLabel}
            <span className="text-[10px] font-semibold text-[var(--color-subtle)]">
              Opcional
            </span>
          </span>
          <textarea
            className="ui-field min-h-[112px] resize-y"
            placeholder={config.itemDescriptionPlaceholder}
            value={formData.note}
            onChange={(event) => handleChange('note', event.target.value)}
          />
        </label>

        {showPriceRange || config.showPriority ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {showPriceRange ? (
              <label className="ui-label">
                <span className="flex items-center justify-between gap-3">
                  Faixa de preço
                  <span className="text-[10px] font-semibold text-[var(--color-subtle)]">
                    Opcional
                  </span>
                </span>
                <select
                  className="ui-field"
                  value={formData.priceRange}
                  onChange={(event) =>
                    handleChange('priceRange', event.target.value)
                  }
                >
                  <option value="">Selecione uma faixa</option>
                  {priceRangeOptions.map((priceRange) => (
                    <option key={priceRange} value={priceRange}>
                      {priceRange}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {config.showPriority ? (
              <label className="ui-label">
                <span className="flex items-center justify-between gap-3">
                  Prioridade
                  <span className="text-[10px] font-semibold text-[var(--color-subtle)]">
                    Opcional
                  </span>
                </span>
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
            ) : null}
          </div>
        ) : null}

        {showCategories || config.showQuantity || showDiscount ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {showCategories ? (
              <label className="ui-label">
                <span className="flex items-center justify-between gap-3">
                  Categoria
                  <span className="text-[10px] font-semibold text-[var(--color-subtle)]">
                    Opcional
                  </span>
                </span>
                <select
                  className="ui-field"
                  value={formData.category}
                  onChange={(event) =>
                    handleChange('category', event.target.value)
                  }
                >
                  <option value="">Selecione uma categoria</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {config.showQuantity ? (
            <label className="ui-label">
              <span className="flex items-center justify-between gap-3">
                {config.quantityLabel}
                <span className="text-[10px] font-bold text-[var(--color-primary-deep)]">
                  Obrigatório
                </span>
              </span>
              <input
                type="number"
                min="1"
                max="99"
                className="ui-field"
                value={formData.quantity}
                onChange={(event) =>
                  handleChange('quantity', event.target.value)
                }
              />
              <span className="text-xs font-semibold text-[var(--color-muted)]">
                {config.quantityHelp}
              </span>
            </label>
            ) : null}

            {showDiscount ? (
            <label className="ui-label">
              <span className="flex items-center justify-between gap-3">
                Desconto
                <span className="text-[10px] font-semibold text-[var(--color-subtle)]">
                  Opcional
                </span>
              </span>
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
            ) : null}
          </div>
        ) : null}

        {config.showProductLink ? (
          <label className="ui-label">
            <span className="flex items-center justify-between gap-3">
              Link do produto
              <span className="text-[10px] font-semibold text-[var(--color-subtle)]">
                Opcional
              </span>
            </span>
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
        ) : null}

        {formError ? (
          <p className="rounded-md bg-[rgba(198,29,29,0.1)] px-4 py-3 text-sm font-bold text-[var(--color-danger)]">
            {formError}
          </p>
        ) : null}

        {draftMessage ? (
          <p className="rounded-md bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-bold text-[var(--color-secondary-deep)]">
            {draftMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-md bg-[var(--color-primary-soft)] px-4 py-3 text-sm font-bold text-[var(--color-primary-deep)]">
            {successMessage}
          </p>
        ) : null}

        <div
          className={
            allowDraftSave && draftKey && !initialValue
              ? 'grid gap-3 sm:grid-cols-[1fr_1fr_1.35fr]'
              : 'grid gap-3 sm:grid-cols-2'
          }
        >
          {onCancel ? (
            <button
              type="button"
              className="ui-button-secondary w-full"
              onClick={onCancel}
            >
              Cancelar
            </button>
          ) : null}
          {allowDraftSave && draftKey && !initialValue ? (
            <button
              type="button"
              className="ui-button-secondary w-full"
              onClick={handleSaveDraft}
            >
              <Icon name="save" className="h-5 w-5" />
              Guardar rascunho
            </button>
          ) : null}
          <button type="submit" className="ui-button-primary w-full">
            {submitLabel ?? config.addItemLabel}
            <Icon name="gift" className="h-5 w-5" />
          </button>
        </div>
      </div>

      <GiftPreviewList
        gifts={previewItems}
        title={listPreviewTitle}
        listKind={normalizedListKind}
        showPriceRange={priceRangesEnabled}
      />
    </form>
  )
}

export default GiftForm
