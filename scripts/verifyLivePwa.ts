import { chromium, type Page } from '@playwright/test'

interface LivePwaOptions {
  url: string
}

interface LivePwaReport {
  url: string
  onlineControlCount: number
  offlineControlCount: number
  serviceWorkerUrl: string | null
}

const defaultLiveUrl = 'https://woodfishhhh.github.io/xcpc-super-template/'

export async function verifyLivePwa(options: LivePwaOptions): Promise<LivePwaReport> {
  const browser = await chromium.launch()

  try {
    const context = await browser.newContext({
      serviceWorkers: 'allow'
    })
    const page = await context.newPage()

    await page.goto(options.url, { waitUntil: 'networkidle' })
    await assertWorkbenchVisible(page)
    const serviceWorkerUrl = await waitForServiceWorker(page)
    const onlineControlCount = await countWorkbenchControls(page)

    await context.setOffline(true)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await assertWorkbenchVisible(page)
    const offlineControlCount = await countWorkbenchControls(page)

    await context.close()

    if (offlineControlCount < Math.max(8, Math.floor(onlineControlCount * 0.7))) {
      throw new Error(
        `Offline workbench looks incomplete: online controls=${onlineControlCount}, offline controls=${offlineControlCount}`
      )
    }

    return {
      url: options.url,
      onlineControlCount,
      offlineControlCount,
      serviceWorkerUrl
    }
  } finally {
    await browser.close()
  }
}

async function assertWorkbenchVisible(page: Page): Promise<void> {
  await page.getByRole('heading', { name: 'XCPC Super Template', exact: true }).waitFor({ timeout: 15000 })
  await page.getByRole('button', { name: '模板库', exact: true }).waitFor({ timeout: 15000 })
  await page.getByRole('button', { name: '打印稿', exact: true }).waitFor({ timeout: 15000 })
  await page.getByRole('button', { name: '生成', exact: true }).waitFor({ timeout: 15000 })
  await page.getByRole('link', { name: /反馈/ }).waitFor({ timeout: 15000 })
}

async function waitForServiceWorker(page: Page): Promise<string | null> {
  return page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return null

    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 30000))
    ])

    if (!registration) return null
    return registration.active?.scriptURL ?? registration.waiting?.scriptURL ?? registration.installing?.scriptURL ?? null
  })
}

async function countWorkbenchControls(page: Page): Promise<number> {
  return page.evaluate(() => {
    return document.querySelectorAll('button, a, input, textarea, select, [role="button"]').length
  })
}

function parseArgs(args: string[]): LivePwaOptions {
  const urlFlagIndex = args.findIndex((arg) => arg === '--url')
  const url = urlFlagIndex >= 0 ? args[urlFlagIndex + 1] : process.env.LIVE_APP_URL

  return {
    url: url?.trim() || defaultLiveUrl
  }
}

const invokedPath = process.argv[1] ? process.argv[1].replace(/\\/g, '/') : ''
if (invokedPath.endsWith('/scripts/verifyLivePwa.ts')) {
  verifyLivePwa(parseArgs(process.argv.slice(2)))
    .then((report) => {
      console.log(JSON.stringify(report, null, 2))
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.stack ?? error.message : error)
      process.exitCode = 1
    })
}
