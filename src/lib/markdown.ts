import type { DetailLevel, PrintConfig, PrintSelection, TemplateEntry } from '@/types/template'
import { toMarkdownCodeBlock } from '@/lib/code'

export function generateMarkdown(
  config: PrintConfig,
  templates: TemplateEntry[],
  selections: PrintSelection[]
): string {
  const byId = new Map(templates.map((template) => [template.id, template]))
  const selected = selections
    .map((selection) => ({
      selection,
      template: byId.get(selection.templateId)
    }))
    .filter((item): item is { selection: PrintSelection; template: TemplateEntry } =>
      Boolean(item.template)
    )
  const lines: string[] = [`# ${config.title.trim() || 'XCPC 打印稿'}`, '']

  if (config.includeToc) {
    lines.push('## 目录', '')
    for (const group of groupByTopCategory(selected.map((item) => item.template))) {
      lines.push(`- [${group.category}](#${slugifyHeading(group.category)})`)
      if (config.tocDepth >= 2) {
        for (const template of group.templates) {
          lines.push(`  - [${template.title}](#${slugifyHeading(template.title)})`)
        }
      }
    }
    lines.push('')
  }

  for (const group of groupByTopCategory(selected.map((item) => item.template))) {
    lines.push(`## ${group.category}`, '')
    for (const template of group.templates) {
      const detailLevel =
        selected.find((item) => item.template.id === template.id)?.selection.detailLevel ?? 'brief'
      lines.push(...renderTemplateMarkdown(template, detailLevel))
    }
  }

  return `${lines.join('\n').trim()}\n`
}

export function renderTemplateMarkdown(template: TemplateEntry, detailLevel: DetailLevel): string[] {
  const lines = [`### ${template.title}`, '']

  lines.push(`时间复杂度：\`${template.timeComplexity || '未注明'}\``)
  lines.push(`空间复杂度：\`${template.spaceComplexity || '未注明'}\``)
  lines.push('')

  if (detailLevel === 'brief' && template.brief.trim()) {
    lines.push(template.brief.trim(), '')
  }

  if (detailLevel === 'detail' && template.detail.trim()) {
    lines.push(template.detail.trim(), '')
  }

  lines.push(toMarkdownCodeBlock(template.code, template.codeLanguage), '')
  return lines
}

function groupByTopCategory(templates: TemplateEntry[]): Array<{
  category: string
  templates: TemplateEntry[]
}> {
  const groups = new Map<string, TemplateEntry[]>()
  for (const template of templates) {
    const category = template.category[0] ?? '未分类'
    groups.set(category, [...(groups.get(category) ?? []), template])
  }

  return [...groups].map(([category, groupTemplates]) => ({
    category,
    templates: groupTemplates
  }))
}

function slugifyHeading(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}
