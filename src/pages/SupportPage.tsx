import { Link } from 'react-router-dom'
import Icon from '../components/ui/Icon'

const contactEmail = 'rodrigobertipalha25@gmail.com'
const mailSubject = 'Contato Mimo Meu'
const mailBody = `Olá, Rodrigo.

Quero falar sobre o Mimo Meu.

Tipo de contato:
- Reportar um problema
- Relatar algo que aconteceu
- Sugerir uma melhoria

Mensagem:
`
const mailTo = `mailto:${contactEmail}?subject=${encodeURIComponent(
  mailSubject
)}&body=${encodeURIComponent(mailBody)}`

function SupportPage() {
  return (
    <section className="mx-auto grid max-w-4xl gap-8">
      <header className="text-center">
        <p className="ui-kicker">Suporte</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
          Como posso te ajudar?
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
          Quer reportar um problema, relatar algo que aconteceu ou sugerir uma
          melhoria para o Mimo Meu? Envie sua mensagem pelo e-mail abaixo.
        </p>
      </header>

      <section className="ui-panel grid gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-[var(--color-muted)]">
              E-mail para contato
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="mt-2 block break-words text-xl font-extrabold text-[var(--color-primary-deep)] underline-offset-4 hover:underline"
            >
              {contactEmail}
            </a>
          </div>
          <a href={mailTo} className="ui-button-primary">
            <Icon name="mail" className="h-5 w-5" />
            Enviar e-mail
          </a>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-4">
            <Icon name="info" className="h-5 w-5 text-[var(--color-primary-deep)]" />
            <h2 className="mt-4 text-base font-extrabold">
              Reportar problema
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              Algo quebrou, não carregou ou apareceu diferente do esperado.
            </p>
          </article>

          <article className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-4">
            <Icon name="heart" className="h-5 w-5 text-[var(--color-primary-deep)]" />
            <h2 className="mt-4 text-base font-extrabold">
              Relatar algo
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              Conte como foi sua experiência criando ou compartilhando listas.
            </p>
          </article>

          <article className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-4">
            <Icon name="plus" className="h-5 w-5 text-[var(--color-primary-deep)]" />
            <h2 className="mt-4 text-base font-extrabold">
              Sugerir melhoria
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              Ideias de ajustes, recursos novos ou detalhes que deixariam tudo
              mais simples.
            </p>
          </article>
        </div>
      </section>

      <div className="flex justify-center">
        <Link to="/" className="ui-button-secondary">
          Voltar ao início
        </Link>
      </div>
    </section>
  )
}

export default SupportPage
