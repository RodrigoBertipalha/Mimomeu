import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { useAuth } from '../../auth/authContext'
import Icon from '../ui/Icon'
import Modal from '../ui/Modal'

function getDisplayName(user: User | null) {
  const metadataName = user?.user_metadata?.display_name
  if (typeof metadataName === 'string' && metadataName.trim()) {
    return metadataName.trim()
  }

  return user?.email?.split('@')[0] ?? 'Usuário'
}

function getInitial(value: string) {
  return value.trim().charAt(0).toUpperCase() || 'U'
}

function formatDate(value?: string) {
  if (!value) return 'Não informado'

  return new Intl.DateTimeFormat('pt-BR').format(new Date(value))
}

function AccountMenu() {
  const {
    user,
    isConfigured,
    signOut,
    updateProfile,
    updateEmail,
    updatePassword,
  } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [displayName, setDisplayName] = useState(getDisplayName(user))
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState<'profile' | 'email' | 'password' | ''>('')

  const currentPath = `${location.pathname}${location.search}`
  const loginTo = `/login?next=${encodeURIComponent(currentPath)}`
  const signupTo = `/login?mode=signup&next=${encodeURIComponent(currentPath)}`
  const name = getDisplayName(user)

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function openAccountModal() {
    setDisplayName(getDisplayName(user))
    setEmail(user?.email ?? '')
    setMessage('')
    setError('')
    setIsOpen(false)
    setIsAccountOpen(true)
  }

  async function handleSignOut() {
    await signOut()
    setIsOpen(false)
    navigate('/')
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!displayName.trim()) {
      setError('Informe um nome para exibir na conta.')
      return
    }

    setSaving('profile')
    try {
      await updateProfile(displayName)
      setMessage('Dados do perfil atualizados.')
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível atualizar o perfil.'
      )
    } finally {
      setSaving('')
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')

    const nextEmail = email.trim()
    if (!nextEmail) {
      setError('Informe o novo e-mail.')
      return
    }

    setSaving('email')
    try {
      await updateEmail(nextEmail)
      setMessage(
        'E-mail atualizado. Se o Supabase exigir confirmação, confira sua caixa de entrada.'
      )
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível atualizar o e-mail.'
      )
    } finally {
      setSaving('')
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (password.length < 6) {
      setError('A nova senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (password !== passwordConfirmation) {
      setError('A confirmação da senha não confere.')
      return
    }

    setSaving('password')
    try {
      await updatePassword(password)
      setPassword('')
      setPasswordConfirmation('')
      setMessage('Senha atualizada.')
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível atualizar a senha.'
      )
    } finally {
      setSaving('')
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="ui-icon-button relative border border-[var(--color-line)] bg-[var(--color-card-soft)]"
        aria-label="Menu da conta"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Icon name="user" />
        {user ? (
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[var(--color-primary-deep)] ring-2 ring-[var(--color-card-soft)]" />
        ) : null}
      </button>

      {isOpen ? (
        <div className="ui-panel absolute right-0 top-12 z-40 w-[min(20rem,calc(100vw-2rem))] p-3">
          {user ? (
            <div className="grid gap-2">
              <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-2 pb-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-sm font-extrabold text-[var(--color-primary-deep)]">
                  {getInitial(name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-[var(--color-text)]">
                    {name}
                  </p>
                  <p className="mt-1 break-words text-xs font-semibold text-[var(--color-muted)]">
                    {user.email}
                  </p>
                </div>
              </div>

              <Link
                to="/list"
                className="ui-button-secondary justify-start rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <Icon name="gift" className="h-4 w-4" />
                Minhas listas
              </Link>
              <button
                type="button"
                className="ui-button-secondary justify-start rounded-md"
                onClick={openAccountModal}
              >
                <Icon name="user" className="h-4 w-4" />
                Minha conta
              </button>
              <button
                type="button"
                className="ui-button-secondary justify-start rounded-md"
                onClick={handleSignOut}
              >
                <Icon name="log-out" className="h-4 w-4" />
                Sair
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="px-2">
                <p className="text-sm font-extrabold text-[var(--color-text)]">
                  Conta
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                  Entre para criar listas e gerenciar seus presentes.
                </p>
              </div>
              {!isConfigured ? (
                <p className="rounded-md bg-[var(--color-danger-soft)] px-3 py-2 text-xs font-bold text-[var(--color-danger)]">
                  Supabase não configurado.
                </p>
              ) : null}
              <Link
                to={loginTo}
                className="ui-button-primary justify-center rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Entrar
              </Link>
              <Link
                to={signupTo}
                className="ui-button-secondary justify-center rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Criar conta
              </Link>
            </div>
          )}
        </div>
      ) : null}

      {isAccountOpen && user ? (
        <Modal
          title="Minha conta"
          description="Veja seus dados e atualize as informações de acesso."
          onClose={() => setIsAccountOpen(false)}
        >
          <div className="grid gap-5">
            <section className="grid gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-bold text-[var(--color-muted)]">
                  Nome
                </p>
                <p className="mt-1 break-words text-sm font-extrabold">
                  {name}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-muted)]">
                  E-mail
                </p>
                <p className="mt-1 break-words text-sm font-extrabold">
                  {user.email}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-muted)]">
                  Conta criada
                </p>
                <p className="mt-1 text-sm font-extrabold">
                  {formatDate(user.created_at)}
                </p>
              </div>
            </section>

            {message ? (
              <p className="rounded-md bg-[var(--color-primary-soft)] px-4 py-3 text-sm font-bold text-[var(--color-primary-deep)]">
                {message}
              </p>
            ) : null}

            {error ? (
              <p className="rounded-md bg-[rgba(198,29,29,0.1)] px-4 py-3 text-sm font-bold text-[var(--color-danger)]">
                {error}
              </p>
            ) : null}

            <form className="grid gap-3" onSubmit={handleProfileSubmit}>
              <label className="ui-label">
                <span className="flex items-center justify-between gap-3">
                  Nome exibido
                  <span className="text-[10px] font-bold text-[var(--color-primary-deep)]">
                    Obrigatório
                  </span>
                </span>
                <input
                  className="ui-field"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                />
              </label>
              <button
                type="submit"
                className="ui-button-secondary w-fit"
                disabled={saving === 'profile'}
              >
                Salvar dados
              </button>
            </form>

            <form className="grid gap-3" onSubmit={handleEmailSubmit}>
              <label className="ui-label">
                <span className="flex items-center justify-between gap-3">
                  Trocar e-mail
                  <span className="text-[10px] font-bold text-[var(--color-primary-deep)]">
                    Obrigatório
                  </span>
                </span>
                <input
                  type="email"
                  className="ui-field"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <button
                type="submit"
                className="ui-button-secondary w-fit"
                disabled={saving === 'email'}
              >
                Atualizar e-mail
              </button>
            </form>

            <form className="grid gap-3" onSubmit={handlePasswordSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="ui-label">
                  <span className="flex items-center justify-between gap-3">
                    Nova senha
                    <span className="text-[10px] font-bold text-[var(--color-primary-deep)]">
                      Obrigatório
                    </span>
                  </span>
                  <input
                    type="password"
                    className="ui-field"
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </label>
                <label className="ui-label">
                  <span className="flex items-center justify-between gap-3">
                    Confirmar senha
                    <span className="text-[10px] font-bold text-[var(--color-primary-deep)]">
                      Obrigatório
                    </span>
                  </span>
                  <input
                    type="password"
                    className="ui-field"
                    minLength={6}
                    value={passwordConfirmation}
                    onChange={(event) =>
                      setPasswordConfirmation(event.target.value)
                    }
                    required
                  />
                </label>
              </div>
              <button
                type="submit"
                className="ui-button-primary w-fit"
                disabled={saving === 'password'}
              >
                Atualizar senha
              </button>
            </form>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

export default AccountMenu
