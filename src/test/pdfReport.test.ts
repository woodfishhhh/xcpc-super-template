import { describe, expect, it } from 'vitest'
import { createPdfLayoutReport } from '@/lib/pdfReport'
import { buildPrintableHtml, resolvePrintSections } from '@/lib/printDocument'
import type { PrintConfig, PrintSelection, TemplateEntry } from '@/types/template'

const config: PrintConfig = {
  title: 'PDF 检查样本',
  includeToc: true,
  tocDepth: 2,
  layout: 'compact',
  output: 'pdf',
  sortMode: 'learning'
}

const templates: TemplateEntry[] = [
  {
    id: 'graph.shortest-path.long',
    title: '超长标题模板用于检查目录和章节排版稳定性ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    category: ['图论', '最短路'],
    learningOrder: 210,
    tags: ['graph'],
    timeComplexity: 'O(nm log n + repeated relaxation with several implementation dependent constants)',
    spaceComplexity: 'O(n + m)',
    brief: '用于测试 PDF 风险提示。',
    detail: '用于测试 PDF 风险提示。',
    codeLanguage: 'cpp',
    code: `int very_long_line = ${'1'.repeat(150)};`,
    source: 'public'
  },
  {
    id: 'string.kmp',
    title: 'KMP',
    category: ['字符串', '匹配'],
    learningOrder: 320,
    tags: ['string'],
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(n)',
    brief: '字符串匹配。',
    detail: '字符串匹配。',
    codeLanguage: 'cpp',
    code: 'void kmp();',
    source: 'public'
  }
]

const selections: PrintSelection[] = [
  { templateId: 'graph.shortest-path.long', detailLevel: 'brief' },
  { templateId: 'string.kmp', detailLevel: 'detail' }
]

describe('PDF layout report', () => {
  it('reports toc pages and missing page errors', () => {
    const sections = resolvePrintSections(templates, selections)
    const report = createPdfLayoutReport({
      config,
      sections,
      pageCount: 5,
      pageMap: new Map([['graph.shortest-path.long', 3]])
    })

    expect(report.pageCount).toBe(5)
    expect(report.templateCount).toBe(2)
    expect(report.tocEntries).toEqual([
      expect.objectContaining({ templateId: 'graph.shortest-path.long', page: 3 }),
      expect.objectContaining({ templateId: 'string.kmp', page: null })
    ])
    expect(report.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'missing-page', severity: 'error', templateId: 'string.kmp' }),
        expect.objectContaining({ code: 'long-code-line', severity: 'warning' }),
        expect.objectContaining({ code: 'long-complexity', severity: 'info' }),
        expect.objectContaining({ code: 'long-title', severity: 'info' })
      ])
    )
  })

  it('renders stable printable html with resolved toc pages and pagination guards', () => {
    const html = buildPrintableHtml(
      config,
      templates,
      selections,
      new Map([
        ['graph.shortest-path.long', 3],
        ['string.kmp', 4]
      ])
    )

    expect(html).toContain('<nav class="toc">')
    expect(html).toContain('data-toc-template-id="string.kmp"')
    expect(html).toContain('<span>4</span>')
    expect(html).toContain('break-after: avoid-page')
    expect(html).toContain('break-inside: avoid-page')
    expect(html).toContain('overflow-wrap: anywhere')
  })
})
