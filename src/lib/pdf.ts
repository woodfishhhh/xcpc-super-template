import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Previewer } from 'pagedjs'
import { buildPrintableHtml } from '@/lib/printDocument'
import { sanitizeFilename } from '@/lib/utils'
import type { PrintConfig, PrintSelection, TemplateEntry } from '@/types/template'

export async function exportPdf(
  config: PrintConfig,
  templates: TemplateEntry[],
  selections: PrintSelection[]
): Promise<void> {
  if (selections.length === 0) {
    throw new Error('请先选择至少一个模板')
  }

  const host = document.createElement('div')
  host.className = 'pdf-export-host'
  document.body.appendChild(host)

  try {
    let pageMap = new Map<string, number>()

    for (let i = 0; i < 3; i += 1) {
      const nextMap = await paginate(host, config, templates, selections, pageMap)
      if (samePageMap(pageMap, nextMap)) {
        pageMap = nextMap
        break
      }
      pageMap = nextMap
    }

    await paginate(host, config, templates, selections, pageMap)
    await document.fonts.ready
    await capturePagedPdf(host, sanitizeFilename(`${config.title || 'xcpc-template'}.pdf`))
  } finally {
    host.remove()
  }
}

async function paginate(
  host: HTMLElement,
  config: PrintConfig,
  templates: TemplateEntry[],
  selections: PrintSelection[],
  pageMap: Map<string, number>
): Promise<Map<string, number>> {
  host.replaceChildren()
  const html = buildPrintableHtml(config, templates, selections, pageMap)
  const previewer = new Previewer()
  await previewer.preview(html, [], host)
  return readSectionPages(host)
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
