import { expect, test, type Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
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

async function clickTemplateBody(page: Page, title: string): Promise<void> {
  await templateCard(page, title).locator('h4').click()
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
