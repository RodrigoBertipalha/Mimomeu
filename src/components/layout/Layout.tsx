import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Container from './Container'
import Navbar from './Navbar'

type LayoutProps = {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col text-[var(--color-text)]">
      <Navbar />
      <main className="flex-1 py-8 sm:py-12">
        <Container>{children}</Container>
      </main>
      <footer className="border-t border-[var(--color-line)] bg-[var(--color-footer-bg)] py-10">
        <Container>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="ui-headline text-2xl font-extrabold text-[var(--color-primary-deep)]">
                Mimo Meu
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Listas de presentes organizadas com carinho.
              </p>
            </div>
            <nav className="flex flex-wrap gap-6 text-sm font-semibold text-[var(--color-secondary-deep)]">
              <Link to="/about" className="underline-offset-4 hover:underline">
                Sobre
              </Link>
              <span className="text-[var(--color-muted)]">
                Privacidade
              </span>
              <Link to="/support" className="underline-offset-4 hover:underline">
                Suporte
              </Link>
            </nav>
          </div>
        </Container>
      </footer>
    </div>
  )
}

export default Layout
