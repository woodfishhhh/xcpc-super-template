import { z } from 'zod'
import type { PersonalLibraryExport, TemplateEntry } from '@/types/template'
import { stripCodeFence } from '@/lib/code'
import { createPersonalTemplateId } from '@/lib/templates'

export interface PersonalLibraryImportResult {
  ok: boolean
  templates: TemplateEntry[]
  importedCount: number
  renamedCount: number
  errors: string[]
}

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
  return importPersonalLibraryWithReport(json, existingIds).templates
}

export function importPersonalLibraryWithReport(
  json: string,
  existingIds: Set<string>
): PersonalLibraryImportResult {
  let payload: unknown
  try {
    payload = JSON.parse(json)
  } catch {
    return {
      ok: false,
      templates: [],
      importedCount: 0,
      renamedCount: 0,
      errors: ['个人模板 JSON 无法解析']
    }
  }

  const parsed = librarySchema.safeParse(payload)
  if (!parsed.success) {
    return {
      ok: false,
      templates: [],
      importedCount: 0,
      renamedCount: 0,
      errors: ['个人模板 JSON 格式不正确']
    }
  }

  const usedIds = new Set(existingIds)
  let renamedCount = 0

  const templates = parsed.data.templates.map((template) => {
    const hasConflict = usedIds.has(template.id)
    const id = usedIds.has(template.id)
      ? createPersonalTemplateId(template.title, usedIds)
      : template.id
    if (hasConflict) renamedCount += 1
    usedIds.add(id)

    return {
      ...template,
      id,
      code: stripCodeFence(template.code),
      source: 'personal' as const,
      updatedAt: template.updatedAt ?? new Date().toISOString()
    }
  })

  return {
    ok: true,
    templates,
    importedCount: templates.length,
    renamedCount,
    errors: []
  }
}
