import { readFile } from 'node:fs/promises'
import { expect, test, type Download, type Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.context().setOffline(false)
  await page.goto('/')
  await resetBrowserState(page)
  await page.goto('/')
  await page.waitForSelector('article.template-row')
})

test('user can assemble, persist, and export a print draft', async ({ page }) => {
  const nav = (name: string) => page.locator('nav.page-tabs').getByRole('button', { name, exact: true })

  await clickTemplateBody(page, 'KMP')
  await expect(page.locator('aside.template-editor input[aria-label="标题"]')).toHaveValue('KMP')

  const dijkstra = templateCard(page, 'Dijkstra')
  await dijkstra.locator('select').selectOption('detail')
  await dijkstra.getByTitle('加入打印稿').click()
  await expect(page.locator('aside.template-editor input[aria-label="标题"]')).toHaveValue('KMP')

  await nav('生成').click()
  const preview = page.locator('textarea.markdown-preview')
  await expect(preview).toHaveValue(/Dijkstra/)
  await expect(preview).toHaveValue(/优先队列/)

  const outputSelect = page.locator('select[aria-label="输出格式"]')
  await outputSelect.selectOption('markdown')
  await expect(page.getByRole('button', { name: /Markdown/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /^PDF$/ })).toHaveCount(0)

  await page.locator('input[aria-label="打印稿标题"]').fill('E2E 打印稿')
  await page.reload()
  await nav('生成').click()
  await expect(page.locator('input[aria-label="打印稿标题"]')).toHaveValue('E2E 打印稿')
  await expect(preview).toHaveValue(/Dijkstra/)

  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: /Markdown/ }).click()
  await expect((await download).suggestedFilename()).toBe('E2E-打印稿.md')
})

test('draft bulk actions affect only checked rows', async ({ page }) => {
  const nav = (name: string) => page.locator('nav.page-tabs').getByRole('button', { name, exact: true })

  await templateCard(page, 'Dijkstra').getByTitle('加入打印稿').click()
  await templateCard(page, 'KMP').getByTitle('加入打印稿').click()
  await nav('打印稿').click()

  const detailButton = page.getByRole('button', { name: '详细', exact: true })
  await expect(detailButton).toBeDisabled()

  const dijkstraRow = page.locator('article.draft-row').filter({ hasText: 'Dijkstra' })
  const kmpRow = page.locator('article.draft-row').filter({ hasText: 'KMP' })
  await dijkstraRow.locator('input[type="checkbox"]').check()
  await detailButton.click()

  await expect(dijkstraRow.locator('select[aria-label="介绍详细度"]')).toHaveValue('detail')
  await expect(kmpRow.locator('select[aria-label="介绍详细度"]')).toHaveValue('brief')
})

test('pdf inspection reports paged toc before download', async ({ page }) => {
  const nav = (name: string) => page.locator('nav.page-tabs').getByRole('button', { name, exact: true })

  await templateCard(page, 'Dijkstra').getByTitle('加入打印稿').click()
  await templateCard(page, 'KMP').getByTitle('加入打印稿').click()
  await nav('生成').click()

  await page.getByRole('button', { name: '检查', exact: true }).click()

  const report = page.locator('.pdf-report')
  await expect(report).toContainText(/可导出|建议复核/)
  await expect(report).toContainText(/页/)
  await expect(report.locator('.pdf-report__toc')).toContainText('Dijkstra')
  await expect(report.locator('.pdf-report__toc')).toContainText('KMP')
})

test('large draft reports paged compact and book layouts without blocking errors', async ({ page }) => {
  test.setTimeout(90_000)
  const nav = (name: string) => page.locator('nav.page-tabs').getByRole('button', { name, exact: true })

  await selectFirstTemplates(page, 18)
  await nav('生成').click()

  for (const layout of ['compact', 'book'] as const) {
    await page.locator('select[aria-label="版式"]').selectOption(layout)
    await page.getByRole('button', { name: '检查', exact: true }).click()

    const report = page.locator('.pdf-report')
    await expect(report).toContainText(/可导出|建议复核/, { timeout: 45_000 })
    await expect(report.locator('.pdf-report__stats')).toContainText('0 错误')
    await expect(report.locator('.pdf-report__toc li')).toHaveCount(8)

    const pageCountText = await report.locator('.pdf-report__stats span').first().innerText()
    const pageCount = Number(pageCountText.match(/\d+/)?.[0] ?? 0)
    expect(pageCount).toBeGreaterThan(2)
  }
})

