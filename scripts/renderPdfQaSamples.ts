import { promises as fs } from 'node:fs'
import path from 'node:path'
import { chromium, type Browser, type Page } from '@playwright/test'
import { stripCodeFence } from '../src/lib/code'
import { createPdfLayoutReport, type PdfLayoutReport, type PdfLayoutWarning } from '../src/lib/pdfReport'
import { buildPrintableHtml, resolvePrintSections } from '../src/lib/printDocument'
import { sortTemplates } from '../src/lib/templates'
import type { DetailLevel, PrintConfig, PrintSelection, TemplateEntry, TemplateMeta } from '../src/types/template'

interface TemplatePackage {
  meta: TemplateMeta
  code: string
}

interface QaLayoutOutput {
  layout: PrintConfig['layout']
  report: PdfLayoutReport
  screenshots: string[]
}

const workspaceRoot = process.cwd()
const templateRoot = path.join(workspaceRoot, '板子')
const outputRoot = path.join(workspaceRoot, 'output', 'pdf-qa')
const pagedScriptPath = path.join(workspaceRoot, 'node_modules', 'pagedjs', 'dist', 'paged.js')
const screenshotLimit = 4

const baseConfig: PrintConfig = {
  title: 'XCPC Super Template QA',
  includeToc: true,
  tocDepth: 2,
  layout: 'compact',
  output: 'pdf',
  sortMode: 'manual'
}

async function main(): Promise<void> {
  const publicTemplates = sortTemplates(await readPublicTemplates(), 'learning')
  const templates = [createStressTemplate(), ...publicTemplates.slice(0, 18)]
  const selections = templates.map((template): PrintSelection => ({
    templateId: template.id,
    detailLevel: template.id === 'qa.long-print-layout' ? 'detail' : ('brief' satisfies DetailLevel)
  }))

  await resetOutputDirectory(outputRoot)

  const browser = await chromium.launch()
  try {
    const outputs: QaLayoutOutput[] = []
    for (const layout of ['compact', 'book'] as const) {
      outputs.push(await renderLayoutSample(browser, templates, selections, layout))
    }

    await fs.writeFile(
      path.join(outputRoot, 'report.json'),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          templateCount: templates.length,
          screenshotLimit,
          outputs
        },
        null,
        2
      ),
      'utf8'
    )

    for (const output of outputs) {
      const errorCount = output.report.warnings.filter((warning) => warning.severity === 'error').length
      console.log(
        `${output.layout}: ${output.report.pageCount} page(s), ${output.screenshots.length} screenshot(s), ${errorCount} blocking warning(s)`
      )
      if (errorCount > 0) {
        process.exitCode = 1
      }
    }
  } finally {
    await browser.close()
  }
}

async function renderLayoutSample(
  browser: Browser,
  templates: TemplateEntry[],
  selections: PrintSelection[],
  layout: PrintConfig['layout']
): Promise<QaLayoutOutput> {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1800 }, deviceScaleFactor: 1 })
  const config = { ...baseConfig, layout }
  const layoutDir = path.join(outputRoot, layout)

  await fs.mkdir(layoutDir, { recursive: true })

  try {
    let pageMap = new Map<string, number>()
    for (let i = 0; i < 4; i += 1) {
      await paginate(page, config, templates, selections, pageMap)
      const nextMap = await readSectionPages(page)
      if (samePageMap(pageMap, nextMap)) {
        pageMap = nextMap
        break
      }
      pageMap = nextMap
    }

    await paginate(page, config, templates, selections, pageMap)
    const sections = resolvePrintSections(templates, selections)
    const [pageCount, visualWarnings] = await Promise.all([
      page.locator('.pagedjs_page').count(),
      readVisualWarnings(page, pageMap)
    ])
    const report = createPdfLayoutReport({
      config,
      sections,
      pageMap,
      pageCount,
      visualWarnings
    })
    const screenshots = await capturePageScreenshots(page, layoutDir, layout, Math.min(pageCount, screenshotLimit))

    return { layout, report, screenshots }
  } finally {
    await page.close()
  }
}

