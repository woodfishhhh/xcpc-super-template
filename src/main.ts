import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'

function registerServiceWorkerWhenIdle(): void {
  const register = async () => {
    const { registerSW } = await import('virtual:pwa-register')
    registerSW({ immediate: true })
  }
  const schedule = () => {
    globalThis.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(register, { timeout: 5000 })
        return
      }

      void register()
    }, 3500)
  }

  if (document.readyState === 'complete') {
    schedule()
    return
  }

  window.addEventListener(
    'load',
    schedule,
    { once: true }
  )
}

createApp(App).mount('#app')
registerServiceWorkerWhenIdle()
