import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ListForm from '../components/lists/ListForm'
import Icon from '../components/ui/Icon'
import Modal from '../components/ui/Modal'
import { useWishlist } from '../hooks/useWishlist'
import {
  getGiftAvailableCount,
  getGiftQuantity,
  getGiftReservedCount,
  isGiftFullyReserved,
} from '../utils/gifts'
import { getListTypeConfig, normalizeWishlistKind } from '../utils/listTypes'

function ListPage() {
  const { wishlists, createWishlist, isLoading, error } = useWishlist()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const isCreateOpen = searchParams.get('new') === '1'
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  function openCreateModal() {
    setCreateError('')
    setSearchParams({ new: '1' })
  }

  function closeCreateModal() {
    setCreateError('')
    setSearchParams({})
  }

  return (
    <section className="grid gap-8">
      <header className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="ui-kicker">Minhas listas</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">
            Escolha uma lista ou crie uma nova
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-muted)]">
            Cada lista tem seu próprio resumo, presentes, reservas e link de
            compartilhamento.
          </p>
        </div>

        <button type="button" className="ui-button-primary" onClick={openCreateModal}>
          <Icon name="plus" className="h-5 w-5" />
          Criar lista
        </button>
      </header>

      {isLoading ? (
        <section className="ui-panel p-8 text-center">
          <p className="ui-kicker">Carregando</p>
          <h2 className="mt-2 text-2xl font-extrabold">
            Buscando suas listas...
          </h2>
        </section>
      ) : null}

      {error ? (
        <p className="rounded-md bg-[rgba(198,29,29,0.1)] px-4 py-3 text-sm font-bold text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      {!isLoading && wishlists.length ? (
        <section className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {wishlists.map((list) => {
              const listKind = normalizeWishlistKind(list.listKind)
              const config = getListTypeConfig(listKind)
              const totalCount =
                listKind === 'potluck'
                  ? list.gifts.reduce(
                      (sum, gift) => sum + getGiftQuantity(gift),
                      0
                    )
                  : list.gifts.length
              const reservedCount =
                listKind === 'potluck'
                  ? list.gifts.reduce(
                      (sum, gift) => sum + getGiftReservedCount(gift),
                      0
                    )
                  : list.gifts.filter((gift) => isGiftFullyReserved(gift)).length
              const availableCount =
                listKind === 'potluck'
                  ? list.gifts.reduce(
                      (sum, gift) => sum + getGiftAvailableCount(gift),
                      0
                    )
                  : list.gifts.length - reservedCount
              const progress = totalCount
                ? Math.round((reservedCount / totalCount) * 100)
                : 0

              return (
                <Link
                  key={list.id}
                  to={`/list/${list.id}`}
                  className="ui-panel block p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-primary-deep)]"
                >
                  <p className="ui-kicker">{list.eventType || 'Evento'}</p>
                  <h2 className="mt-3 break-words text-xl font-extrabold">
                    {list.title}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {list.eventDate || 'Data não definida'}
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-3 border-y border-[var(--color-line)] py-4 text-sm">
                    <div>
                      <p className="font-extrabold">{totalCount}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {listKind === 'potluck' ? 'Vagas' : config.itemPlural}
                      </p>
                    </div>
                    <div>
                      <p className="font-extrabold text-[var(--color-primary-deep)]">
                        {availableCount}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {listKind === 'potluck' ? 'Faltam' : 'Livres'}
                      </p>
                    </div>
                    <div>
                      <p className="font-extrabold text-[var(--color-tertiary-deep)]">
                        {reservedCount}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {listKind === 'potluck' ? 'Comb.' : 'Reserv.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-bold text-[var(--color-muted)]">
                      <span>Progresso</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="ui-progress-track mt-2 h-2">
                      <div
                        className="ui-progress-value"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-extrabold text-[var(--color-primary-deep)]">
                    Abrir lista
                  </p>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      {!isLoading && !wishlists.length ? (
        <section className="rounded-lg border border-dashed border-[var(--color-line)] bg-[var(--color-empty-bg)] p-8 text-center shadow-[var(--shadow-soft)]">
          <h2 className="text-2xl font-extrabold">
            Nenhuma lista criada ainda
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--color-muted)]">
            Crie sua primeira lista para adicionar presentes, compartilhar com
            convidados e acompanhar reservas.
          </p>
          <button
            type="button"
            className="ui-button-primary mx-auto mt-6"
            onClick={openCreateModal}
          >
            Criar primeira lista
          </button>
        </section>
      ) : null}

      {isCreateOpen ? (
        <Modal
          title="Criar lista"
          description="Informe os dados básicos do evento. Os presentes entram depois, dentro da lista."
          onClose={closeCreateModal}
        >
          {createError ? (
            <p className="mb-5 rounded-md bg-[rgba(198,29,29,0.1)] px-4 py-3 text-sm font-bold text-[var(--color-danger)]">
              {createError}
            </p>
          ) : null}
          <ListForm
            framed={false}
            showOptionsSetup
            submitLabel={isCreating ? 'Criando lista...' : 'Criar lista'}
            submitDisabled={isCreating}
            onCancel={closeCreateModal}
            onSubmit={async (value) => {
              setIsCreating(true)
              setCreateError('')
              try {
                const created = await createWishlist(value)
                closeCreateModal()
                navigate(`/list/${created.id}`, {
                  state: { notice: 'Lista criada.' },
                })
              } catch (submitError) {
                setCreateError(
                  submitError instanceof Error
                    ? submitError.message
                    : 'Não foi possível criar a lista. Tente novamente.'
                )
              } finally {
                setIsCreating(false)
              }
            }}
          />
        </Modal>
      ) : null}
    </section>
  )
}

export default ListPage
