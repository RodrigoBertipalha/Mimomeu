import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import GiftForm from '../components/gifts/GiftForm'
import GiftList from '../components/gifts/GiftList'
import ListForm from '../components/lists/ListForm'
import ListOptionsEditor from '../components/lists/ListOptionsEditor'
import ShareCard from '../components/share/ShareCard'
import Icon from '../components/ui/Icon'
import Modal from '../components/ui/Modal'
import { useWishlist } from '../hooks/useWishlist'
import type { Gift, Wishlist, WishlistOptions } from '../types/wishlist'
import {
  createDefaultWishlistOptions,
  normalizeWishlistOptions,
} from '../utils/wishlistOptions'

function getListDetails(
  list: Wishlist,
  options: WishlistOptions = list.options
): Omit<Wishlist, 'gifts'> {
  return {
    id: list.id,
    publicSlug: list.publicSlug,
    title: list.title,
    eventDate: list.eventDate,
    eventType: list.eventType,
    ownerName: list.ownerName,
    message: list.message,
    options,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  }
}

function ListDetailPage() {
  const { listId } = useParams()
  const {
    findWishlist,
    updateWishlistDetails,
    addGift,
    updateGift,
    isLoading,
    error,
  } = useWishlist()
  const [query, setQuery] = useState('')
  const [isEditListOpen, setIsEditListOpen] = useState(false)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isAddGiftOpen, setIsAddGiftOpen] = useState(false)
  const [editingGift, setEditingGift] = useState<Gift | null>(null)
  const [optionsDraft, setOptionsDraft] = useState<WishlistOptions>(
    createDefaultWishlistOptions()
  )
  const [notice, setNotice] = useState('')

  const list = listId ? findWishlist(listId) : null

  const filteredGifts = useMemo(() => {
    if (!list) return []
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return list.gifts

    return list.gifts.filter((gift) =>
      [gift.name, gift.note, gift.category, gift.priority]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    )
  }, [list, query])

  function showNotice(message: string) {
    setNotice(message)
    setTimeout(() => setNotice(''), 2500)
  }

  function openOptionsModal() {
    if (!list) return
    setOptionsDraft(normalizeWishlistOptions(list.options))
    setIsOptionsOpen(true)
  }

  if (isLoading) {
    return (
      <section className="ui-panel mx-auto max-w-xl p-8 text-center">
        <p className="ui-kicker">Carregando</p>
        <h1 className="mt-3 text-3xl font-extrabold">
          Buscando dados da lista...
        </h1>
      </section>
    )
  }

  if (!list) {
    return (
      <section className="grid gap-5">
        <p className="ui-kicker">Lista não encontrada</p>
        <h1 className="text-4xl font-extrabold">Essa lista não está salva.</h1>
        <p className="ui-muted max-w-xl">
          Volte para Minhas listas e escolha uma lista criada na sua conta.
        </p>
        <Link to="/list" className="ui-button-primary w-fit">
          Voltar para minhas listas
        </Link>
      </section>
    )
  }

  const reservedCount = list.gifts.filter((gift) => gift.reserved).length
  const availableCount = list.gifts.length - reservedCount
  const progress = list.gifts.length
    ? Math.round((reservedCount / list.gifts.length) * 100)
    : 0

  return (
    <section className="grid gap-10">
      <header className="grid gap-5">
        <div>
          <Link to="/list" className="ui-link inline-flex items-center gap-2">
            <Icon name="arrow-left" className="h-4 w-4" />
            Minhas listas
          </Link>
          <p className="mt-5 text-xs font-semibold text-[var(--color-muted)]">
            {list.eventType || 'Evento'} ·{' '}
            {list.eventDate || 'Data não definida'}
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl">
            {list.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-muted)]">
            Acompanhe reservas, edite os dados da lista e gerencie os presentes
            cadastrados.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-translucent)] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              className="ui-button-secondary h-10 justify-center rounded-md px-4 text-xs"
              onClick={() => setIsEditListOpen(true)}
            >
              Editar lista
            </button>
            <button
              type="button"
              className="ui-button-secondary h-10 justify-center rounded-md px-4 text-xs"
              onClick={openOptionsModal}
            >
              <Icon name="filter" className="h-4 w-4" />
              Opções
            </button>
            <Link
              to={list.publicSlug ? `/g/${list.publicSlug}` : `/list/${list.id}/guest`}
              className="ui-button-secondary h-10 justify-center rounded-md px-4 text-xs"
            >
              <Icon name="heart" className="h-4 w-4" />
              Ver convidado
            </Link>
          </div>

          <button
            type="button"
            className="ui-button-primary h-10 justify-center rounded-md px-5 text-xs sm:min-w-40"
            onClick={() => setIsShareOpen(true)}
          >
            <Icon name="share" className="h-4 w-4" />
            Compartilhar
          </button>
        </div>
      </header>

      {notice ? (
        <p className="rounded-md bg-[var(--color-primary-soft)] px-4 py-3 text-sm font-bold text-[var(--color-primary-deep)]">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md bg-[rgba(198,29,29,0.1)] px-4 py-3 text-sm font-bold text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr_2.1fr]">
        <article className="ui-panel p-6">
          <p className="text-sm font-bold text-[var(--color-muted)]">
            Reservados
          </p>
          <p className="mt-7 text-4xl font-extrabold text-[var(--color-tertiary-deep)]">
            {reservedCount}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Presentes já escolhidos
          </p>
        </article>

        <article className="ui-panel p-6">
          <p className="text-sm font-bold text-[var(--color-muted)]">
            Disponíveis
          </p>
          <p className="mt-7 text-4xl font-extrabold text-[var(--color-primary-deep)]">
            {availableCount}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Presentes ainda livres
          </p>
        </article>

        <article className="rounded-lg border border-[var(--color-line)] bg-[var(--color-primary-soft)] p-6">
          <p className="text-sm font-bold text-[var(--color-primary-deep)]">
            Progresso da lista
          </p>
          <div className="mt-8 flex items-end justify-between gap-3">
            <p className="text-sm font-extrabold text-[var(--color-text)]">
              {reservedCount} de {list.gifts.length} reservados
            </p>
            <p className="text-sm font-extrabold text-[var(--color-primary-deep)]">
              {progress}%
            </p>
          </div>
          <div className="ui-progress-track mt-3">
            <div
              className="ui-progress-value"
              style={{ width: `${progress}%` }}
            />
          </div>
        </article>
      </section>

      <section className="grid gap-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="ui-kicker">Presentes</p>
            <h2 className="mt-1 text-3xl font-extrabold">Itens da lista</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(220px,320px)_auto]">
            <label className="relative">
              <Icon
                name="search"
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-muted)]"
              />
              <input
                className="ui-field w-full pl-12"
                placeholder="Pesquisar presente..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="ui-button-primary"
              onClick={() => setIsAddGiftOpen(true)}
            >
              <Icon name="plus" className="h-5 w-5" />
              Adicionar presente
            </button>
          </div>
        </div>

        <GiftList gifts={filteredGifts} onEdit={setEditingGift} />
      </section>

      {isEditListOpen ? (
        <Modal
          title="Editar lista"
          description="Atualize os dados principais do evento."
          onClose={() => setIsEditListOpen(false)}
        >
          <ListForm
            framed={false}
            initialValue={list}
            resetOnSubmit={false}
            submitLabel="Salvar alterações"
            onCancel={() => setIsEditListOpen(false)}
            onSubmit={async (value) => {
              await updateWishlistDetails(list.id, {
                ...getListDetails(list),
                title: value.title,
                eventDate: value.eventDate,
                eventType: value.eventType,
                ownerName: value.ownerName,
                message: value.message,
              })
              setIsEditListOpen(false)
              showNotice('Lista atualizada.')
            }}
          />
        </Modal>
      ) : null}

      {isOptionsOpen ? (
        <Modal
          title="Opções da lista"
          description="Edite as categorias e faixas usadas nos presentes desta lista."
          onClose={() => setIsOptionsOpen(false)}
        >
          <div className="grid gap-5">
            <ListOptionsEditor
              value={optionsDraft}
              onChange={setOptionsDraft}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="ui-button-secondary w-full"
                onClick={() => setIsOptionsOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="ui-button-primary w-full"
                onClick={async () => {
                  await updateWishlistDetails(
                    list.id,
                    getListDetails(
                      list,
                      normalizeWishlistOptions(optionsDraft)
                    )
                  )
                  setIsOptionsOpen(false)
                  showNotice('Opções da lista atualizadas.')
                }}
              >
                Salvar opções
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {isShareOpen ? (
        <div className="fixed inset-0 z-30 overflow-y-auto bg-[var(--color-page-overlay)] px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto grid max-w-5xl gap-4">
            <div className="flex justify-end">
              <button
                type="button"
                className="ui-button-secondary"
                onClick={() => setIsShareOpen(false)}
              >
                Fechar
              </button>
            </div>
            <ShareCard list={list} />
          </div>
        </div>
      ) : null}

      {isAddGiftOpen ? (
        <Modal
          title="Adicionar presente"
          description="Cadastre um novo item para esta lista."
          onClose={() => setIsAddGiftOpen(false)}
        >
          <GiftForm
            options={list.options}
            submitLabel="Adicionar presente"
            onCancel={() => setIsAddGiftOpen(false)}
            onSubmit={async (gift) => {
              await addGift(list.id, gift)
              setIsAddGiftOpen(false)
              showNotice('Presente adicionado.')
            }}
          />
        </Modal>
      ) : null}

      {editingGift ? (
        <Modal
          title="Editar presente"
          description="Atualize nome, descrição, preço, prioridade ou link."
          onClose={() => setEditingGift(null)}
        >
          <GiftForm
            options={list.options}
            initialValue={editingGift}
            submitLabel="Salvar presente"
            onCancel={() => setEditingGift(null)}
            onSubmit={async (gift) => {
              await updateGift(list.id, gift)
              setEditingGift(null)
              showNotice('Presente atualizado.')
            }}
          />
        </Modal>
      ) : null}
    </section>
  )
}

export default ListDetailPage
