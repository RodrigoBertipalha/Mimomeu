import { useState } from 'react'
import Modal from './Modal'

type ConfirmDialogProps = {
  title: string
  description: string
  confirmLabel: string
  runningLabel?: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  runningLabel = 'Excluindo...',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [isRunning, setIsRunning] = useState(false)

  async function handleConfirm() {
    setIsRunning(true)
    try {
      await onConfirm()
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Modal title={title} description={description} onClose={onCancel}>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="ui-button-secondary w-full"
          onClick={onCancel}
          disabled={isRunning}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="ui-button-primary w-full border-[var(--color-danger)] bg-[var(--color-danger)] text-[var(--color-bg)] hover:bg-[var(--color-danger)] hover:opacity-90"
          onClick={handleConfirm}
          disabled={isRunning}
        >
          {isRunning ? runningLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
