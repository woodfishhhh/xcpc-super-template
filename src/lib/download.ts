import { sanitizeFilename } from '@/lib/utils'

export function downloadTextFile(filename: string, content: string, mime = 'text/markdown'): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = sanitizeFilename(filename)
  link.click()
  URL.revokeObjectURL(url)
}
