import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'

type ModalProps = {
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  size?: 'default' | 'wide'
}

function Modal({
  title,
  description,
  children,
  onClose,
  size = 'default',
}: ModalProps) {
  const widthClass = size === 'wide' ? 'max-w-6xl' : 'max-w-3xl'
  useBodyScrollLock()

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[var(--color-modal-backdrop)] px-4 py-8 backdrop-blur-md"
      onClick={onClose}
    >
      <section
        className={`ui-panel w-full ${widthClass} p-5 sm:p-6`}
        onClick={(event) => event.stopPropagation()}
      >
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
