import type { MoveDirection, SortMode, TemplateEntry } from '@/types/template'
import type { PrintSelection } from '@/types/template'

const collator = new Intl.Collator('zh-CN', {
  numeric: true,
  sensitivity: 'base'
})

export function sortTemplates(templates: TemplateEntry[], sortMode: SortMode): TemplateEntry[] {
  if (sortMode === 'manual') {
    return [...templates]
  }

  return [...templates].sort((a, b) => {
    if (sortMode === 'learning') {
      const orderDiff = a.learningOrder - b.learningOrder
      if (orderDiff !== 0) return orderDiff
    }

    return compareTitle(a.title, b.title)
  })
}

export function moveSelection(
  selections: PrintSelection[],
  templateId: string,
  direction: MoveDirection
): PrintSelection[] {
  const next = [...selections]
  const index = next.findIndex((item) => item.templateId === templateId)
  if (index === -1) return next

  const [item] = next.splice(index, 1)
  if (!item) return selections

  const targetIndex = getMoveIndex(index, next.length, direction)
  next.splice(targetIndex, 0, item)
  return next
}

export function getSelectedTemplates(
  templates: TemplateEntry[],
  selections: PrintSelection[]
): TemplateEntry[] {
  const byId = new Map(templates.map((template) => [template.id, template]))
  return selections.flatMap((selection) => {
    const template = byId.get(selection.templateId)
    return template ? [template] : []
  })
}

export function mergeTemplateOverrides(
  publicTemplates: TemplateEntry[],
  personalTemplates: TemplateEntry[]
): TemplateEntry[] {
  const publicIds = new Set(publicTemplates.map((template) => template.id))
  const personalById = new Map(personalTemplates.map((template) => [template.id, template]))
  const mergedPublic = publicTemplates.map((template) => personalById.get(template.id) ?? template)
  const standalonePersonal = personalTemplates.filter((template) => !publicIds.has(template.id))

  return [...mergedPublic, ...standalonePersonal]
}

export function hasDefaultTemplate(publicTemplates: TemplateEntry[], templateId: string): boolean {
  return publicTemplates.some((template) => template.id === templateId)
}

export function createPersonalTemplateId(title: string, existingIds: Set<string>): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
  const base = `personal.${slug || cryptoRandomId()}`
  let candidate = base
  let suffix = 2

  while (existingIds.has(candidate)) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }

  return candidate
}

export function normalizeCategoryPath(path: string): string[] {
  return path
    .split(/[/>\\]/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function getMoveIndex(index: number, lengthAfterRemoval: number, direction: MoveDirection): number {
  if (direction === 'top') return 0
  if (direction === 'bottom') return lengthAfterRemoval
  if (direction === 'up') return Math.max(0, index - 1)
  return Math.min(lengthAfterRemoval, index + 1)
}

function compareTitle(a: string, b: string): number {
  const aLatin = /^[A-Za-z0-9]/.test(a)
  const bLatin = /^[A-Za-z0-9]/.test(b)

  if (aLatin !== bLatin) {
    return aLatin ? -1 : 1
  }

  return collator.compare(a, b)
}

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().slice(0, 8)
  }

  return Math.random().toString(36).slice(2, 10)
}
