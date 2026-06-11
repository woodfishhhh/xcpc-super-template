import type { PrintConfig } from '@/types/template'

export function decoratePagedPages(host: HTMLElement, config: PrintConfig): void {
  const pages = [...host.querySelectorAll<HTMLElement>('.pagedjs_page')]
  const title = config.title.trim() || 'XCPC 打印稿'
  const layoutLabel = config.layout === 'book' ? '书籍章节版' : '紧凑比赛版'

  pages.forEach((page, index) => {
    page.querySelectorAll('.print-page-chrome').forEach((node) => node.remove())
    page.style.position = 'relative'

    const header = document.createElement('div')
    header.className = 'print-page-chrome print-page-header'
    header.textContent = `${title} · ${layoutLabel}`
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

    page.append(header, footer)
  })
}

function applyChromeStyle(element: HTMLElement): void {
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
