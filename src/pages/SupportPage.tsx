import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/ui/Icon'
import Modal from '../components/ui/Modal'

const contactEmail = 'rodrigobertipalha25@gmail.com'

type SupportTopic = {
  id: 'problem' | 'story' | 'idea'
  title: string
  description: string
  question: string
  subject: string
  icon: 'info' | 'heart' | 'plus'
  prompt: string
}

const supportTopics: SupportTopic[] = [
  {
    id: 'problem',
    title: 'Reportar problema',
    description: 'Algo quebrou, não carregou ou apareceu diferente do esperado.',
    question: 'Quer reportar um problema?',
    subject: 'Reportar problema no Mimo Meu',
    icon: 'info',
    prompt:
      'Descreva o que aconteceu, em qual tela estava e, se possível, o passo a passo para repetir.',
  },
  {
    id: 'story',
    title: 'Relatar algo',
    description: 'Conte como foi sua experiência criando ou compartilhando listas.',
    question: 'Quer relatar algo que aconteceu?',
    subject: 'Relato sobre o Mimo Meu',
    icon: 'heart',
    prompt:
      'Conte sua experiência, o que funcionou bem e qualquer detalhe que ajude a entender o contexto.',
  },
  {
    id: 'idea',
    title: 'Sugerir melhoria',
    description:
      'Ideias de ajustes, recursos novos ou detalhes que deixariam tudo mais simples.',
    question: 'Quer sugerir uma melhoria?',
    subject: 'Sugestão para o Mimo Meu',
    icon: 'plus',
    prompt:
      'Explique sua ideia, por que ela ajudaria e como imagina que ela poderia funcionar.',
  },
]

function buildMailTo(topic: SupportTopic) {
  const body = `Olá, Rodrigo.

${topic.question}

${topic.prompt}

Mensagem:
`

  return `mailto:${contactEmail}?subject=${encodeURIComponent(
    topic.subject
  )}&body=${encodeURIComponent(body)}`
}

function SupportPage() {
  const [selectedTopic, setSelectedTopic] = useState<SupportTopic | null>(null)
  const generalTopic = supportTopics[0]

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
          <a href={buildMailTo(generalTopic)} className="ui-button-primary">
            <Icon name="mail" className="h-5 w-5" />
            Enviar e-mail
          </a>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {supportTopics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-4 text-left transition hover:border-[var(--color-primary-deep)] hover:bg-[var(--color-card)] focus:outline-none focus:ring-4 focus:ring-[rgba(141,163,130,0.18)]"
              onClick={() => setSelectedTopic(topic)}
            >
              <Icon
                name={topic.icon}
                className="h-5 w-5 text-[var(--color-primary-deep)]"
              />
              <h2 className="mt-4 text-base font-extrabold">{topic.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                {topic.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      <div className="flex justify-center">
        <Link to="/" className="ui-button-secondary">
          Voltar ao início
        </Link>
      </div>

      {selectedTopic ? (
        <Modal
          title={selectedTopic.title}
          description={selectedTopic.question}
          onClose={() => setSelectedTopic(null)}
        >
          <div className="grid gap-5">
            <p className="text-sm leading-6 text-[var(--color-muted)]">
              {selectedTopic.prompt}
            </p>
            <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-4">
              <p className="text-xs font-bold text-[var(--color-muted)]">
                Enviar para
              </p>
              <p className="mt-2 break-words text-lg font-extrabold text-[var(--color-primary-deep)]">
                {contactEmail}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="ui-button-secondary w-full"
                onClick={() => setSelectedTopic(null)}
              >
                Cancelar
              </button>
              <a
                href={buildMailTo(selectedTopic)}
                className="ui-button-primary w-full"
              >
                <Icon name="mail" className="h-5 w-5" />
                Escrever e-mail
              </a>
            </div>
          </div>
        </Modal>
      ) : null}
    </section>
  )
}

export default SupportPage
