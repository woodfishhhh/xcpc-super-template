import { computed, onMounted, readonly, shallowRef } from 'vue'
import {
  exportPersonalLibrary,
  importPersonalLibraryWithReport,
  type PersonalLibraryImportResult
} from '@/lib/importExport'
import { stripCodeFence } from '@/lib/code'
import {
  deletePersonalTemplate,
  loadPersonalTemplates,
  saveManyPersonalTemplates,
  savePersonalTemplate
} from '@/lib/personalStore'
import { createPersonalTemplateId } from '@/lib/templates'
import type { TemplateEntry } from '@/types/template'

export function usePersonalTemplates(publicTemplates: TemplateEntry[]) {
  const templates = shallowRef<TemplateEntry[]>([])
  const isLoading = shallowRef(true)
  const error = shallowRef('')

  const existingIds = computed(() => new Set([...publicTemplates, ...templates.value].map((item) => item.id)))

  async function load(): Promise<void> {
    isLoading.value = true
    error.value = ''
    try {
      templates.value = await loadPersonalTemplates()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : '读取个人模板失败'
    } finally {
      isLoading.value = false
    }
  }

  async function save(template: Omit<TemplateEntry, 'id' | 'source'> & { id?: string }): Promise<TemplateEntry> {
    const id = template.id?.trim() || createPersonalTemplateId(template.title, existingIds.value)
    const next: TemplateEntry = {
      ...template,
      id,
      code: stripCodeFence(template.code),
      source: 'personal',
      updatedAt: new Date().toISOString()
    }

    await savePersonalTemplate(next)
    templates.value = [next, ...templates.value.filter((item) => item.id !== next.id)]
    return next
  }

  async function remove(id: string): Promise<void> {
    await deletePersonalTemplate(id)
    templates.value = templates.value.filter((item) => item.id !== id)
  }

  async function importJson(json: string): Promise<PersonalLibraryImportResult> {
    const result = importPersonalLibraryWithReport(json, existingIds.value)
    if (!result.ok) {
      error.value = result.errors[0] ?? '个人模板 JSON 无法解析'
      return result
    }

    await saveManyPersonalTemplates(result.templates)
    templates.value = [...result.templates, ...templates.value]
    error.value = ''
    return result
  }

  function exportJson(): string {
    return exportPersonalLibrary(templates.value)
  }

  onMounted(() => {
    void load()
  })

  return {
    templates: readonly(templates),
    isLoading: readonly(isLoading),
    error: readonly(error),
    load,
    save,
    remove,
    importJson,
    exportJson
  }
}
