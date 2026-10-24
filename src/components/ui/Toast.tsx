import { createPortal } from 'react-dom'
import Icon from './Icon'

type ToastProps = {
  message: string
  tone?: 'success' | 'error'
  onClose?: () => void
}

function Toast({ message, tone = 'success', onClose }: ToastProps) {
  if (!message) return null

  const toneClass =
    tone === 'error'
      ? 'border-[var(--color-danger)] text-[var(--color-danger)]'
      : 'border-[var(--color-primary-deep)] text-[var(--color-primary-deep)]'

  return createPortal(
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`fixed bottom-4 left-1/2 z-[60] flex w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 items-start gap-3 rounded-lg border bg-[var(--color-card)] px-4 py-3 text-sm font-bold shadow-[var(--shadow-soft)] ${toneClass}`}
    >
      <Icon name={tone === 'error' ? 'info' : 'check'} className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{message}</p>
      {onClose ? (
        <button
          type="button"
          className="shrink-0 text-xs font-extrabold underline-offset-4 hover:underline"
          onClick={onClose}
        >
          Fechar
        </button>
      ) : null}
    </div>,
    document.body
  )
}

export default Toast
