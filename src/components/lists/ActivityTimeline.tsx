import type { WishlistActivity } from '../../types/wishlist'
import { normalizeWishlistActivity } from '../../utils/activity'
import Icon from '../ui/Icon'

type ActivityTimelineProps = {
  activity: WishlistActivity[]
  createdAt: string
}

function formatActivityDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Agora'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function activityIcon(
  type: WishlistActivity['type']
): 'gift' | 'heart' | 'check' | 'info' {
  if (type === 'gift_added' || type === 'gift_updated') return 'gift'
  if (type === 'gift_reserved') return 'heart'
  if (type === 'reservation_released') return 'check'

  return 'info'
}

function ActivityTimeline({ activity, createdAt }: ActivityTimelineProps) {
  const items = normalizeWishlistActivity(activity)
  const timelineItems = items.length
    ? items
    : [
        {
          id: 'activity-created-fallback',
          type: 'list_created' as const,
          message: 'Lista criada.',
          createdAt,
        },
      ]

  return (
    <section className="grid gap-4">
      <div>
        <p className="ui-kicker">Atividade</p>
        <h2 className="mt-1 text-3xl font-extrabold">Histórico da lista</h2>
      </div>

      <ol className="grid gap-3">
        {timelineItems.slice(0, 8).map((entry) => (
          <li
            key={entry.id}
            className="flex gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-translucent)] p-4"
          >
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary-deep)]">
              <Icon name={activityIcon(entry.type)} className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="break-words text-sm font-extrabold text-[var(--color-text)]">
                {entry.message}
              </p>
              <p className="mt-1 text-xs font-semibold text-[var(--color-muted)]">
                {formatActivityDate(entry.createdAt)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default ActivityTimeline
