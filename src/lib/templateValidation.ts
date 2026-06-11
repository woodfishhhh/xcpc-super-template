import { z } from 'zod'
import { getCategoryBand, isLearningOrderInBand, templateTopCategories } from '@/lib/templateTaxonomy'
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

export interface TemplateValidationOptions {
  requiredTopCategories?: readonly string[]
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

export function validateTemplatePackages(
  packages: TemplatePackage[],
  options: TemplateValidationOptions = {}
): TemplateValidationResult {
  const errors: string[] = []
  const seenIds = new Map<string, string>()
  const coveredTopCategories = new Set<string>()

  for (const item of packages) {
    const parsed = publicTemplateMetaSchema.safeParse(item.meta)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`${item.directory}: meta.json ${issue.path.join('.') || 'root'} ${issue.message}`)
      }
      continue
    }

    const meta = parsed.data satisfies TemplateMeta
    const topCategory = meta.category[0] ?? ''
    coveredTopCategories.add(topCategory)
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

    const categoryBand = getCategoryBand(topCategory)
    if (!categoryBand) {
      errors.push(
        `${item.directory}: unsupported top-level category "${topCategory}". Expected one of ${templateTopCategories.join(', ')}`
      )
    } else if (!isLearningOrderInBand(topCategory, meta.learningOrder)) {
      const [min, max] = categoryBand.range
      errors.push(
        `${item.directory}: learningOrder ${meta.learningOrder} is outside ${topCategory} range ${min}-${max}`
      )
    }

    if (item.code.trim().length === 0) {
      errors.push(`${item.directory}: code.md is empty`)
    }
  }

  for (const topCategory of options.requiredTopCategories ?? []) {
    if (!coveredTopCategories.has(topCategory)) {
      errors.push(`public catalog: missing top-level category "${topCategory}"`)
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
