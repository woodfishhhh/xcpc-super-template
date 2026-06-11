import { z } from 'zod'
import type { PersonalLibraryExport, TemplateEntry } from '@/types/template'
import { stripCodeFence } from '@/lib/code'
import { createPersonalTemplateId } from '@/lib/templates'

const templateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.array(z.string()).default([]),
  learningOrder: z.number().default(9000),
  tags: z.array(z.string()).default([]),
  timeComplexity: z.string().default('未注明'),
  spaceComplexity: z.string().default('未注明'),
  brief: z.string().default(''),
  detail: z.string().default(''),
  codeLanguage: z.string().default('cpp'),
  code: z.string().default(''),
  source: z.enum(['public', 'personal']).default('personal'),
  origin: z
    .object({
      name: z.string(),
      url: z.string().optional(),
      license: z.string().optional()
    })
    .optional(),
  updatedAt: z.string().optional()
})

const librarySchema = z.object({
  schemaVersion: z.literal(1).default(1),
  exportedAt: z.string().optional(),
  templates: z.array(templateSchema)
})

export function exportPersonalLibrary(templates: TemplateEntry[]): string {
  const payload: PersonalLibraryExport = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    templates: templates.map((template) => ({
      ...template,
      source: 'personal'
    }))
  }

  return JSON.stringify(payload, null, 2)
}

export function importPersonalLibrary(json: string, existingIds: Set<string>): TemplateEntry[] {
  const parsed = librarySchema.parse(JSON.parse(json))
  const usedIds = new Set(existingIds)

  return parsed.templates.map((template) => {
    const id = usedIds.has(template.id)
      ? createPersonalTemplateId(template.title, usedIds)
      : template.id
    usedIds.add(id)

    return {
      ...template,
      id,
      code: stripCodeFence(template.code),
      source: 'personal' as const,
      updatedAt: template.updatedAt ?? new Date().toISOString()
    }
  })
}
