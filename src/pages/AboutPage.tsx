import { Link } from 'react-router-dom'
import Icon from '../components/ui/Icon'

function AboutPage() {
  return (
    <section className="grid gap-10">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          Tudo organizado com carinho
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
          Pensamos em cada detalhe para que você foque no que realmente importa:
          celebrar.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
        <article className="ui-panel grid min-h-[420px] content-between gap-8 p-8">
          <div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-secondary-soft)] text-[var(--color-secondary-deep)]">
              <Icon name="gift" />
            </span>
            <h2 className="mt-7 text-2xl font-extrabold">
              Eventos inesquecíveis
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--color-muted)]">
              De casamentos a reuniões íntimas, a plataforma se adapta ao tom da
              sua comemoração.
            </p>
          </div>
          <div className="ui-photo ui-photo-table h-48" />
        </article>

        <div className="grid gap-6">
          <article className="rounded-lg bg-[var(--color-primary-deep)] p-8 text-white shadow-[var(--shadow-soft)]">
            <Icon name="share" className="h-8 w-8" />
            <h2 className="mt-16 text-2xl font-extrabold">
              Compartilhamento simples
            </h2>
            <p className="mt-3 text-sm font-medium leading-6 text-white/75">
              Um link único para enviar para todos os convidados via WhatsApp ou
              e-mail.
            </p>
          </article>

          <article className="ui-panel p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-tertiary-soft)] text-[var(--color-tertiary-deep)]">
              <Icon name="heart" />
            </span>
            <h2 className="mt-8 text-2xl font-extrabold">
              Presentes com contexto
            </h2>
            <p className="mt-16 text-sm leading-6 text-[var(--color-muted)]">
              Notas, links e reservas ajudam cada convidado a escolher com
              segurança.
            </p>
          </article>
        </div>
      </div>

      <div className="flex justify-center">
        <Link to="/" className="ui-button-secondary">
          Voltar ao início
        </Link>
      </div>
    </section>
  )
}

export default AboutPage
