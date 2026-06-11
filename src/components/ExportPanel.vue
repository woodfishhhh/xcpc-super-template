<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, CheckCircle2, Download, FileDown, FileText, Printer } from '@lucide/vue'
import Button from '@/components/ui/Button.vue'
import FieldControl from '@/components/ui/FieldControl.vue'
import TextInput from '@/components/ui/TextInput.vue'
import type { PdfLayoutReport } from '@/lib/pdfReport'
import type { OutputMode, PrintConfig, PrintLayout, SortMode } from '@/types/template'

const props = withDefaults(
  defineProps<{
    config: PrintConfig
    markdown: string
    selectedCount: number
    isExportingPdf: boolean
    isInspectingPdf: boolean
    pdfReport: PdfLayoutReport | null
    showPreview?: boolean
  }>(),
  {
    showPreview: true
  }
)

const emit = defineEmits<{
  updateConfig: [patch: Partial<PrintConfig>]
  downloadMarkdown: []
  exportPdf: []
  inspectPdf: []
}>()

const titleModel = computed({
  get: () => props.config.title,
  set: (title: string) => emit('updateConfig', { title })
})

const canDownloadMarkdown = computed(() => props.config.output === 'markdown' || props.config.output === 'both')
const canDownloadPdf = computed(() => props.config.output === 'pdf' || props.config.output === 'both')
const tocPreviewEntries = computed(() => props.pdfReport?.tocEntries.slice(0, 8) ?? [])
const errorCount = computed(() => props.pdfReport?.warnings.filter((warning) => warning.severity === 'error').length ?? 0)
const warningCount = computed(() => props.pdfReport?.warnings.filter((warning) => warning.severity === 'warning').length ?? 0)
const infoCount = computed(() => props.pdfReport?.warnings.filter((warning) => warning.severity === 'info').length ?? 0)
const reportStatusLabel = computed(() => {
  if (!props.pdfReport) return '未检查'
  if (errorCount.value > 0) return '需要处理'
  if (warningCount.value > 0) return '建议复核'
  return '可导出'
})
</script>

