import { supabase } from '../lib/supabase'

const BUCKET = 'gift-images'
const PUBLIC_PATH_MARKER = `/storage/v1/object/public/${BUCKET}/`

export async function uploadGiftImage(image: Blob, userId: string, listId: string) {
  if (!supabase) throw new Error('Supabase não está configurado.')

  const extension = image.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${userId}/${listId}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, image, {
    contentType: image.type,
    cacheControl: '31536000',
    upsert: false,
  })

  if (error) throw error

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

function getStoragePath(url: string) {
  const index = url.indexOf(PUBLIC_PATH_MARKER)
  return index >= 0
    ? decodeURIComponent(url.slice(index + PUBLIC_PATH_MARKER.length))
    : null
}

export async function deleteGiftImages(urls: string[]) {
  const paths = urls
    .map(getStoragePath)
    .filter((path): path is string => Boolean(path))

  if (!paths.length || !supabase) return

  // Limpeza best-effort: um arquivo órfão não deve impedir a ação do usuário.
  const { error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) console.warn('Não foi possível apagar imagens antigas.', error)
}
