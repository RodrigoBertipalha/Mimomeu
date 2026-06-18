import { Link } from 'react-router-dom'
import Icon from '../components/ui/Icon'
import { useWishlist } from '../hooks/useWishlist'
import { getGiftReservedCount, isGiftFullyReserved } from '../utils/gifts'
import { getListTypeConfig, normalizeWishlistKind } from '../utils/listTypes'

function HomePage() {
  const { wishlists } = useWishlist()

  return (
    <section className="grid gap-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
        <section className="max-w-3xl">
          <div className="mb-8 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--color-primary-deep)]">
            <span className="h-px w-12 bg-[var(--color-primary-deep)]" />
            Momentos com carinho
          </div>
          <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            Crie e compartilhe listas para cada ocasião
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--color-muted)]">
            Crie listas de presentes ou confraternização, compartilhe com
            convidados e acompanhe reservas em um só lugar.
          </p>

          <div className="mt-9 grid gap-3 sm:grid-cols-[1fr_0.86fr]">
            <Link to="/list?new=1" className="ui-button-primary h-14">
              Criar lista
              <Icon name="plus" className="h-5 w-5" />
            </Link>
            <Link to="/list" className="ui-button-secondary h-14">
              Minhas listas
              <Icon name="search" className="h-5 w-5" />
            </Link>
          </div>
        </section>

        <aside className="relative mx-auto w-full max-w-[520px]">
          <div className="ui-photo ui-photo-gift aspect-[1.05/1] rounded-[2rem] border-[12px] border-[var(--color-photo-border)] p-6 shadow-[var(--shadow-soft)]">
            <div className="inline-flex items-center gap-3 rounded-lg bg-[var(--color-card)] px-5 py-4 shadow-[var(--shadow-control)]">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary-deep)]">
                <Icon name="heart" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold">Lista de desejos</p>
                <p className="text-xs text-[var(--color-muted)]">
                  Ana & Pedro · 2026
                </p>
              </div>
            </div>

            <div className="absolute bottom-8 right-6 w-40 rounded-lg bg-[var(--color-panel-translucent)] p-4 shadow-[var(--shadow-control)] backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--color-muted)]">
                <span>Reservados</span>
                <span>70%</span>
              </div>
              <div className="ui-progress-track mt-2 h-2">
                <div className="ui-progress-value w-[70%]" />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {wishlists.length ? (
        <section className="grid gap-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="ui-kicker">Listas locais</p>
              <h2 className="mt-2 text-2xl font-extrabold">
                Criadas neste navegador
              </h2>
            </div>
            <Link to="/list" className="ui-link">
              Ver todas
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {wishlists.slice(0, 3).map((list) => {
              const listKind = normalizeWishlistKind(list.listKind)
              const config = getListTypeConfig(listKind)
              const reservedCount =
                listKind === 'potluck'
                  ? list.gifts.reduce(
                      (sum, gift) => sum + getGiftReservedCount(gift),
                      0
                    )
                  : list.gifts.filter((gift) => isGiftFullyReserved(gift)).length

              return (
                <Link
                  key={list.id}
                  to={`/list/${list.id}`}
                  className="ui-panel block p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-primary-deep)]"
                >
                  <p className="ui-kicker">{list.eventType || 'Evento'}</p>
                  <h3 className="mt-2 break-words text-lg font-extrabold">
                    {list.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {list.gifts.length} {config.itemPlural} · {reservedCount}{' '}
                    {config.progressUnit}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}
    </section>
  )
}

export default HomePage
