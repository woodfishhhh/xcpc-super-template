import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Previewer } from 'pagedjs'
import { buildPrintableHtml, resolvePrintSections, type PrintSection } from '@/lib/printDocument'
import { createPdfLayoutReport, type PdfLayoutReport, type PdfLayoutWarning } from '@/lib/pdfReport'
import { sanitizeFilename } from '@/lib/utils'
import type { PrintConfig, PrintSelection, TemplateEntry } from '@/types/template'

interface PagedLayout {
  host: HTMLElement
  sections: PrintSection[]
  pageMap: Map<string, number>
  pageCount: number
}

interface PaginationResult {
  sections: PrintSection[]
  pageMap: Map<string, number>
}

export class PdfLayoutError extends Error {
  constructor(message: string, readonly report: PdfLayoutReport) {
    super(message)
    this.name = 'PdfLayoutError'
  }
}

export async function exportPdf(
  config: PrintConfig,
  templates: TemplateEntry[],
  selections: PrintSelection[]
): Promise<PdfLayoutReport> {
  const layout = await renderPagedLayout(config, templates, selections)

  try {
    await document.fonts.ready
    const report = createPdfLayoutReport({
      config,
      sections: layout.sections,
      pageMap: layout.pageMap,
      pageCount: layout.pageCount,
      visualWarnings: readVisualLayoutWarnings(layout.host, layout.pageMap)
    })

    if (report.warnings.some((warning) => warning.severity === 'error')) {
      throw new PdfLayoutError('PDF 检查发现阻塞问题，请先查看检查结果', report)
    }

    await capturePagedPdf(layout.host, sanitizeFilename(`${config.title || 'xcpc-template'}.pdf`))
    return report
  } finally {
    layout.host.remove()
  }
}

export async function inspectPdfLayout(
  config: PrintConfig,
  templates: TemplateEntry[],
  selections: PrintSelection[]
): Promise<PdfLayoutReport> {
  const layout = await renderPagedLayout(config, templates, selections)

  try {
    await document.fonts.ready
    return createPdfLayoutReport({
      config,
      sections: layout.sections,
      pageMap: layout.pageMap,
      pageCount: layout.pageCount,
      visualWarnings: readVisualLayoutWarnings(layout.host, layout.pageMap)
    })
  } finally {
    layout.host.remove()
  }
}

async function renderPagedLayout(
  config: PrintConfig,
  templates: TemplateEntry[],
  selections: PrintSelection[]
): Promise<PagedLayout> {
  if (selections.length === 0) {
    throw new Error('请先选择至少一个模板')
  }

  const host = document.createElement('div')
  host.className = 'pdf-export-host'
  document.body.appendChild(host)

  try {
    let pageMap = new Map<string, number>()

    for (let i = 0; i < 4; i += 1) {
      const next = await paginate(host, config, templates, selections, pageMap)
      if (samePageMap(pageMap, next.pageMap)) {
        pageMap = next.pageMap
        break
      }
      pageMap = next.pageMap
    }

    const sections = await paginate(host, config, templates, selections, pageMap)
    return {
      host,
      sections: sections.sections,
      pageMap: sections.pageMap,
      pageCount: host.querySelectorAll('.pagedjs_page').length
    }
  } catch (cause) {
    host.remove()
    throw cause
  }
}

async function paginate(
  host: HTMLElement,
  config: PrintConfig,
  templates: TemplateEntry[],
  selections: PrintSelection[],
  pageMap: Map<string, number>
): Promise<PaginationResult> {
  host.replaceChildren()
  const sections = resolvePrintSections(templates, selections)
  const html = buildPrintableHtml(config, templates, selections, pageMap)
  const previewer = new Previewer()
  await previewer.preview(html, [], host)
  return {
    sections,
    pageMap: readSectionPages(host)
  }
}

function readSectionPages(host: HTMLElement): Map<string, number> {
  const map = new Map<string, number>()
  const pages = [...host.querySelectorAll<HTMLElement>('.pagedjs_page')]

  pages.forEach((page, pageIndex) => {
    const sections = page.querySelectorAll<HTMLElement>('[data-template-id]')
    sections.forEach((section) => {
      const id = section.dataset.templateId
      if (id && !map.has(id)) {
        map.set(id, pageIndex + 1)
      }
    })
  })

  return map
}

function readVisualLayoutWarnings(host: HTMLElement, pageMap: Map<string, number>): PdfLayoutWarning[] {
  const warnings: PdfLayoutWarning[] = []
  const pages = [...host.querySelectorAll<HTMLElement>('.pagedjs_page')]

  pages.forEach((page, pageIndex) => {
    page.querySelectorAll<HTMLElement>('pre').forEach((block) => {
      if (block.scrollWidth > block.clientWidth + 2) {
        const section = block.closest<HTMLElement>('[data-template-id]')
        const templateId = section?.dataset.templateId
        warnings.push({
          code: 'horizontal-overflow',
          severity: 'error',
          message: `第 ${pageIndex + 1} 页存在横向溢出的代码块。`,
          templateId,
          page: pageIndex + 1
        })
      }
    })

    const pageRect = page.getBoundingClientRect()
    page.querySelectorAll<HTMLElement>('.template-section > h3').forEach((heading) => {
      const headingRect = heading.getBoundingClientRect()
      const section = heading.closest<HTMLElement>('[data-template-id]')
      const templateId = section?.dataset.templateId
      const templatePage = templateId ? pageMap.get(templateId) : undefined
      if (templatePage !== pageIndex + 1) return
      if (pageRect.bottom - headingRect.bottom < 72) {
        warnings.push({
          code: 'orphan-heading',
          severity: 'warning',
          message: `「${heading.textContent?.trim() || '未命名模板'}」标题靠近页底，建议检查分页效果。`,
          templateId,
          title: heading.textContent?.trim(),
          page: pageIndex + 1
        })
      }
    })
  })

  return warnings
}

async function capturePagedPdf(host: HTMLElement, filename: string): Promise<void> {
  const pages = [...host.querySelectorAll<HTMLElement>('.pagedjs_page')]
  if (pages.length === 0) {
    throw new Error('PDF 分页失败')
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    compress: true
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  for (const [index, page] of pages.entries()) {
    if (index > 0) pdf.addPage()
    const canvas = await html2canvas(page, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      onclone: (clonedDocument) => {
        clonedDocument
          .querySelectorAll('link[rel="stylesheet"]')
          .forEach((stylesheet) => stylesheet.remove())
      }
    })
    const image = canvas.toDataURL('image/png')
    pdf.addImage(image, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST')
  }

  pdf.save(filename)
}

function samePageMap(a: Map<string, number>, b: Map<string, number>): boolean {
  if (a.size !== b.size) return false
  return [...a].every(([key, value]) => b.get(key) === value)
}
