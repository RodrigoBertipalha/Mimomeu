import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/authContext'
import AccountMenu from '../auth/AccountMenu'
import Icon from '../ui/Icon'
import Container from './Container'

function Navbar() {
  const { user } = useAuth()
  const next = encodeURIComponent('/list?new=1')
  const createListTo = user ? '/list?new=1' : `/login?next=${next}`

  return (
    <header className="sticky top-0 z-20 border-b border-[rgba(217,212,202,0.55)] bg-[rgba(255,253,248,0.9)] backdrop-blur">
      <Container>
        <div className="flex h-20 items-center justify-between gap-4">
          <Link
            to="/"
            className="ui-headline shrink-0 text-2xl font-extrabold text-[var(--color-primary-deep)] sm:text-3xl"
          >
            Mimo Meu
          </Link>

          <nav className="hidden items-center gap-10 text-sm font-semibold text-[var(--color-text)] md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? 'border-b-2 border-[var(--color-primary-deep)] pb-1 text-[var(--color-primary-deep)]'
                  : 'pb-1 hover:text-[var(--color-primary-deep)]'
              }
            >
              Início
            </NavLink>
            <NavLink
              to="/list"
              className={({ isActive }) =>
                isActive
                  ? 'border-b-2 border-[var(--color-primary-deep)] pb-1 text-[var(--color-primary-deep)]'
                  : 'pb-1 hover:text-[var(--color-primary-deep)]'
              }
            >
              Minhas listas
            </NavLink>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link to={createListTo} className="ui-button-primary hidden sm:flex">
              <Icon name="plus" className="h-4 w-4" />
              Criar lista
            </Link>

            <AccountMenu />

            <Link
              to="/list"
              className="ui-icon-button md:hidden"
              aria-label="Minhas listas"
            >
              <Icon name="gift" />
            </Link>
          </div>
        </div>
      </Container>
    </header>
  )
}

export default Navbar
