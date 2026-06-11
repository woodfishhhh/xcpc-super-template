import { stripCodeFence } from '@/lib/code'
import type { PrintSelection, TemplateEntry } from '@/types/template'

export type DraftCheckSeverity = 'error' | 'warning' | 'info'

export type DraftCheckCode =
  | 'duplicate-template'
  | 'missing-template'
  | 'empty-code'
  | 'missing-complexity'
  | 'long-code'

export interface DraftCheckIssue {
  code: DraftCheckCode
  severity: DraftCheckSeverity
  templateId?: string
  title?: string
  message: string
}

export interface DraftCheckReport {
  issueCount: number
  errorCount: number
  warningCount: number
  infoCount: number
  issues: DraftCheckIssue[]
}

const LONG_CODE_LINE_THRESHOLD = 180

export function inspectDraftComposition(
  templates: TemplateEntry[],
  selections: PrintSelection[]
): DraftCheckReport {
  const byId = new Map(templates.map((template) => [template.id, template]))
  const issues: DraftCheckIssue[] = []
  const seenSelectionIds = new Set<string>()
  const duplicateIds = new Set<string>()
  const inspectedTemplateIds = new Set<string>()

  for (const selection of selections) {
    if (seenSelectionIds.has(selection.templateId) && !duplicateIds.has(selection.templateId)) {
      duplicateIds.add(selection.templateId)
      const template = byId.get(selection.templateId)
      issues.push({
        code: 'duplicate-template',
        severity: 'error',
        templateId: selection.templateId,
        title: template?.title,
        message: template
          ? `${template.title} 在当前打印稿中重复出现`
          : `模板 ${selection.templateId} 在当前打印稿中重复出现`
      })
    }
    seenSelectionIds.add(selection.templateId)
  }

  for (const selection of selections) {
    if (inspectedTemplateIds.has(selection.templateId)) continue
    inspectedTemplateIds.add(selection.templateId)

    const template = byId.get(selection.templateId)
    if (!template) {
      issues.push({
        code: 'missing-template',
        severity: 'error',
        templateId: selection.templateId,
        message: `找不到模板 ${selection.templateId}`
      })
    }
  }

  inspectedTemplateIds.clear()

  for (const selection of selections) {
    if (inspectedTemplateIds.has(selection.templateId)) continue
    inspectedTemplateIds.add(selection.templateId)

    const template = byId.get(selection.templateId)
    if (!template) continue

    const code = stripCodeFence(template.code).trim()
    if (!code) {
      issues.push({
        code: 'empty-code',
        severity: 'error',
        templateId: template.id,
        title: template.title,
        message: `${template.title} 代码为空`
      })
    }

    if (isMissingComplexity(template.timeComplexity) || isMissingComplexity(template.spaceComplexity)) {
      issues.push({
        code: 'missing-complexity',
        severity: 'warning',
        templateId: template.id,
        title: template.title,
        message: `${template.title} 缺少时间复杂度或空间复杂度`
      })
    }

    const lineCount = code ? code.split(/\r?\n/).length : 0
    if (lineCount > LONG_CODE_LINE_THRESHOLD) {
      issues.push({
        code: 'long-code',
        severity: 'warning',
        templateId: template.id,
        title: template.title,
        message: `${template.title} 代码 ${lineCount} 行，导出前建议检查分页`
      })
    }
  }

  const errorCount = issues.filter((issue) => issue.severity === 'error').length
  const warningCount = issues.filter((issue) => issue.severity === 'warning').length
  const infoCount = issues.filter((issue) => issue.severity === 'info').length

  return {
    issueCount: issues.length,
    errorCount,
    warningCount,
    infoCount,
    issues
  }
}

export function canExportDraft(report: DraftCheckReport): boolean {
  return report.errorCount === 0
}

function isMissingComplexity(value: string): boolean {
  const normalized = value.trim().toLowerCase()
  return !normalized || normalized === '未注明' || normalized === 'todo' || normalized === 'unknown'
}
