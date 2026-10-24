const MAX_SIDE = 1200

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))
}

export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Não foi possível processar a imagem.')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const webp = await canvasToBlob(canvas, 'image/webp', 0.8)
  // Navegadores sem encoder WebP devolvem PNG; nesse caso usamos JPEG.
  if (webp?.type === 'image/webp') return webp

  const jpeg = await canvasToBlob(canvas, 'image/jpeg', 0.82)
  if (!jpeg) throw new Error('Não foi possível processar a imagem.')
  return jpeg
}
