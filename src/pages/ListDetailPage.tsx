import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import GiftForm from '../components/gifts/GiftForm'
import GiftList from '../components/gifts/GiftList'
import ActivityTimeline from '../components/lists/ActivityTimeline'
import ListForm from '../components/lists/ListForm'
import ListOptionsEditor from '../components/lists/ListOptionsEditor'
import ShareCard from '../components/share/ShareCard'
import Icon from '../components/ui/Icon'
import Modal from '../components/ui/Modal'
import Toast from '../components/ui/Toast'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { useWishlist } from '../hooks/useWishlist'
import { useAuth } from '../auth/authContext'
import { deleteGiftImages, uploadGiftImage } from '../services/imageStorage'
import type {
  Gift,
  GiftReservation,
  Wishlist,
  WishlistOptions,
} from '../types/wishlist'
import {
  formatMoney,
  getGiftAvailableCount,
  getGiftQuantity,
  getGiftReservations,
  isGiftFinancial,
  getGiftReservedCount,
  isGiftFullyReserved,
} from '../utils/gifts'
import { formatEventDate } from '../utils/date'
import { getListTypeConfig, normalizeWishlistKind } from '../utils/listTypes'
import {
  createDefaultWishlistOptions,
  normalizeWishlistOptions,
  usesWishlistCategories,
  usesWishlistPriceRanges,
} from '../utils/wishlistOptions'

function getListDetails(
  list: Wishlist,
  options: WishlistOptions = list.options
): Omit<Wishlist, 'gifts'> {
  return {
    id: list.id,
    publicSlug: list.publicSlug,
    listKind: list.listKind,
    title: list.title,
    eventDate: list.eventDate,
    eventType: list.eventType,
    ownerName: list.ownerName,
    message: list.message,
    options,
    activity: list.activity,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  }
}

