<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef, watch } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import type { Swiper as SwiperInstance } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/vue'
import DraftOutline, { type DraftItem } from '@/components/DraftOutline.vue'
import ExportPanel from '@/components/ExportPanel.vue'
import TemplateEditorPanel, { type TemplateDraft } from '@/components/TemplateEditorPanel.vue'
import TemplateLibraryPanel from '@/components/TemplateLibraryPanel.vue'
import Button from '@/components/ui/Button.vue'
import SplitPane from '@/components/ui/SplitPane.vue'
import { usePersonalTemplates } from '@/composables/usePersonalTemplates'
import { loadPublicTemplates } from '@/data/publicTemplates'
import { downloadTextFile } from '@/lib/download'
import { generateMarkdown } from '@/lib/markdown'
import { resolvePrintSections } from '@/lib/printDocument'
import { hasDefaultTemplate, mergeTemplateOverrides, moveSelection, sortTemplates } from '@/lib/templates'
import { sanitizeFilename } from '@/lib/utils'
import { loadWorkbenchState, saveWorkbenchState, type DraftDensity } from '@/lib/workbenchStore'
import type { PdfLayoutReport } from '@/lib/pdfReport'
import type { DetailLevel, MoveDirection, PrintConfig, PrintSelection, SortMode, TemplateEntry } from '@/types/template'
import 'swiper/css'

const publicTemplates = loadPublicTemplates()
const personalLibrary = usePersonalTemplates(publicTemplates)

const defaultConfig: PrintConfig = {
  title: 'ICPC 打印稿',
  includeToc: true,
  tocDepth: 2,
  layout: 'compact',
  output: 'both',
  sortMode: 'learning'
}

const config = reactive<PrintConfig>({ ...defaultConfig })

const selections = shallowRef<PrintSelection[]>([])
const status = shallowRef('')
const isExportingPdf = shallowRef(false)
const isInspectingPdf = shallowRef(false)
const pdfReport = shallowRef<PdfLayoutReport | null>(null)
const activeSlide = shallowRef(0)
const swiperInstance = shallowRef<SwiperInstance | null>(null)
const activeTemplateId = shallowRef(publicTemplates[0]?.id ?? '')
const checkedDraftIds = shallowRef<Set<string>>(new Set())
const draftDensity = shallowRef<DraftDensity>('comfortable')

const personalTemplates = computed<TemplateEntry[]>(() =>
  personalLibrary.templates.value.map((template) => ({
    ...template,
    category: [...template.category],
    tags: [...template.tags],
    origin: template.origin ? { ...template.origin } : undefined
  }))
)

const librarySortMode = computed<SortMode>(() =>
  config.sortMode === 'manual' ? 'learning' : config.sortMode
)

const allTemplates = computed(() =>
  sortTemplates(mergeTemplateOverrides(publicTemplates, personalTemplates.value), librarySortMode.value)
)

const selectedIds = computed(() => new Set(selections.value.map((selection) => selection.templateId)))
const selectionDetailLevels = computed(
  () => new Map(selections.value.map((selection) => [selection.templateId, selection.detailLevel]))
)
const activeTemplate = computed(
  () => allTemplates.value.find((template) => template.id === activeTemplateId.value) ?? null
)
const isActiveDefaultTemplate = computed(() =>
  activeTemplateId.value ? hasDefaultTemplate(publicTemplates, activeTemplateId.value) : false
)
const isActiveOverride = computed(() =>
  personalTemplates.value.some((template) => template.id === activeTemplateId.value) &&
  isActiveDefaultTemplate.value
)
const standalonePersonalTemplates = computed(() =>
  personalTemplates.value.filter((template) => !hasDefaultTemplate(publicTemplates, template.id))
)

const draftItems = computed<DraftItem[]>(() =>
  resolvePrintSections(allTemplates.value, selections.value).map((section) => ({
    selection: section.selection,
    template: section.template
  }))
)

const markdown = computed(() => generateMarkdown(config, allTemplates.value, selections.value))