<template>
  <aside class="flex min-h-0 flex-col">
    <div class="panel-head">
      <h2 class="panel-title">生成设置</h2>
    </div>

    <div class="min-h-0 flex-1 overflow-auto p-5">
      <div class="space-y-5">
        <FieldControl label="打印稿标题">
          <TextInput v-model="titleModel" aria-label="打印稿标题" />
        </FieldControl>

        <div class="grid grid-cols-2 gap-3">
          <FieldControl label="目录" dense>
            <select
              class="select-control"
              aria-label="目录"
              :value="props.config.includeToc ? 'yes' : 'no'"
              @change="emit('updateConfig', { includeToc: ($event.target as HTMLSelectElement).value === 'yes' })"
            >
              <option value="yes">生成目录</option>
              <option value="no">不生成</option>
            </select>
          </FieldControl>

          <FieldControl label="目录深度" dense>
            <select
              class="select-control"
              aria-label="目录深度"
              :value="props.config.tocDepth"
              @change="emit('updateConfig', { tocDepth: Number(($event.target as HTMLSelectElement).value) as 1 | 2 })"
            >
              <option :value="1">1 级</option>
              <option :value="2">2 级</option>
            </select>
          </FieldControl>
        </div>

        <FieldControl label="排序方式">
          <select
            class="select-control"
            aria-label="排序方式"
            :value="props.config.sortMode"
            @change="emit('updateConfig', { sortMode: ($event.target as HTMLSelectElement).value as SortMode })"
          >
            <option value="learning">学习顺序</option>
            <option value="alphabetical">字典序</option>
            <option value="manual">手动顺序</option>
          </select>
        </FieldControl>

        <div class="grid grid-cols-2 gap-3">
          <FieldControl label="版式" dense>
            <select
              class="select-control"
              aria-label="版式"
              :value="props.config.layout"
              @change="emit('updateConfig', { layout: ($event.target as HTMLSelectElement).value as PrintLayout })"
            >
              <option value="compact">紧凑比赛版</option>
              <option value="book">书籍章节版</option>
            </select>
          </FieldControl>

          <FieldControl label="输出格式" dense>
            <select
              class="select-control"
              aria-label="输出格式"
              :value="props.config.output"
              @change="emit('updateConfig', { output: ($event.target as HTMLSelectElement).value as OutputMode })"
            >
              <option value="markdown">只生成 Markdown</option>
              <option value="pdf">只生成 PDF</option>
              <option value="both">Markdown + PDF</option>
            </select>
          </FieldControl>
        </div>

        <div class="grid gap-2" :class="props.config.output === 'both' ? 'grid-cols-2' : 'grid-cols-1'">
          <Button
            v-if="canDownloadMarkdown"
            variant="outline"
            :disabled="props.selectedCount === 0"
            @click="emit('downloadMarkdown')"
          >
            <FileText class="h-4 w-4" />
            Markdown
          </Button>
          <Button v-if="canDownloadPdf" :disabled="props.selectedCount === 0 || props.isExportingPdf" @click="emit('exportPdf')">
            <FileDown class="h-4 w-4" />
            {{ props.isExportingPdf ? '生成中' : 'PDF' }}
          </Button>
        </div>

        <div class="pdf-report">
          <div class="pdf-report__head">
            <div>
              <span class="field-label">PDF 检查</span>
              <strong>{{ reportStatusLabel }}</strong>
            </div>
            <Button
              variant="outline"
              size="sm"
              :disabled="props.selectedCount === 0 || props.isInspectingPdf || props.isExportingPdf"
              @click="emit('inspectPdf')"
            >
              <Printer class="h-4 w-4" />
              {{ props.isInspectingPdf ? '检查中' : '检查' }}
            </Button>
          </div>

          <div v-if="props.pdfReport" class="pdf-report__body">
            <div class="pdf-report__stats">
              <span>{{ props.pdfReport.pageCount }} 页</span>
              <span>{{ props.pdfReport.templateCount }} 条</span>
              <span>{{ errorCount }} 错误</span>
              <span>{{ warningCount }} 警告</span>
              <span>{{ infoCount }} 提示</span>
            </div>

            <ol v-if="props.config.includeToc && tocPreviewEntries.length > 0" class="pdf-report__toc">
              <li v-for="entry in tocPreviewEntries" :key="entry.templateId">
                <span>{{ entry.title }}</span>
                <strong>{{ entry.page ?? '-' }}</strong>
              </li>
            </ol>

            <ul v-if="props.pdfReport.warnings.length > 0" class="pdf-report__warnings">
              <li
                v-for="warning in props.pdfReport.warnings.slice(0, 5)"
                :key="`${warning.code}-${warning.templateId ?? 'global'}-${warning.page ?? 'x'}-${warning.message}`"
                :data-severity="warning.severity"
              >
                <AlertTriangle v-if="warning.severity !== 'info'" class="h-3.5 w-3.5" />
                <CheckCircle2 v-else class="h-3.5 w-3.5" />
                <span>{{ warning.message }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div v-if="props.showPreview" class="preview-slab overflow-hidden">
          <div class="flex items-center justify-between border-b border-primary px-3 py-3">
            <span class="field-label">Markdown 预览</span>
            <div class="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Printer class="h-3.5 w-3.5" />
              {{ props.selectedCount }} 条
            </div>
          </div>
          <textarea
            class="markdown-preview h-[42vh] w-full resize-none p-4 font-mono text-xs leading-5 outline-none"
            readonly
            :value="props.markdown"
          />
        </div>

        <Button
          v-if="props.config.output === 'both'"
          class="w-full"
          :disabled="props.selectedCount === 0 || props.isExportingPdf"
          @click="
            emit('downloadMarkdown');
            emit('exportPdf')
          "
        >
          <Download class="h-4 w-4" />
          同时下载
        </Button>
      </div>
    </div>
  </aside>
</template>