function ListDetailPage() {
  const { listId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const {
    findWishlist,
    updateWishlistDetails,
    addGift,
    updateGift,
    deleteGift,
    deleteWishlist,
    releaseGiftReservation,
    releaseReservation,
    refreshList,
    isLoading,
    error,
  } = useWishlist()

  useEffect(() => {
    if (listId) void refreshList(listId)
  }, [listId, refreshList])
  const { user } = useAuth()
  const [deletingGift, setDeletingGift] = useState<Gift | null>(null)
  const [releasing, setReleasing] = useState<{
    gift: Gift
    reservation: GiftReservation | null
  } | null>(null)
  const [isDeletingList, setIsDeletingList] = useState(false)
  const [query, setQuery] = useState('')
  const [isEditListOpen, setIsEditListOpen] = useState(false)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isAddGiftOpen, setIsAddGiftOpen] = useState(false)
  const [editingGift, setEditingGift] = useState<Gift | null>(null)
  const [optionsDraft, setOptionsDraft] = useState<WishlistOptions>(
    createDefaultWishlistOptions()
  )
  const routeNotice = (location.state as { notice?: string } | null)?.notice
  const [notice, setNotice] = useState(routeNotice ?? '')
  const [actionError, setActionError] = useState('')
  useBodyScrollLock(isShareOpen)
  useEscapeKey(() => setIsShareOpen(false), isShareOpen)

  const list = listId ? findWishlist(listId) : null

  useEffect(() => {
    if (routeNotice) navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, navigate, routeNotice])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(''), 2500)
    return () => window.clearTimeout(timeout)
  }, [notice])

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
    setActionError('')
    setNotice(message)
  }

  function showActionError(fallback: string, submitError: unknown) {
    setNotice('')
    setActionError(
      submitError instanceof Error ? submitError.message : fallback
    )
  }

  function openOptionsModal() {
    if (!list) return
    setActionError('')
    setOptionsDraft(normalizeWishlistOptions(list.options, list.listKind))
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

  const isAnyModalOpen =
    isEditListOpen ||
    isOptionsOpen ||
    isAddGiftOpen ||
    isDeletingList ||
    Boolean(releasing) ||
    Boolean(editingGift) ||
    Boolean(deletingGift)
  const currentListId = list.id
  async function uploadListImage(image: Blob) {
    if (!user) throw new Error('Faça login para enviar fotos.')
    return uploadGiftImage(image, user.id, currentListId)
  }
  function discardListImage(url: string) {
    void deleteGiftImages([url])
  }
  const totalReservations = list.gifts.reduce(
    (sum, gift) => sum + getGiftReservations(gift).length,
    0
  )
  const listKind = normalizeWishlistKind(list.listKind)
  const config = getListTypeConfig(listKind)
  const showCategories = usesWishlistCategories(list.options)
  const showPriceRanges = usesWishlistPriceRanges(list.options)
  const totalCount =
    listKind === 'potluck'
      ? list.gifts.reduce((sum, gift) => sum + getGiftQuantity(gift), 0)
      : list.gifts.length
  const reservedCount =
    listKind === 'potluck'
      ? list.gifts.reduce((sum, gift) => sum + getGiftReservedCount(gift), 0)
      : list.gifts.filter((gift) => isGiftFullyReserved(gift)).length
  const availableCount =
    listKind === 'potluck'
      ? list.gifts.reduce((sum, gift) => sum + getGiftAvailableCount(gift), 0)
      : list.gifts.length - reservedCount
  const progress = totalCount
    ? Math.round((reservedCount / totalCount) * 100)
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
            {formatEventDate(list.eventDate) || 'Data não definida'}
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl">
            {list.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-muted)]">
            {config.managementDescription}
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-translucent)] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              className="ui-button-secondary h-10 justify-center rounded-md px-4 text-xs"
              onClick={() => {
                setActionError('')
                setIsEditListOpen(true)
              }}
            >
              Editar lista
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

      {error ? (
        <p className="rounded-md bg-[rgba(198,29,29,0.1)] px-4 py-3 text-sm font-bold text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      <Toast message={notice} />
      {!isAnyModalOpen ? (
        <Toast
          message={actionError}
          tone="error"
          onClose={() => setActionError('')}
        />
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr_2.1fr]">
        <article className="ui-panel p-6">
          <p className="text-sm font-bold text-[var(--color-muted)]">
            {config.reservedStatLabel}
          </p>
          <p className="mt-7 text-4xl font-extrabold text-[var(--color-tertiary-deep)]">
            {reservedCount}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {config.reservedStatDescription}
          </p>
        </article>

        <article className="ui-panel p-6">
          <p className="text-sm font-bold text-[var(--color-muted)]">
            {config.availableStatLabel}
          </p>
          <p className="mt-7 text-4xl font-extrabold text-[var(--color-primary-deep)]">
            {availableCount}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {config.availableStatDescription}
          </p>
        </article>

        <article className="rounded-lg border border-[var(--color-line)] bg-[var(--color-primary-soft)] p-6">
          <p className="text-sm font-bold text-[var(--color-primary-deep)]">
            {config.progressLabel}
          </p>
          <div className="mt-8 flex items-end justify-between gap-3">
            <p className="text-sm font-extrabold text-[var(--color-text)]">
              {reservedCount} de {totalCount} {config.progressUnit}
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
            <p className="ui-kicker">{config.itemsKicker}</p>
            <h2 className="mt-1 text-3xl font-extrabold">
              {config.itemsHeading}
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,320px)_auto_auto]">
            <label className="relative">
              <Icon
                name="search"
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-muted)]"
              />
              <input
                className="ui-field w-full pl-12"
                placeholder={config.searchPlaceholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="ui-button-secondary border-[var(--color-primary-deep)] bg-[var(--color-primary-soft)] text-[var(--color-primary-deep)]"
              onClick={openOptionsModal}
            >
              <Icon name="filter" className="h-5 w-5" />
              Opções
            </button>
            <button
              type="button"
              className="ui-button-primary"
              onClick={() => {
                setActionError('')
                setIsAddGiftOpen(true)
              }}
            >
              <Icon name="plus" className="h-5 w-5" />
              {config.addItemLabel}
            </button>
          </div>
        </div>

        <GiftList
          gifts={filteredGifts}
          listKind={listKind}
          showCategories={showCategories}
          showPriceRange={showPriceRanges}
          onEdit={(gift) => {
            setActionError('')
            setEditingGift(gift)
          }}
          onReleaseReserve={(gift) =>
            setReleasing({ gift, reservation: null })
          }
          onReleaseReservation={(gift, reservation) =>
            setReleasing({ gift, reservation })
          }
        />
      </section>

      <ActivityTimeline activity={list.activity} createdAt={list.createdAt} />

      {isEditListOpen ? (
        <Modal
          title="Editar lista"
          description="Atualize os dados principais do evento."
          onClose={() => {
            setActionError('')
            setIsEditListOpen(false)
          }}
        >
          {actionError ? (
            <p className="mb-5 rounded-md bg-[rgba(198,29,29,0.1)] px-4 py-3 text-sm font-bold text-[var(--color-danger)]">
              {actionError}
            </p>
          ) : null}
          <ListForm
            framed={false}
            initialValue={list}
            kindLocked={list.gifts.length > 0}
            resetOnSubmit={false}
            submitLabel="Salvar alterações"
            onCancel={() => setIsEditListOpen(false)}
            onSubmit={async (value) => {
              try {
                await updateWishlistDetails(
                  list.id,
                  {
                    ...getListDetails(list),
                    listKind: value.listKind,
                    title: value.title,
                    eventDate: value.eventDate,
                    eventType: value.eventType,
                    ownerName: value.ownerName,
                    message: value.message,
                    options: normalizeWishlistOptions(
                      value.options,
                      value.listKind
                    ),
                  },
                  'list_updated'
                )
                setIsEditListOpen(false)
                showNotice('Lista atualizada.')
              } catch (submitError) {
                showActionError(
                  'Não foi possível atualizar a lista. Tente novamente.',
                  submitError
                )
              }
            }}
          />
          <button
            type="button"
            className="mt-6 w-full rounded-md border border-[var(--color-danger)] px-4 py-3 text-sm font-extrabold text-[var(--color-danger)] transition hover:bg-[rgba(198,29,29,0.08)]"
            onClick={() => {
              setIsEditListOpen(false)
              setIsDeletingList(true)
            }}
          >
            <Icon name="trash" className="mr-2 inline h-4 w-4" />
            Excluir lista
          </button>
        </Modal>
      ) : null}

      {isDeletingList ? (
        <ConfirmDialog
          title="Excluir lista?"
          description={`"${list.title}" será apagada com ${list.gifts.length} ${config.itemPlural} e ${totalReservations} reserva(s). O link público deixa de funcionar. Isso não pode ser desfeito.`}
          confirmLabel="Excluir lista"
          onCancel={() => setIsDeletingList(false)}
          onConfirm={async () => {
            try {
              await deleteWishlist(list.id)
              navigate('/list', { replace: true })
            } catch (submitError) {
              setIsDeletingList(false)
              showActionError(
                'Não foi possível excluir a lista. Tente novamente.',
                submitError
              )
            }
          }}
        />
      ) : null}

      {releasing ? (
        <ConfirmDialog
          title={
            releasing.reservation
              ? `Liberar reserva de ${releasing.reservation.guestName}?`
              : `Liberar todas as reservas?`
          }
          description={
            releasing.reservation
              ? isGiftFinancial(releasing.gift)
                ? `A contribuição de ${releasing.reservation.guestName} (${formatMoney(
                    releasing.reservation.contributionAmount
                  )}) em "${releasing.gift.name}" será removida e esse valor volta a faltar na meta.`
                : `A reserva de ${releasing.reservation.guestName} em "${releasing.gift.name}" será removida e a vaga volta a ficar disponível para os convidados.`
              : `Todas as ${getGiftReservations(releasing.gift).length} reservas de "${releasing.gift.name}" serão removidas.`
          }
          confirmLabel="Liberar"
          runningLabel="Liberando..."
          onCancel={() => setReleasing(null)}
          onConfirm={async () => {
            try {
              if (releasing.reservation) {
                await releaseReservation(
                  list.id,
                  releasing.gift,
                  releasing.reservation
                )
              } else {
                await releaseGiftReservation(list.id, releasing.gift)
              }
              setReleasing(null)
              showNotice(
                releasing.reservation
                  ? 'Reserva liberada.'
                  : config.releaseSuccessMessage
              )
            } catch (submitError) {
              setReleasing(null)
              showActionError(
                'Não foi possível liberar a reserva. Tente novamente.',
                submitError
              )
            }
          }}
        />
      ) : null}

      {deletingGift ? (
        <ConfirmDialog
          title={`Excluir ${config.itemSingular}?`}
          description={`"${deletingGift.name}" será removido da lista${
            getGiftReservations(deletingGift).length
              ? ` junto com ${getGiftReservations(deletingGift).length} reserva(s) de convidados`
              : ''
          }. Isso não pode ser desfeito.`}
          confirmLabel={`Excluir ${config.itemSingular}`}
          onCancel={() => setDeletingGift(null)}
          onConfirm={async () => {
            try {
              await deleteGift(list.id, deletingGift)
              setDeletingGift(null)
              showNotice(
                `${config.itemSingular[0].toUpperCase()}${config.itemSingular.slice(1)} excluído.`
              )
            } catch (submitError) {
              setDeletingGift(null)
              showActionError(
                `Não foi possível excluir o ${config.itemSingular}. Tente novamente.`,
                submitError
              )
            }
          }}
        />
      ) : null}

      {isOptionsOpen ? (
        <Modal
          title={config.optionsTitle}
          description={config.optionsDescription}
          onClose={() => {
            setActionError('')
            setIsOptionsOpen(false)
          }}
        >
          <div className="grid gap-5">
            {actionError ? (
              <p className="rounded-md bg-[rgba(198,29,29,0.1)] px-4 py-3 text-sm font-bold text-[var(--color-danger)]">
                {actionError}
              </p>
            ) : null}
            <ListOptionsEditor
              value={optionsDraft}
              listKind={listKind}
              onChange={setOptionsDraft}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="ui-button-secondary w-full"
                onClick={() => {
                  setActionError('')
                  setIsOptionsOpen(false)
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="ui-button-primary w-full"
                onClick={async () => {
                  try {
                    await updateWishlistDetails(
                      list.id,
                      getListDetails(
                        list,
                        normalizeWishlistOptions(optionsDraft, listKind)
                      ),
                      'options_updated'
                    )
                    setIsOptionsOpen(false)
                    showNotice('Opções da lista atualizadas.')
                  } catch (submitError) {
                    showActionError(
                      'Não foi possível salvar as opções. Tente novamente.',
                      submitError
                    )
                  }
                }}
              >
                Salvar opções
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {isShareOpen ? (
        <div
          className="fixed inset-0 z-30 overflow-y-auto bg-[var(--color-page-overlay)] px-4 py-8 backdrop-blur-sm"
          onClick={() => setIsShareOpen(false)}
        >
          <div
            className="mx-auto grid max-w-5xl gap-4"
            onClick={(event) => event.stopPropagation()}
          >
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
          title={config.addItemLabel}
          description={`Cadastre um novo ${config.itemSingular} para esta lista.`}
          onClose={() => {
            setActionError('')
            setIsAddGiftOpen(false)
          }}
          size="wide"
        >
          {actionError ? (
            <p className="mb-5 rounded-md bg-[rgba(198,29,29,0.1)] px-4 py-3 text-sm font-bold text-[var(--color-danger)]">
              {actionError}
            </p>
          ) : null}
          <GiftForm
            listKind={listKind}
            options={list.options}
            previewGifts={list.gifts}
            listPreviewTitle={config.itemsHeading}
            draftKey={`mimo-meu:gift-draft:${list.id}`}
            uploadImage={uploadListImage}
            discardImage={discardListImage}
            allowDraftSave
            submitLabel={config.addItemLabel}
            onCancel={() => {
              setActionError('')
              setIsAddGiftOpen(false)
            }}
            onSubmit={async (gift) => {
              try {
                await addGift(list.id, gift)
                setIsAddGiftOpen(false)
                showNotice(
                  `${config.itemSingular[0].toUpperCase()}${config.itemSingular.slice(1)} adicionado.`
                )
                return true
              } catch (submitError) {
                showActionError(
                  `Não foi possível adicionar o ${config.itemSingular}. Tente novamente.`,
                  submitError
                )
                return false
              }
            }}
          />
        </Modal>
      ) : null}

      {editingGift ? (
        <Modal
          title={`Editar ${config.itemSingular}`}
          description={`Atualize os dados deste ${config.itemSingular}.`}
          onClose={() => {
            setActionError('')
            setEditingGift(null)
          }}
          size="wide"
        >
          {actionError ? (
            <p className="mb-5 rounded-md bg-[rgba(198,29,29,0.1)] px-4 py-3 text-sm font-bold text-[var(--color-danger)]">
              {actionError}
            </p>
          ) : null}
          <GiftForm
            listKind={listKind}
            options={list.options}
            previewGifts={list.gifts}
            listPreviewTitle={config.itemsHeading}
            initialValue={editingGift}
            uploadImage={uploadListImage}
            discardImage={discardListImage}
            submitLabel={config.editItemLabel}
            onCancel={() => {
              setActionError('')
              setEditingGift(null)
            }}
            onSubmit={async (gift) => {
              try {
                await updateGift(list.id, gift)
                setEditingGift(null)
                showNotice(
                  `${config.itemSingular[0].toUpperCase()}${config.itemSingular.slice(1)} atualizado.`
                )
                return true
              } catch (submitError) {
                showActionError(
                  `Não foi possível salvar o ${config.itemSingular}. Tente novamente.`,
                  submitError
                )
                return false
              }
            }}
          />
          <button
            type="button"
            className="mt-6 w-full rounded-md border border-[var(--color-danger)] px-4 py-3 text-sm font-extrabold text-[var(--color-danger)] transition hover:bg-[rgba(198,29,29,0.08)]"
            onClick={() => {
              setDeletingGift(editingGift)
              setEditingGift(null)
            }}
          >
            <Icon name="trash" className="mr-2 inline h-4 w-4" />
            Excluir {config.itemSingular}
          </button>
        </Modal>
      ) : null}
    </section>
  )
}

export default ListDetailPage