function addTemplate(templateId: string, detailLevel: DetailLevel = 'brief'): void {
  if (selectedIds.value.has(templateId)) return
  selections.value = reorderSelections(
    [...selections.value, { templateId, detailLevel }],
    config.sortMode
  )
}

function removeTemplate(templateId: string): void {
  selections.value = selections.value.filter((selection) => selection.templateId !== templateId)
  checkedDraftIds.value = new Set([...checkedDraftIds.value].filter((id) => id !== templateId))
}

function reorderDraft(next: PrintSelection[]): void {
  if (hasSameSelectionOrder(selections.value, next)) return
  config.sortMode = 'manual'
  selections.value = next
}

function moveDraft(templateId: string, direction: MoveDirection): void {
  const next = moveSelection(selections.value, templateId, direction)
  if (hasSameSelectionOrder(selections.value, next)) return
  config.sortMode = 'manual'
  selections.value = next
}

function changeDetail(templateId: string, detailLevel: DetailLevel): void {
  selections.value = selections.value.map((selection) =>
    selection.templateId === templateId ? { ...selection, detailLevel } : selection
  )
}

function changeManyDetails(templateIds: string[], detailLevel: DetailLevel): void {
  const targetIds = new Set(templateIds)
  selections.value = selections.value.map((selection) =>
    targetIds.has(selection.templateId) ? { ...selection, detailLevel } : selection
  )
}

function toggleDraftCheck(templateId: string): void {
  const next = new Set(checkedDraftIds.value)
  if (next.has(templateId)) {
    next.delete(templateId)
  } else {
    next.add(templateId)
  }
  checkedDraftIds.value = next
}

function setAllDraftChecks(checked: boolean): void {
  checkedDraftIds.value = checked
    ? new Set(selections.value.map((selection) => selection.templateId))
    : new Set()
}

function removeCheckedDrafts(): void {
  const ids = checkedDraftIds.value
  selections.value = selections.value.filter((selection) => !ids.has(selection.templateId))
  checkedDraftIds.value = new Set()
}

function applyDetailToCheckedOrAll(detailLevel: DetailLevel): void {
  if (checkedDraftIds.value.size === 0) return
  changeManyDetails([...checkedDraftIds.value], detailLevel)
}

function updateConfig(patch: Partial<PrintConfig>): void {
  Object.assign(config, patch)
  if (patch.sortMode && patch.sortMode !== 'manual') {
    selections.value = reorderSelections(selections.value, patch.sortMode)
  }
}

async function saveTemplate(template: TemplateDraft): Promise<void> {
  const saved = await personalLibrary.save(template)
  activeTemplateId.value = saved.id
  status.value = `已保存：${saved.title}`
}

async function deleteTemplate(templateId: string): Promise<void> {
  await personalLibrary.remove(templateId)
  removeTemplate(templateId)
  activeTemplateId.value = publicTemplates[0]?.id ?? ''
  status.value = '已删除'
}

async function revertTemplate(templateId: string): Promise<void> {
  await personalLibrary.remove(templateId)
  activeTemplateId.value = templateId
  status.value = '已恢复默认'
}

async function importPersonalJson(json: string): Promise<void> {
  const result = await personalLibrary.importJson(json)
  if (!result.ok) {
    status.value = `导入失败：${result.errors[0] ?? 'JSON 无法解析'}`
    return
  }

  status.value =
    result.renamedCount > 0
      ? `已导入 ${result.importedCount} 个个人模板，${result.renamedCount} 个已自动改名`
      : `已导入 ${result.importedCount} 个个人模板`
}

function exportPersonalJson(): void {
  downloadTextFile('personal-template-library.json', personalLibrary.exportJson(), 'application/json')
}

function downloadMarkdown(): void {
  downloadTextFile(`${sanitizeFilename(config.title)}.md`, markdown.value)
}