async function paginate(
  page: Page,
  config: PrintConfig,
  templates: TemplateEntry[],
  selections: PrintSelection[],
  pageMap: Map<string, number>
): Promise<void> {
  const printableHtml = buildPrintableHtml(config, templates, selections, pageMap)
  await page.setContent(
    `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { margin: 0; background: #e5e5e5; }
          #preview { padding: 24px; }
          .pagedjs_page { background: #fff; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18); margin: 0 auto 24px; }
        </style>
      </head>
      <body>
        <div id="preview"></div>
      </body>
    </html>`,
    { waitUntil: 'load' }
  )
  await page.evaluate(() => {
    ;(window as typeof window & { __name?: <T>(value: T) => T }).__name = (value) => value
  })
  await page.addScriptTag({ path: pagedScriptPath })
  await page.evaluate(async (html) => {
    const Paged = (window as typeof window & { Paged?: { Previewer: new () => { preview: (content: string, stylesheets: string[], renderTo: Element) => Promise<unknown> } } }).Paged
    if (!Paged) {
      throw new Error('PagedJS did not load')
    }

    const preview = document.querySelector('#preview')
    if (!preview) {
      throw new Error('Preview host is missing')
    }

    preview.replaceChildren()
    const previewer = new Paged.Previewer()
    await previewer.preview(html, [], preview)
    await document.fonts.ready
  }, printableHtml)
  await decoratePagedPages(page, config)
  await page.waitForSelector('.pagedjs_page')
}

async function decoratePagedPages(page: Page, config: PrintConfig): Promise<void> {
  await page.evaluate(({ title, layout }) => {
    const layoutLabel = layout === 'book' ? '书籍章节版' : '紧凑比赛版'
    const applyChromeStyle = (element: HTMLElement) => {
      Object.assign(element.style, {
        position: 'absolute',
        zIndex: '5',
        maxWidth: 'calc(100% - 88px)',
        overflow: 'hidden',
        color: '#475569',
        fontFamily: '"Microsoft YaHei", "Noto Sans SC", "PingFang SC", sans-serif',
        fontSize: '10px',
        letterSpacing: '0',
        lineHeight: '1.2',
        pointerEvents: 'none',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      })
    }

    document.querySelectorAll<HTMLElement>('.pagedjs_page').forEach((pagedPage, index) => {
      pagedPage.querySelectorAll('.print-page-chrome').forEach((node) => node.remove())
      pagedPage.style.position = 'relative'

      const header = document.createElement('div')
      header.className = 'print-page-chrome print-page-header'
      header.textContent = `${title || 'XCPC 打印稿'} · ${layoutLabel}`
      applyChromeStyle(header)
      Object.assign(header.style, {
        top: '18px',
        left: '44px',
        right: '44px',
        textAlign: 'left'
      })

      const footer = document.createElement('div')
      footer.className = 'print-page-chrome print-page-footer'
      footer.textContent = `第 ${index + 1} 页`
      applyChromeStyle(footer)
      Object.assign(footer.style, {
        right: '0',
        bottom: '16px',
        left: '0',
        textAlign: 'center'
      })

      pagedPage.append(header, footer)
    })
  }, { title: config.title.trim(), layout: config.layout })
}

async function readSectionPages(page: Page): Promise<Map<string, number>> {
  const entries = await page.evaluate(() => {
    const map = new Map<string, number>()
    const pages = [...document.querySelectorAll<HTMLElement>('.pagedjs_page')]

    pages.forEach((pagedPage, pageIndex) => {
      pagedPage.querySelectorAll<HTMLElement>('.pagedjs_page_content [data-template-id]').forEach((section) => {
        const id = section.dataset.templateId
        if (id && !map.has(id)) {
          map.set(id, pageIndex + 1)
        }
      })
    })

    return [...map.entries()]
  })

  return new Map(entries)
}

