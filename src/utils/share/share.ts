import type { Wishlist } from '../../types/wishlist'

export function buildShareMessage(list: Wishlist) {
  const title = list.title || 'Lista de presentes'
  const typeLine = list.eventType ? `Evento: ${list.eventType}` : ''
  const dateLine = list.eventDate ? `Data: ${list.eventDate}` : ''
  const ownerLine = list.ownerName ? `Responsável: ${list.ownerName}` : ''
  const parts = [title, typeLine, dateLine, ownerLine, list.message].filter(Boolean)
  return parts.join('\n')
}

export function getShareUrl(list?: Wishlist) {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  if (list) {
    url.pathname = list.publicSlug
      ? `/g/${list.publicSlug}`
      : `/list/${list.id}/guest`
  }
  return url.toString()
}

export function getWhatsappLink(list: Wishlist) {
  const message = `${buildShareMessage(list)}\n${getShareUrl(list)}`.trim()
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