test('downloads valid compact and book PDFs', async ({ page }) => {
  test.setTimeout(150_000)
  const nav = (name: string) => page.locator('nav.page-tabs').getByRole('button', { name, exact: true })

  await selectFirstTemplates(page, 8)
  await nav('生成').click()

  for (const layout of ['compact', 'book'] as const) {
    await page.locator('input[aria-label="打印稿标题"]').fill(`E2E ${layout} PDF`)
    await page.locator('select[aria-label="版式"]').selectOption(layout)

    const download = page.waitForEvent('download', { timeout: 90_000 })
    await page.getByRole('button', { name: /^PDF$/ }).click()
    await assertPdfDownload(await download, `E2E-${layout}-PDF.pdf`, test.info().outputPath(`${layout}.pdf`), 3)
  }
})

test('all public templates can be opened and selected from the library', async ({ page }) => {
  const titles = await page.locator('article.template-row h4').allInnerTexts()
  expect(titles.length).toBeGreaterThanOrEqual(30)

  for (const title of titles) {
    const card = templateCard(page, title)
    await card.locator('h4').click()
    await expect(page.locator('aside.template-editor input[aria-label="标题"]')).toHaveValue(title)
    await card.getByTitle('加入打印稿').click()
    await expect(card.getByTitle('移出打印稿')).toBeVisible()
    await card.getByTitle('移出打印稿').click()
    await expect(card.getByTitle('加入打印稿')).toBeVisible()
  }
})

test('public template overrides can be saved and reverted', async ({ page }) => {
  await clickTemplateBody(page, 'Dijkstra')
  const titleInput = page.locator('aside.template-editor input[aria-label="标题"]')
  await titleInput.fill('Dijkstra 队内版')
  await page.getByRole('button', { name: '保存' }).click()
  await expect(titleInput).toHaveValue('Dijkstra 队内版')
  await expect(page.getByRole('button', { name: '默认' })).toBeEnabled()

  await page.getByRole('button', { name: '默认' }).click()
  await expect(titleInput).toHaveValue('Dijkstra')
  await expect(page.getByRole('button', { name: '默认' })).toBeDisabled()
})

test('bad personal library JSON keeps existing personal templates intact', async ({ page }) => {
  const titleInput = page.locator('aside.template-editor input[aria-label="标题"]')

  await page.getByRole('button', { name: '新建' }).click()
  await titleInput.fill('坏 JSON 保护样本')
  await page.locator('aside.template-editor input[aria-label="分类路径"]').fill('个人模板/导入测试')
  await page.getByRole('button', { name: '保存' }).click()

  await page.getByRole('button', { name: '我的', exact: true }).click()
  await expect(templateCard(page, '坏 JSON 保护样本')).toBeVisible()

  await page.locator('aside.template-editor input[type="file"]').setInputFiles({
    name: 'broken-personal-library.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{ broken')
  })

  await expect(page.getByRole('status')).toHaveText('导入失败：个人模板 JSON 无法解析')
  await expect(templateCard(page, '坏 JSON 保护样本')).toBeVisible()
  await expect(titleInput).toHaveValue('坏 JSON 保护样本')
})

test('personal category folders filter the library and feed editor suggestions', async ({ page }) => {
  const titleInput = page.locator('aside.template-editor input[aria-label="标题"]')
  const categoryInput = page.locator('aside.template-editor input[aria-label="分类路径"]')

  await createPersonalTemplate(page, '队内 Dinic', '个人模板/图论/网络流')

  await page.getByRole('button', { name: '新建' }).click()
  await page.getByTitle('套用分类 个人模板 / 图论 / 网络流').click()
  await expect(categoryInput).toHaveValue('个人模板 / 图论 / 网络流')
  await titleInput.fill('队内 ISAP')
  await page.getByRole('button', { name: '保存' }).click()

  await createPersonalTemplate(page, '队内 exgcd', '个人模板/数学')

  await page.getByRole('button', { name: '我的', exact: true }).click()
  await categoryFilterButton(page, '个人模板 / 图论').click()
  await expect(templateCard(page, '队内 Dinic')).toBeVisible()
  await expect(templateCard(page, '队内 ISAP')).toBeVisible()
  await expect(templateCard(page, '队内 exgcd')).toHaveCount(0)

  await categoryFilterButton(page, '个人模板 / 数学').click()
  await expect(templateCard(page, '队内 exgcd')).toBeVisible()
  await expect(templateCard(page, '队内 Dinic')).toHaveCount(0)

  await page.getByRole('button', { name: '全部', exact: true }).click()
  await page.locator('input[aria-label="搜索模板"]').fill('priority_queue')
  await expect(templateCard(page, 'Dijkstra')).toBeVisible()
})