async function readVisualWarnings(page: Page, pageMap: Map<string, number>): Promise<PdfLayoutWarning[]> {
  return page.evaluate((entries) => {
    const map = new Map(entries)
    const warnings: PdfLayoutWarning[] = []
    const pages = [...document.querySelectorAll<HTMLElement>('.pagedjs_page')]

    pages.forEach((pagedPage, pageIndex) => {
      const header = pagedPage.querySelector<HTMLElement>('.print-page-header')
      const footer = pagedPage.querySelector<HTMLElement>('.print-page-footer')

      if (!header?.textContent?.trim()) {
        warnings.push({
          code: 'missing-page-header',
          severity: 'error',
          message: `第 ${pageIndex + 1} 页缺少页眉。`,
          page: pageIndex + 1
        })
      }

      if (!footer?.textContent?.includes(`第 ${pageIndex + 1} 页`)) {
        warnings.push({
          code: 'missing-page-footer',
          severity: 'error',
          message: `第 ${pageIndex + 1} 页缺少可信页码。`,
          page: pageIndex + 1
        })
      }

      pagedPage.querySelectorAll<HTMLElement>('.pagedjs_page_content pre').forEach((block) => {
        if (block.scrollWidth > block.clientWidth + 2) {
          const section = block.closest<HTMLElement>('[data-template-id]')
          warnings.push({
            code: 'horizontal-overflow',
            severity: 'error',
            message: `第 ${pageIndex + 1} 页存在横向溢出的代码块。`,
            templateId: section?.dataset.templateId,
            page: pageIndex + 1
          })
        }
      })

      const pageRect = pagedPage.getBoundingClientRect()
      pagedPage.querySelectorAll<HTMLElement>('.pagedjs_page_content .template-section > h3').forEach((heading) => {
        const section = heading.closest<HTMLElement>('[data-template-id]')
        const templateId = section?.dataset.templateId
        if (!templateId || map.get(templateId) !== pageIndex + 1) return

        const headingRect = heading.getBoundingClientRect()
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
  }, [...pageMap.entries()])
}

async function capturePageScreenshots(
  page: Page,
  layoutDir: string,
  layout: PrintConfig['layout'],
  count: number
): Promise<string[]> {
  const screenshots: string[] = []
  for (let index = 0; index < count; index += 1) {
    const filename = `${layout}-page-${String(index + 1).padStart(2, '0')}.png`
    const screenshotPath = path.join(layoutDir, filename)
    await page.locator('.pagedjs_page').nth(index).screenshot({ path: screenshotPath })
    screenshots.push(path.relative(outputRoot, screenshotPath).replace(/\\/g, '/'))
  }

  return screenshots
}

async function readPublicTemplates(): Promise<TemplateEntry[]> {
  const packages = await readTemplatePackages(templateRoot)
  return packages.map(({ meta, code }) => ({
    ...meta,
    code: stripCodeFence(code),
    source: 'public' as const,
    origin: meta.source
  }))
}

async function readTemplatePackages(root: string): Promise<TemplatePackage[]> {
  const metaPaths = await findFiles(root, 'meta.json')

  return Promise.all(
    metaPaths.map(async (metaPath) => {
      const directory = path.dirname(metaPath)
      const codePath = path.join(directory, 'code.md')
      const [rawMeta, code] = await Promise.all([
        fs.readFile(metaPath, 'utf8'),
        fs.readFile(codePath, 'utf8').catch(() => '')
      ])

      return {
        meta: JSON.parse(rawMeta) as TemplateMeta,
        code
      }
    })
  )
}

async function findFiles(directory: string, fileName: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) return findFiles(fullPath, fileName)
      return entry.isFile() && entry.name === fileName ? [fullPath] : []
    })
  )

  return nested.flat().sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

async function resetOutputDirectory(directory: string): Promise<void> {
  await fs.rm(directory, { recursive: true, force: true })
  await fs.mkdir(directory, { recursive: true })
}

function samePageMap(a: Map<string, number>, b: Map<string, number>): boolean {
  if (a.size !== b.size) return false
  return [...a].every(([key, value]) => b.get(key) === value)
}

function createStressTemplate(): TemplateEntry {
  return {
    id: 'qa.long-print-layout',
    title: '可视化QA长标题模板_验证目录页码章节标题和中文EnglishMixedContent换行',
    category: ['杂项', 'PDF QA'],
    learningOrder: 9999,
    tags: ['qa', 'pdf'],
    timeComplexity: 'O(n log n + m log m + very_long_expression_for_visual_quality_check)',
    spaceComplexity: 'O(n + m + auxiliary_buffers_for_rendering_check)',
    brief: '用于生成分页视觉 QA 样本，覆盖长标题、长复杂度和长代码行。',
    detail:
      '这个模板不会进入公共库，只用于本地 QA 脚本。它把长标题、长复杂度、中文英文混排和长 C++ 语句放在同一页附近，方便人工检查打印分页的可读性。',
    codeLanguage: 'cpp',
    code: [
      'struct VisualQaNode { long long left, right, lazy_tag, extremely_long_member_name_for_wrap_check; };',
      `long long visual_quality_probe = ${Array.from({ length: 72 }, (_, index) => `value_${index}`).join(' + ')};`,
      'void apply_visual_qa_update(int l, int r, long long delta) {',
      '    // 中文 English mixed content should wrap without clipping in the generated print page.',
      '    visual_quality_probe += 1LL * (r - l + 1) * delta;',
      '}'
    ].join('\n'),
    source: 'personal'
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error)
  process.exitCode = 1
})
