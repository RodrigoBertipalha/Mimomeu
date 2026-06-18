import { useState } from 'react'
import type { Wishlist } from '../../types/wishlist'
import {
  buildShareMessage,
  getShareUrl,
  getWhatsappLink,
} from '../../utils/share/share'
import { getListTypeConfig } from '../../utils/listTypes'
import Icon from '../ui/Icon'

type ShareCardProps = {
  list: Wishlist
}

function ShareCard({ list }: ShareCardProps) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')
  const shareUrl = getShareUrl(list)
  const whatsappLink = getWhatsappLink(list)
  const config = getListTypeConfig(list.listKind)
  const mailLink = `mailto:?subject=${encodeURIComponent(
    list.title || config.name
  )}&body=${encodeURIComponent(`${buildShareMessage(list)}\n${shareUrl}`)}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setCopyError('')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
      setCopyError('Não foi possível copiar automaticamente. Selecione o link e copie manualmente.')
    }
  }

  return (
    <section className="grid gap-8 text-center">
      <div>
        <span className="mx-auto inline-flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary-deep)] shadow-[var(--shadow-control)]">
          <Icon name="share" className="h-10 w-10" />
        </span>
        <h2 className="mt-7 text-4xl font-extrabold text-[var(--color-primary-deep)]">
          {config.shareTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[var(--color-secondary-deep)]">
          {config.shareDescription}
        </p>
      </div>

      <div className="ui-panel mx-auto w-full max-w-3xl p-6 text-left sm:p-8">
        <label className="ui-label">
          Link da lista
          <div className="grid gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-1 sm:grid-cols-[1fr_auto]">
            <input
              className="min-h-12 bg-transparent px-4 text-sm font-semibold text-[var(--color-text)] outline-none"
              value={shareUrl}
              readOnly
              aria-label="Link da lista"
              onFocus={(event) => event.currentTarget.select()}
            />
            <button
              type="button"
              className="ui-button-primary rounded-md"
              onClick={handleCopy}
            >
              <Icon name="copy" className="h-5 w-5" />
              {copied ? 'Link copiado' : 'Copiar link'}
            </button>
          </div>
          <div aria-live="polite">
            {copied ? (
              <p className="mt-3 rounded-md bg-[var(--color-primary-soft)] px-4 py-3 text-sm font-bold text-[var(--color-primary-deep)]">
                Link copiado.
              </p>
            ) : null}
            {copyError ? (
              <p className="mt-3 rounded-md bg-[rgba(198,29,29,0.1)] px-4 py-3 text-sm font-bold text-[var(--color-danger)]">
                {copyError}
              </p>
            ) : null}
          </div>
        </label>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#2ad267] px-5 text-sm font-extrabold text-white shadow-[var(--shadow-control)] transition hover:bg-[#25bd5c]"
          >
            <Icon name="share" className="h-5 w-5" />
            Compartilhar no WhatsApp
          </a>
          <a href={mailLink} className="ui-button-secondary h-14">
            <Icon name="mail" className="h-5 w-5" />
            Enviar por e-mail
          </a>
        </div>
      </div>
    </section>
  )
}

export default ShareCard
