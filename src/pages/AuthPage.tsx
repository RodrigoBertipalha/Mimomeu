import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/authContext'
import Icon from '../components/ui/Icon'

function AuthPage() {
  const {
    user,
    isConfigured,
    isLoading,
    signIn,
    signInWithGoogle,
    signUp,
  } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const next = searchParams.get('next') || '/list'
  const modeParam = searchParams.get('mode')
  const mode: 'login' | 'signup' = modeParam === 'signup' ? 'signup' : 'login'
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)

  useEffect(() => {
    if (user) navigate(next, { replace: true })
  }, [navigate, next, user])

  function handleModeChange(nextMode: 'login' | 'signup') {
    const nextParams = new URLSearchParams(searchParams)
    if (nextMode === 'signup') {
      nextParams.set('mode', 'signup')
    } else {
      nextParams.delete('mode')
    }
    setSearchParams(nextParams)
    setError('')
    setMessage('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      if (mode === 'login') {
        await signIn(email.trim(), password)
        navigate(next, { replace: true })
      } else {
        const result = await signUp(email.trim(), password, displayName.trim())
        if (result.needsConfirmation) {
          setMessage(
            'Cadastro criado. Confira seu e-mail para confirmar a conta antes de entrar.'
          )
        } else {
          navigate(next, { replace: true })
        }
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível concluir. Tente novamente.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleSignIn() {
    setError('')
    setMessage('')
    setIsGoogleSubmitting(true)

    try {
      await signInWithGoogle(next)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível entrar com Google. Tente novamente.'
      )
      setIsGoogleSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <section className="ui-panel mx-auto max-w-xl p-8 text-center">
        <p className="ui-kicker">Carregando sessão</p>
        <h1 className="mt-3 text-3xl font-extrabold">Só um instante...</h1>
      </section>
    )
  }

  if (!isConfigured) {
    return (
      <section className="ui-panel mx-auto max-w-2xl p-8">
        <p className="ui-kicker">Configuração necessária</p>
        <h1 className="mt-3 text-3xl font-extrabold">
          Conecte o Supabase para ativar login.
        </h1>
        <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
          Crie um arquivo `.env` a partir do `.env.example` e preencha
          `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
        </p>
        <Link to="/" className="ui-button-secondary mt-6 w-fit">
          Voltar ao início
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1fr] lg:items-center">
      <div>
        <p className="ui-kicker">Conta Mimo Meu</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">
          Entre para criar e compartilhar suas listas.
        </h1>
        <p className="mt-5 text-base leading-7 text-[var(--color-muted)]">
          O login protege a gestão das listas. Convidados continuam acessando o
          link público sem criar conta.
        </p>
      </div>

      <form className="ui-panel grid gap-5 p-6 sm:p-8" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-[var(--color-bg-soft)] p-1">
          <button
            type="button"
            className={
              mode === 'login'
                ? 'ui-button-primary h-11'
                : 'ui-button-secondary h-11 border-transparent bg-transparent'
            }
            onClick={() => handleModeChange('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={
              mode === 'signup'
                ? 'ui-button-primary h-11'
                : 'ui-button-secondary h-11 border-transparent bg-transparent'
            }
            onClick={() => handleModeChange('signup')}
          >
            Criar conta
          </button>
        </div>

        <button
          type="button"
          className="ui-button-secondary h-12 justify-center"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting || isGoogleSubmitting}
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-card)] text-sm font-extrabold text-[var(--color-primary-deep)] shadow-[var(--shadow-control)]">
            G
          </span>
          {isGoogleSubmitting ? 'Abrindo Google...' : 'Continuar com Google'}
        </button>

        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-subtle)]">
          <span className="h-px flex-1 bg-[var(--color-line)]" />
          ou
          <span className="h-px flex-1 bg-[var(--color-line)]" />
        </div>

        {mode === 'signup' ? (
          <label className="ui-label">
            Nome
            <input
              className="ui-field"
              placeholder="Seu nome"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              required
            />
          </label>
        ) : null}

        <label className="ui-label">
          E-mail
          <input
            type="email"
            className="ui-field"
            placeholder="voce@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="ui-label">
          Senha
          <input
            type="password"
            className="ui-field"
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error ? (
          <p className="rounded-md bg-[rgba(198,29,29,0.1)] px-4 py-3 text-sm font-bold text-[var(--color-danger)]">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="rounded-md bg-[var(--color-primary-soft)] px-4 py-3 text-sm font-bold text-[var(--color-primary-deep)]">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          className="ui-button-primary h-12"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Aguarde...'
            : mode === 'login'
              ? 'Entrar'
              : 'Criar conta'}
          <Icon name="arrow-right" className="h-5 w-5" />
        </button>
      </form>
    </section>
  )
}

export default AuthPage
