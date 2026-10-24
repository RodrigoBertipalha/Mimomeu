export function formatEventDate(value: string, style: 'short' | 'long' = 'short') {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '')
  if (!match) return ''

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))

  return new Intl.DateTimeFormat(
    'pt-BR',
    style === 'long'
      ? { day: 'numeric', month: 'long', year: 'numeric' }
      : { day: '2-digit', month: '2-digit', year: 'numeric' }
  ).format(date)
}