async function downloadPdf(): Promise<void> {
  isExportingPdf.value = true
  status.value = '正在分页并生成 PDF'
  try {
    const { exportPdf } = await import('@/lib/pdf')
    pdfReport.value = await exportPdf(config, allTemplates.value, selections.value)
    status.value = 'PDF 已生成'
  } catch (cause) {
    if (cause instanceof Error && 'report' in cause) {
      pdfReport.value = (cause as Error & { report: PdfLayoutReport }).report
    }
    status.value = cause instanceof Error ? cause.message : 'PDF 生成失败'
  } finally {
    isExportingPdf.value = false
  }
}

async function inspectPdf(): Promise<void> {
  isInspectingPdf.value = true
  status.value = '正在检查 PDF 分页'
  try {
    const { inspectPdfLayout } = await import('@/lib/pdf')
    pdfReport.value = await inspectPdfLayout(config, allTemplates.value, selections.value)
    const issueCount = pdfReport.value.warnings.length
    status.value = issueCount > 0 ? `PDF 检查完成：${issueCount} 个提示` : 'PDF 检查完成'
  } catch (cause) {
    status.value = cause instanceof Error ? cause.message : 'PDF 检查失败'
  } finally {
    isInspectingPdf.value = false
  }
}

function editTemplate(templateId: string): void {
  activeTemplateId.value = templateId
}

function createTemplate(): void {
  activeTemplateId.value = ''
}

function setSwiper(swiper: SwiperInstance): void {
  swiperInstance.value = swiper
}

function goToSlide(index: number): void {
  swiperInstance.value?.slideTo(index)
}

function reorderSelections(source: PrintSelection[], sortMode: SortMode): PrintSelection[] {
  if (sortMode === 'manual') return source

  const bySelection = new Map(source.map((selection) => [selection.templateId, selection]))
  const selectedTemplates = source.flatMap((selection) => {
    const template = allTemplates.value.find((item) => item.id === selection.templateId)
    return template ? [template] : []
  })

  return sortTemplates(selectedTemplates, sortMode).flatMap((template: TemplateEntry) => {
    const selection = bySelection.get(template.id)
    return selection ? [selection] : []
  })
}

function hasSameSelectionOrder(current: PrintSelection[], next: PrintSelection[]): boolean {
  return current.length === next.length && current.every((selection, index) => selection.templateId === next[index]?.templateId)
}

onMounted(() => {
  const saved = loadWorkbenchState(defaultConfig)
  if (!saved) return

  Object.assign(config, saved.config)
  selections.value = saved.selections
  draftDensity.value = saved.draftDensity
  if (saved.activeTemplateId) {
    activeTemplateId.value = saved.activeTemplateId
  }
})

watch(
  () => ({
    activeTemplateId: activeTemplateId.value,
    config: { ...config },
    draftDensity: draftDensity.value,
    selections: selections.value
  }),
  (state) => {
    saveWorkbenchState(state)
  },
  { deep: true }
)

watch(
  () => ({
    config: { ...config },
    selections: selections.value
  }),
  () => {
    pdfReport.value = null
  },
  { deep: true }
)
</script>

