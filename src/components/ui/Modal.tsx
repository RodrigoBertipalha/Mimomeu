import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
}

function Modal({ title, description, children, onClose }: ModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[rgba(36,39,33,0.28)] px-4 py-8 backdrop-blur-sm">
      <section className="ui-panel w-full max-w-3xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">{title}</h2>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="ui-button-secondary h-10 px-4"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </section>
    </div>,
    document.body
  )
}

export default Modal
