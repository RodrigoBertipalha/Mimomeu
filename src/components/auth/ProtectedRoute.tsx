import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../auth/authContext'

type ProtectedRouteProps = {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, isConfigured } = useAuth()
  const location = useLocation()
  const next = `${location.pathname}${location.search}`

  if (isLoading) {
    return (
      <section className="ui-panel mx-auto max-w-xl p-8 text-center">
        <p className="ui-kicker">Carregando sessão</p>
        <h1 className="mt-3 text-3xl font-extrabold">
          Só um instante...
        </h1>
      </section>
    )
  }

  if (!isConfigured) {
    return (
      <section className="ui-panel mx-auto max-w-2xl p-8">
        <p className="ui-kicker">Configuração necessária</p>
        <h1 className="mt-3 text-3xl font-extrabold">
          Configure o Supabase para usar login.
        </h1>
        <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
          Crie um arquivo `.env` com `VITE_SUPABASE_URL` e
          `VITE_SUPABASE_ANON_KEY`. Use `.env.example` como base.
        </p>
      </section>
    )
  }

  if (!user) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(next)}`}
        replace
      />
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