<template>
  <div class="studio-shell flex min-h-screen flex-col text-foreground xl:h-screen xl:min-h-0 xl:overflow-hidden">
    <div class="wave-field" aria-hidden="true">
      <svg viewBox="0 0 1600 820" preserveAspectRatio="none">
        <path d="M-80 250 C 150 110, 350 405, 570 260 S 1030 120, 1240 290 S 1500 410, 1700 210" />
        <path d="M-80 330 C 180 210, 360 470, 620 345 S 1030 230, 1240 365 S 1510 520, 1700 330" />
        <path d="M-80 430 C 190 300, 410 560, 690 455 S 1120 330, 1320 490 S 1500 610, 1600 610" />
        <path d="M-80 560 C 200 460, 410 665, 750 575 S 1120 480, 1360 650 S 1540 690, 1700 690" />
      </svg>
    </div>

    <header class="app-header shrink-0 px-5 py-4 lg:px-8">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div class="min-w-0">
          <h1 class="brand-mark truncate">XCPC Super Template</h1>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="icon" title="上一页" @click="goToSlide(Math.max(0, activeSlide - 1))">
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <nav class="page-tabs" aria-label="页面">
            <button :aria-current="activeSlide === 0 ? 'page' : undefined" :class="{ active: activeSlide === 0 }" type="button" @click="goToSlide(0)">模板库</button>
            <button :aria-current="activeSlide === 1 ? 'page' : undefined" :class="{ active: activeSlide === 1 }" type="button" @click="goToSlide(1)">打印稿</button>
            <button :aria-current="activeSlide === 2 ? 'page' : undefined" :class="{ active: activeSlide === 2 }" type="button" @click="goToSlide(2)">生成</button>
          </nav>
          <Button variant="ghost" size="icon" title="下一页" @click="goToSlide(Math.min(2, activeSlide + 1))">
            <ChevronRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>

    <p v-if="status" class="status-toast" role="status" aria-live="polite">{{ status }}</p>

    <Swiper
      class="work-swiper min-h-0 flex-1"
      :slides-per-view="1"
      :round-lengths="true"
      :allow-touch-move="false"
      :simulate-touch="false"
      @swiper="setSwiper"
      @slide-change="activeSlide = $event.activeIndex"
    >
      <SwiperSlide>
        <SplitPane class="h-full" :default-size="64" :min-size="34" :max-size="78" label="调整模板库和编辑区尺寸">
          <template #first>
            <TemplateLibraryPanel
              class="studio-panel h-full"
              :templates="allTemplates"
              :selected-ids="selectedIds"
              :selection-detail-levels="selectionDetailLevels"
              :active-template-id="activeTemplateId"
              @add="addTemplate"
              @remove="removeTemplate"
              @edit="editTemplate"
              @detail-change="changeDetail"
            />
          </template>
          <template #second>
            <TemplateEditorPanel
              class="studio-panel h-full"
              :template="activeTemplate"
              :is-default-template="isActiveDefaultTemplate"
              :is-override="isActiveOverride"
              :standalone-personal-count="standalonePersonalTemplates.length"
              @new="createTemplate"
              @save="saveTemplate"
              @delete="deleteTemplate"
              @revert="revertTemplate"
              @import-json="importPersonalJson"
              @export-json="exportPersonalJson"
            />
          </template>
        </SplitPane>
      </SwiperSlide>

      <SwiperSlide>
        <DraftOutline
          class="studio-panel h-full min-h-[720px]"
          :items="draftItems"
          :checked-ids="checkedDraftIds"
          :density="draftDensity"
          @reorder="reorderDraft"
          @move="moveDraft"
          @remove="removeTemplate"
          @detail-change="changeDetail"
          @toggle-check="toggleDraftCheck"
          @select-all="setAllDraftChecks"
          @remove-checked="removeCheckedDrafts"
          @bulk-detail="applyDetailToCheckedOrAll"
          @density-change="draftDensity = $event"
        />
      </SwiperSlide>

      <SwiperSlide>
        <SplitPane class="h-full" :default-size="34" :min-size="28" :max-size="62" label="调整生成设置和预览尺寸">
          <template #first>
            <ExportPanel
              class="studio-panel h-full"
              :config="config"
              :markdown="markdown"
              :selected-count="selections.length"
              :is-exporting-pdf="isExportingPdf"
              :is-inspecting-pdf="isInspectingPdf"
              :pdf-report="pdfReport"
              :show-preview="false"
              @update-config="updateConfig"
              @download-markdown="downloadMarkdown"
              @export-pdf="downloadPdf"
              @inspect-pdf="inspectPdf"
            />
          </template>
          <template #second>
            <section class="studio-panel h-full overflow-auto p-5">
              <div class="preview-slab h-full overflow-hidden">
                <textarea class="markdown-preview h-full w-full resize-none p-5 font-mono text-xs leading-5 outline-none" readonly :value="markdown" />
              </div>
            </section>
          </template>
        </SplitPane>
      </SwiperSlide>
    </Swiper>
  </div>
</template>
