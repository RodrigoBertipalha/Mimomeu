import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/authContext'
import Icon from '../components/ui/Icon'
import Modal from '../components/ui/Modal'
import { sendSupportMessage } from '../services/supportRepository'

const contactEmail = 'rodrigobertipalha25@gmail.com'
const messageLimit = 700

type SupportTopic = {
  id: 'problem' | 'story' | 'idea'
  title: string
  description: string
  question: string
  icon: 'info' | 'heart' | 'plus'
  prompt: string
}

const supportTopics: SupportTopic[] = [
  {
    id: 'problem',
    title: 'Reportar problema',
    description: 'Algo quebrou, não carregou ou apareceu diferente do esperado.',
    question: 'O que aconteceu?',
    icon: 'info',
    prompt:
      'Descreva a tela, o que tentou fazer e o passo a passo para repetir, se souber.',
  },
  {
    id: 'story',
    title: 'Relatar algo',
    description: 'Conte como foi sua experiência criando ou compartilhando listas.',
    question: 'O que você quer relatar?',
    icon: 'heart',
    prompt:
      'Conte sua experiência e qualquer detalhe que ajude a entender o contexto.',
  },
  {
    id: 'idea',
    title: 'Sugerir melhoria',
    description:
      'Ideias de ajustes, recursos novos ou detalhes que deixariam tudo mais simples.',
    question: 'Qual melhoria você imagina?',
    icon: 'plus',
    prompt:
      'Explique sua ideia, por que ela ajudaria e como imagina que ela poderia funcionar.',
  },
]

function SupportPage() {
  const { user } = useAuth()
  const [selectedTopic, setSelectedTopic] = useState<SupportTopic | null>(null)
  const [senderName, setSenderName] = useState('')
  const [senderContact, setSenderContact] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const remainingCharacters = messageLimit - message.length

  function openTopic(topic: SupportTopic) {
    setSelectedTopic(topic)
    setStatus('')
    setError('')
    setMessage('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedTopic || isSending) return

    const trimmedMessage = message.trim()
    if (trimmedMessage.length < 10) {
      setError('Escreva pelo menos 10 caracteres.')
      return
    }

    setIsSending(true)
    setError('')
    setStatus('')

    try {
      const result = await sendSupportMessage({
        topic: selectedTopic.id,
        topicTitle: selectedTopic.title,
        name: senderName,
        contact: senderContact,
        message: trimmedMessage,
        userId: user?.id,
      })

      setStatus(
        result.storedLocally
          ? 'Mensagem salva neste navegador. Com Supabase configurado, ela será enviada para o banco.'
          : 'Mensagem enviada. Obrigado por ajudar a melhorar o Mimo Meu.'
      )
      setMessage('')
    } catch {
      setError(
        `Não foi possível enviar agora. Se preferir, fale pelo e-mail ${contactEmail}.`
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section className="mx-auto grid max-w-4xl gap-8">
      <header className="text-center">
        <p className="ui-kicker">Suporte</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
          Como posso te ajudar?
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
          Escolha um assunto e escreva a mensagem por aqui. O texto fica dentro
          da própria página, com limite de caracteres para ficar direto ao ponto.
        </p>
      </header>

      <section className="ui-panel grid gap-6 p-6 sm:p-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {supportTopics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-4 text-left transition hover:border-[var(--color-primary-deep)] hover:bg-[var(--color-card)] focus:outline-none focus:ring-4 focus:ring-[rgba(141,163,130,0.18)]"
              onClick={() => openTopic(topic)}
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

        <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-4">
          <p className="text-xs font-bold text-[var(--color-muted)]">
            Contato direto
          </p>
          <a
            href={`mailto:${contactEmail}`}
            className="mt-2 block break-words text-base font-extrabold text-[var(--color-primary-deep)] underline-offset-4 hover:underline"
          >
            {contactEmail}
          </a>
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
          description={selectedTopic.prompt}
          onClose={() => setSelectedTopic(null)}
        >
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="ui-label">
                <span className="flex items-center justify-between gap-3">
                  Nome
                  <span className="text-[10px] font-semibold text-[var(--color-subtle)]">
                    Opcional
                  </span>
                </span>
                <input
                  className="ui-field"
                  placeholder="Como podemos te chamar?"
                  value={senderName}
                  onChange={(event) => setSenderName(event.target.value)}
                />
              </label>

              <label className="ui-label">
                <span className="flex items-center justify-between gap-3">
                  Contato
                  <span className="text-[10px] font-semibold text-[var(--color-subtle)]">
                    Opcional
                  </span>
                </span>
                <input
                  className="ui-field"
                  placeholder="E-mail, WhatsApp ou outro contato"
                  value={senderContact}
                  onChange={(event) => setSenderContact(event.target.value)}
                />
              </label>
            </div>

            <label className="ui-label">
              <span className="flex items-center justify-between gap-3">
                {selectedTopic.question}
                <span className="text-[10px] font-bold text-[var(--color-primary-deep)]">
                  Obrigatório
                </span>
              </span>
              <textarea
                className="ui-field min-h-[180px] resize-y"
                placeholder="Escreva sua mensagem..."
                value={message}
                maxLength={messageLimit}
                onChange={(event) => setMessage(event.target.value)}
                required
              />
              <span
                className={
                  remainingCharacters < 80
                    ? 'text-xs font-bold text-[var(--color-tertiary-deep)]'
                    : 'text-xs font-semibold text-[var(--color-muted)]'
                }
              >
                {remainingCharacters} caracteres restantes
              </span>
            </label>

            {status ? (
              <p className="rounded-md bg-[var(--color-primary-soft)] px-4 py-3 text-sm font-bold text-[var(--color-primary-deep)]">
                {status}
              </p>
            ) : null}

            {error ? (
              <p className="rounded-md bg-[rgba(198,29,29,0.1)] px-4 py-3 text-sm font-bold text-[var(--color-danger)]">
                {error}
              </p>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="ui-button-secondary w-full"
                onClick={() => setSelectedTopic(null)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="ui-button-primary w-full"
                disabled={isSending || message.trim().length < 10}
              >
                <Icon name="mail" className="h-5 w-5" />
                {isSending ? 'Enviando...' : 'Enviar mensagem'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  )
}

export default SupportPage
