import { stripCodeFence } from '@/lib/code'
import type { PrintConfig } from '@/types/template'
import type { PrintSection } from '@/lib/printDocument'

export type PdfLayoutWarningSeverity = 'info' | 'warning' | 'error'

export interface PdfTocEntry {
  templateId: string
  title: string
  category: string
  page: number | null
}

export interface PdfLayoutWarning {
  code:
    | 'missing-page'
    | 'missing-page-header'
    | 'missing-page-footer'
    | 'horizontal-overflow'
    | 'orphan-heading'
    | 'long-code-line'
    | 'long-complexity'
    | 'long-title'
  severity: PdfLayoutWarningSeverity
  message: string
  templateId?: string
  title?: string
  page?: number
}

export interface PdfLayoutReport {
  generatedAt: string
  layout: PrintConfig['layout']
  includeToc: boolean
  tocDepth: PrintConfig['tocDepth']
  pageCount: number
  templateCount: number
  tocEntries: PdfTocEntry[]
  warnings: PdfLayoutWarning[]
}

export interface CreatePdfLayoutReportOptions {
  config: PrintConfig
  sections: PrintSection[]
  pageMap: Map<string, number>
  pageCount: number
  visualWarnings?: PdfLayoutWarning[]
}

const longCodeLineLimit = 140
const longComplexityLimit = 86
const longTitleLimit = 30

export function createPdfLayoutReport({
  config,
  sections,
  pageMap,
  pageCount,
  visualWarnings = []
}: CreatePdfLayoutReportOptions): PdfLayoutReport {
  const tocEntries = sections.map((section) => ({
    templateId: section.template.id,
    title: section.template.title,
    category: section.template.category[0] ?? '未分类',
    page: pageMap.get(section.template.id) ?? null
  }))

  const warnings: PdfLayoutWarning[] = [
    ...findMissingPageWarnings(tocEntries),
    ...findContentWarnings(sections),
    ...visualWarnings
  ]

  return {
    generatedAt: new Date().toISOString(),
    layout: config.layout,
    includeToc: config.includeToc,
    tocDepth: config.tocDepth,
    pageCount,
    templateCount: sections.length,
    tocEntries,
    warnings: dedupeWarnings(warnings)
  }
}

function findMissingPageWarnings(tocEntries: PdfTocEntry[]): PdfLayoutWarning[] {
  return tocEntries.flatMap((entry) =>
    entry.page === null
      ? [
          {
            code: 'missing-page',
            severity: 'error',
            message: `目录无法定位「${entry.title}」的页码。`,
            templateId: entry.templateId,
            title: entry.title
          } satisfies PdfLayoutWarning
        ]
      : []
  )
}

function findContentWarnings(sections: PrintSection[]): PdfLayoutWarning[] {
  return sections.flatMap((section) => {
    const warnings: PdfLayoutWarning[] = []
    const { template } = section
    const code = stripCodeFence(template.code)
    const longestLine = Math.max(0, ...code.split(/\r?\n/).map((line) => line.length))
    const complexityLength = `${template.timeComplexity} ${template.spaceComplexity}`.length

    if (longestLine > longCodeLineLimit) {
      warnings.push({
        code: 'long-code-line',
        severity: 'warning',
        message: `「${template.title}」存在 ${longestLine} 字符的长代码行，PDF 会自动换行，建议导出前检查可读性。`,
        templateId: template.id,
        title: template.title
      })
    }

    if (complexityLength > longComplexityLimit) {
      warnings.push({
        code: 'long-complexity',
        severity: 'info',
        message: `「${template.title}」的复杂度文字较长，可能占用多行。`,
        templateId: template.id,
        title: template.title
      })
    }

    if (template.title.length > longTitleLimit) {
      warnings.push({
        code: 'long-title',
        severity: 'info',
        message: `「${template.title}」标题较长，可能影响目录和章节排版。`,
        templateId: template.id,
        title: template.title
      })
    }

    return warnings
  })
}

function dedupeWarnings(warnings: PdfLayoutWarning[]): PdfLayoutWarning[] {
  const seen = new Set<string>()
  return warnings.filter((warning) => {
    const key = `${warning.code}:${warning.templateId ?? ''}:${warning.page ?? ''}:${warning.message}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