test('app reopens offline after the first successful load', async ({ page }) => {
  const nav = (name: string) => page.locator('nav.page-tabs').getByRole('button', { name, exact: true })

  await waitForServiceWorkerControl(page)
  await templateCard(page, 'Dijkstra').getByTitle('加入打印稿').click()
  await nav('生成').click()
  await expect(page.locator('textarea.markdown-preview')).toHaveValue(/Dijkstra/)

  await page.context().setOffline(true)
  try {
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator('article.template-row').first()).toBeVisible()
    await nav('生成').click()
    await expect(page.locator('textarea.markdown-preview')).toHaveValue(/Dijkstra/)
  } finally {
    await page.context().setOffline(false)
  }
})

test('mobile layout avoids horizontal overflow and keeps split handle touchable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload()
  await page.waitForSelector('.split-pane__divider')

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }))
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)

  const divider = await page.locator('.split-pane__divider').first().boundingBox()
  expect(divider).not.toBeNull()
  expect(Math.max(divider?.width ?? 0, divider?.height ?? 0)).toBeGreaterThanOrEqual(20)
})

function templateCard(page: Page, title: string) {
  return page
    .locator('article.template-row')
    .filter({ has: page.locator('h4', { hasText: new RegExp(`^${escapeRegExp(title)}$`) }) })
    .first()
}

function categoryFilterButton(page: Page, title: string) {
  return page.locator(`.category-filter__item[title="${title}"]`).first()
}

async function selectFirstTemplates(page: Page, count: number): Promise<void> {
  const titles = await page.locator('article.template-row h4').allInnerTexts()
  const sampleTitles = titles.slice(0, count)
  expect(sampleTitles.length).toBeGreaterThanOrEqual(count)

  for (const title of sampleTitles) {
    await templateCard(page, title).getByTitle('加入打印稿').click()
  }
}

async function assertPdfDownload(
  download: Download,
  expectedFilename: string,
  outputPath: string,
  minPageCount: number
): Promise<void> {
  expect(download.suggestedFilename()).toBe(expectedFilename)
  await download.saveAs(outputPath)
  const content = await readFile(outputPath)
  expect(content.byteLength).toBeGreaterThan(20_000)
  expect(content.subarray(0, 5).toString('ascii')).toBe('%PDF-')
  const pageCount = content.toString('latin1').match(/\/Type\s*\/Page\b/g)?.length ?? 0
  expect(pageCount).toBeGreaterThanOrEqual(minPageCount)
}

async function clickTemplateBody(page: Page, title: string): Promise<void> {
  await templateCard(page, title).locator('h4').click()
}

async function createPersonalTemplate(page: Page, title: string, categoryPath: string): Promise<void> {
  await page.getByRole('button', { name: '新建' }).click()
  await page.locator('aside.template-editor input[aria-label="标题"]').fill(title)
  await page.locator('aside.template-editor input[aria-label="分类路径"]').fill(categoryPath)
  await page.getByRole('button', { name: '保存' }).click()
}

async function waitForServiceWorkerControl(page: Page): Promise<void> {
  await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('service worker is not supported')
    }

    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true })
      })
    }
  })
  await page.reload({ waitUntil: 'networkidle' })
}

async function resetBrowserState(page: Page): Promise<void> {
  await page.evaluate(async () => {
    localStorage.clear()
    if ('caches' in window) {
      const names = await caches.keys()
      await Promise.all(names.map((name) => caches.delete(name)))
    }
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((registration) => registration.unregister()))
    }
  })
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
