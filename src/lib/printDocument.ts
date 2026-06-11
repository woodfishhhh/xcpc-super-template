import type { PrintConfig, PrintSelection, TemplateEntry } from '@/types/template'
import { stripCodeFence } from '@/lib/code'

export interface PrintSection {
  selection: PrintSelection
  template: TemplateEntry
}

export function resolvePrintSections(
  templates: TemplateEntry[],
  selections: PrintSelection[]
): PrintSection[] {
  const byId = new Map(templates.map((template) => [template.id, template]))
  return selections.flatMap((selection) => {
    const template = byId.get(selection.templateId)
    return template ? [{ selection, template }] : []
  })
}

export function buildPrintableHtml(
  config: PrintConfig,
  templates: TemplateEntry[],
  selections: PrintSelection[],
  pageMap: Map<string, number> = new Map()
): string {
  const sections = resolvePrintSections(templates, selections)
  const title = escapeHtml(config.title.trim() || 'XCPC 打印稿')
  const grouped = groupSections(sections)
  const layoutClass = config.layout === 'book' ? 'book-layout' : 'compact-layout'

  return `
    <style>${printCss}</style>
    <article class="print-document ${layoutClass}">
      <section class="cover">
        <h1>${title}</h1>
        <p>${sections.length} 个模板 · ${config.layout === 'book' ? '书籍章节版' : '紧凑比赛版'}</p>
      </section>
      ${config.includeToc ? renderToc(grouped, config.tocDepth, pageMap) : ''}
      ${grouped
        .map(
          (group) => `
            <section class="chapter" data-category="${escapeAttr(group.category)}">
              <h2>${escapeHtml(group.category)}</h2>
              ${group.sections.map((section) => renderTemplateSection(section)).join('')}
            </section>
          `
        )
        .join('')}
    </article>
  `
}

function renderToc(
  groups: Array<{ category: string; sections: PrintSection[] }>,
  depth: 1 | 2,
  pageMap: Map<string, number>
): string {
  return `
    <nav class="toc">
      <h2>目录</h2>
      <ol>
        ${groups
          .map(
            (group) => `
              <li>
                <span>${escapeHtml(group.category)}</span>
                ${depth >= 2 ? `<ol>${group.sections.map((section) => renderTocItem(section, pageMap)).join('')}</ol>` : ''}
              </li>
            `
          )
          .join('')}
      </ol>
    </nav>
  `
}

function renderTocItem(section: PrintSection, pageMap: Map<string, number>): string {
  const page = pageMap.get(section.template.id)
  return `
    <li data-toc-template-id="${escapeAttr(section.template.id)}">
      <span>${escapeHtml(section.template.title)}</span>
      <span>${page ?? '...'}</span>
    </li>
  `
}

function renderTemplateSection(section: PrintSection): string {
  const { template, selection } = section
  const description =
    selection.detailLevel === 'brief'
      ? template.brief
      : selection.detailLevel === 'detail'
        ? template.detail
        : ''

  return `
    <section class="template-section" data-template-id="${escapeAttr(template.id)}">
      <h3>${escapeHtml(template.title)}</h3>
      <div class="complexity">
        <span>时间复杂度：${escapeHtml(template.timeComplexity || '未注明')}</span>
        <span>空间复杂度：${escapeHtml(template.spaceComplexity || '未注明')}</span>
      </div>
      ${description.trim() ? `<p class="description">${escapeHtml(description.trim())}</p>` : ''}
      ${renderCode(template)}
    </section>
  `
}

function renderCode(template: TemplateEntry): string {
  const code = stripCodeFence(template.code).trim()
  return `<pre><code>${escapeHtml(code)}</code></pre>`
}

function groupSections(sections: PrintSection[]): Array<{ category: string; sections: PrintSection[] }> {
  const groups = new Map<string, PrintSection[]>()
  for (const section of sections) {
    const category = section.template.category[0] ?? '未分类'
    groups.set(category, [...(groups.get(category) ?? []), section])
  }

  return [...groups].map(([category, groupSections]) => ({
    category,
    sections: groupSections
  }))
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/`/g, '&#96;')
}

const printCss = `
  @page {
    size: A4;
    margin: 13mm 11mm 16mm;
    @bottom-center {
      content: "第 " counter(page) " 页";
      color: #475569;
      font-size: 9pt;
      font-family: "Microsoft YaHei", "Noto Sans SC", sans-serif;
    }
  }

  * { box-sizing: border-box; }
  body { margin: 0; }
  .print-document {
    color: #0f172a;
    font-family: "Microsoft YaHei", "Noto Sans SC", "PingFang SC", sans-serif;
    font-size: 10pt;
    line-height: 1.42;
    orphans: 3;
    widows: 3;
  }
  .cover {
    break-after: page;
    min-height: 210mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-left: 6pt solid #0f766e;
    padding-left: 18pt;
  }
  .cover h1 {
    margin: 0;
    font-size: 30pt;
    letter-spacing: 0;
  }
  .cover p {
    margin: 10pt 0 0;
    color: #475569;
  }
  .toc {
    break-after: page;
  }
  .toc h2,
  .chapter h2 {
    margin: 0 0 10pt;
    font-size: 18pt;
    break-after: avoid-page;
    break-inside: avoid;
  }
  .toc ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .toc li {
    margin: 4pt 0;
  }
  .toc li li {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10pt;
    border-bottom: 0.5pt dotted #cbd5e1;
    margin-left: 12pt;
    padding: 2pt 0;
  }
  .chapter {
    break-before: page;
  }
  .compact-layout .chapter {
    break-before: auto;
  }
  .template-section {
    margin: 0 0 11pt;
    break-inside: avoid-page;
  }
  .book-layout .template-section {
    break-before: page;
    break-inside: auto;
  }
  .template-section h3 {
    margin: 0 0 4pt;
    font-size: 13pt;
    break-after: avoid-page;
    break-inside: avoid;
  }
  .complexity {
    display: flex;
    gap: 8pt;
    flex-wrap: wrap;
    color: #334155;
    font-size: 8.5pt;
    margin-bottom: 4pt;
  }
  .description {
    margin: 0 0 5pt;
    color: #1e293b;
  }
  pre {
    max-width: 100%;
    margin: 0;
    padding: 6pt;
    border: 0.75pt solid #cbd5e1;
    background: #f8fafc;
    color: #020617;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
    hyphens: none;
    font-family: "Cascadia Mono", "Consolas", "Courier New", monospace;
    font-size: 7.7pt;
    line-height: 1.32;
  }
`
