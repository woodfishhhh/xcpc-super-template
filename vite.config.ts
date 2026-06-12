import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const appBase = process.env.GITHUB_PAGES === 'true' ? '/xcpc-super-template/' : '/'

const manualChunks = (id: string) => {
  const normalizedId = id.replace(/\\/g, '/')

  if (!normalizedId.includes('/node_modules/')) {
    return undefined
  }

  if (
    normalizedId.includes('/node_modules/vue/') ||
    normalizedId.includes('/node_modules/@vue/')
  ) {
    return 'vendor-vue'
  }

  if (normalizedId.includes('/node_modules/swiper/')) {
    return 'vendor-swiper'
  }

  if (normalizedId.includes('/node_modules/@lucide/vue/')) {
    return 'vendor-icons'
  }

  if (
    normalizedId.includes('/node_modules/vue-draggable-plus/') ||
    normalizedId.includes('/node_modules/sortablejs/')
  ) {
    return 'vendor-dnd'
  }

  return undefined
}

export default defineConfig({
  base: appBase,
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'XCPC Super Template',
        short_name: '超级板子',
        description: '离线优先的 ACM/XCPC 打印稿生成工作台',
        theme_color: '#f8fafc',
        background_color: '#f8fafc',
        display: 'standalone',
        icons: [
          {
            src: `${appBase}pwa-icon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json,txt,woff2,ttf}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: `${appBase}index.html`
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks
      }
    }
  }
})
