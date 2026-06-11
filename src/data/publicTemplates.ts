import type { TemplateEntry, TemplateMeta } from '@/types/template'
import { stripCodeFence } from '@/lib/code'
import { sortTemplates } from '@/lib/templates'

const metaModules = import.meta.glob('../../板子/**/meta.json', {
  eager: true,
  import: 'default',
  query: '?raw'
}) as Record<string, string>

const codeModules = import.meta.glob('../../板子/**/code.md', {
  eager: true,
  import: 'default',
  query: '?raw'
}) as Record<string, string>

export function loadPublicTemplates(): TemplateEntry[] {
  const templates = Object.entries(metaModules).map(([metaPath, rawMeta]) => {
    const codePath = metaPath.replace(/meta\.json$/, 'code.md')
    const meta = JSON.parse(rawMeta) as TemplateMeta
    const code = stripCodeFence(codeModules[codePath] ?? '// code.md missing')

    return {
      ...meta,
      code,
      source: 'public' as const,
      origin: meta.source
    }
  })

  return sortTemplates(templates, 'learning')
}
