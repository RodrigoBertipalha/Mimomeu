import { useMemo, useState } from 'react'
import type { Gift, Wishlist } from '../../types/wishlist'
import { normalizeWishlistOptions } from '../../utils/wishlistOptions'
import GiftList from '../gifts/GiftList'
import Icon from '../ui/Icon'

type PublicPreviewProps = {
  list: Wishlist
  onReserve?: (gift: Gift) => void
}

type StatusFilter = 'all' | 'available' | 'reserved'
type SortMode = 'priority' | 'available' | 'price' | 'name'

const priorityOrder: Record<Gift['priority'], number> = {
  Alta: 3,
  Média: 2,
  Baixa: 1,
  '': 0,
}

function uniqueClean(values: string[]) {
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

function rankByOption(value: string, options: string[]) {
  const index = options.findIndex(
    (option) => option.toLowerCase() === value.toLowerCase()
  )

  return index >= 0 ? index : Number.MAX_SAFE_INTEGER
}

function PublicPreview({ list, onReserve }: PublicPreviewProps) {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortMode, setSortMode] = useState<SortMode>('priority')
  const options = useMemo(
    () => normalizeWishlistOptions(list.options),
    [list.options]
  )
  const categoryOptions = useMemo(
    () =>
      uniqueClean([
        ...list.gifts.map((gift) => gift.category),
        ...options.categories,
      ]),
    [list.gifts, options.categories]
  )
  const priceRangeOptions = useMemo(
    () =>
      uniqueClean([
        ...options.priceRanges,
        ...list.gifts.map((gift) => gift.priceRange),
      ]),
    [list.gifts, options.priceRanges]
  )
  const filteredGifts = useMemo(() => {
    return [...list.gifts]
      .filter((gift) => {
        const matchesCategory =
          categoryFilter === 'all' || gift.category === categoryFilter
        const matchesPrice =
          priceFilter === 'all' || gift.priceRange === priceFilter
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'available' && !gift.reserved) ||
          (statusFilter === 'reserved' && gift.reserved)

        return matchesCategory && matchesPrice && matchesStatus
      })
      .sort((a, b) => {
        if (sortMode === 'available') {
          return (
            Number(a.reserved) - Number(b.reserved) ||
            priorityOrder[b.priority] - priorityOrder[a.priority] ||
            a.name.localeCompare(b.name, 'pt-BR')
          )
        }

        if (sortMode === 'price') {
          return (
            rankByOption(a.priceRange, priceRangeOptions) -
              rankByOption(b.priceRange, priceRangeOptions) ||
            priorityOrder[b.priority] - priorityOrder[a.priority] ||
            a.name.localeCompare(b.name, 'pt-BR')
          )
        }

        if (sortMode === 'name') {
          return a.name.localeCompare(b.name, 'pt-BR')
        }

        return (
          priorityOrder[b.priority] - priorityOrder[a.priority] ||
          Number(a.reserved) - Number(b.reserved) ||
          a.name.localeCompare(b.name, 'pt-BR')
        )
      })
  }, [categoryFilter, list.gifts, priceFilter, priceRangeOptions, sortMode, statusFilter])
  const hasActiveFilters =
    categoryFilter !== 'all' || priceFilter !== 'all' || statusFilter !== 'all'
  const eventName = list.title || 'sua lista'
  const ownerNames = list.ownerName || 'quem está celebrando'

  function clearFilters() {
    setCategoryFilter('all')
    setPriceFilter('all')
    setStatusFilter('all')
  }

  return (
    <section className="grid gap-8">
      <header className="grid items-start gap-8 lg:grid-cols-[1fr_180px]">
        <div>
          <span className="ui-badge bg-[var(--color-secondary-soft)] text-[var(--color-secondary-deep)]">
            Convite especial
          </span>
          <h2 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
            Você foi convidado para:{' '}
            <span className="italic text-[var(--color-primary-deep)]">
              {eventName}
            </span>
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--color-muted)]">
            Estamos muito felizes em compartilhar esse momento com você. Escolha
            um presente da lista de {ownerNames} para celebrar com carinho.
          </p>
        </div>

        <div className="ui-photo ui-photo-gift hidden aspect-square rounded-full border-[10px] border-[var(--color-photo-border)] shadow-[var(--shadow-soft)] lg:block" />
      </header>

      <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-translucent)] p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.1fr_auto]">
          <label className="ui-label">
            Categoria
            <select
              className="ui-field"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">Todas</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="ui-label">
            Faixa
            <select
              className="ui-field"
              value={priceFilter}
              onChange={(event) => setPriceFilter(event.target.value)}
            >
              <option value="all">Todas</option>
              {priceRangeOptions.map((priceRange) => (
                <option key={priceRange} value={priceRange}>
                  {priceRange}
                </option>
              ))}
            </select>
          </label>

          <label className="ui-label">
            Status
            <select
              className="ui-field"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
            >
              <option value="all">Todos</option>
              <option value="available">Disponíveis</option>
              <option value="reserved">Reservados</option>
            </select>
          </label>

          <label className="ui-label">
            Ordenar
            <select
              className="ui-field"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
            >
              <option value="priority">Mais desejados</option>
              <option value="available">Disponíveis primeiro</option>
              <option value="price">Menor faixa de preço</option>
              <option value="name">Nome A-Z</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              className="ui-button-secondary h-11 w-full px-4"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              <Icon name="filter" className="h-4 w-4" />
              Limpar
            </button>
          </div>
        </div>

        <p className="mt-3 text-sm font-semibold text-[var(--color-muted)]">
          {filteredGifts.length} de {list.gifts.length} presentes exibidos
        </p>
      </div>

      <GiftList
        gifts={filteredGifts}
        onReserve={onReserve}
        emptyTitle={
          list.gifts.length
            ? 'Nenhum presente encontrado'
            : 'Nenhum presente cadastrado'
        }
        emptyDescription={
          list.gifts.length
            ? 'Ajuste os filtros para ver outras opções da lista.'
            : 'Quando a lista tiver presentes, eles aparecem aqui.'
        }
      />
    </section>
  )
}

export default PublicPreview
