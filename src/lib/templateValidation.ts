import { z } from 'zod'
import type { TemplateMeta } from '@/types/template'

export interface TemplatePackage {
  directory: string
  meta: unknown
  code: string
}

export interface TemplateValidationResult {
  ok: boolean
  errors: string[]
}

const sourceSchema = z.object({
  name: z.string().trim().min(1),
  url: z.string().url().optional(),
  license: z.string().trim().min(1)
})

export const publicTemplateMetaSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/),
  title: z.string().trim().min(1),
  category: z.array(z.string().trim().min(1)).min(1),
  learningOrder: z.number().int().nonnegative(),
  tags: z.array(z.string().trim().min(1)).min(1),
  timeComplexity: z.string().trim().min(1),
  spaceComplexity: z.string().trim().min(1),
  brief: z.string().trim().min(1),
  detail: z.string().trim().min(1),
  codeLanguage: z.string().trim().min(1),
  source: sourceSchema,
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})

export function validateTemplatePackages(packages: TemplatePackage[]): TemplateValidationResult {
  const errors: string[] = []
  const seenIds = new Map<string, string>()

  for (const item of packages) {
    const parsed = publicTemplateMetaSchema.safeParse(item.meta)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`${item.directory}: meta.json ${issue.path.join('.') || 'root'} ${issue.message}`)
      }
      continue
    }

    const meta = parsed.data satisfies TemplateMeta
    const previousDirectory = seenIds.get(meta.id)
    if (previousDirectory) {
      errors.push(`${item.directory}: duplicate id "${meta.id}" also used by ${previousDirectory}`)
    } else {
      seenIds.set(meta.id, item.directory)
    }

    const expectedCategory = getCategoryFromDirectory(item.directory)
    if (expectedCategory.length > 0 && !hasSamePath(meta.category, expectedCategory)) {
      errors.push(
        `${item.directory}: category path "${meta.category.join('/')}" does not match directory "${expectedCategory.join('/')}"`
      )
    }

    if (item.code.trim().length === 0) {
      errors.push(`${item.directory}: code.md is empty`)
    }
  }

  return {
    ok: errors.length === 0,
    errors
  }
}

function getCategoryFromDirectory(directory: string): string[] {
  const normalized = directory.replace(/\\/g, '/')
  const parts = normalized.split('/').filter(Boolean)
  const rootIndex = parts.lastIndexOf('板子')
  return rootIndex === -1 ? parts : parts.slice(rootIndex + 1)
}

function hasSamePath(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((part, index) => part === right[index])
}
