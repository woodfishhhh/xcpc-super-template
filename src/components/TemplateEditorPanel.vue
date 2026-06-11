<script setup lang="ts">
import { computed, defineAsyncComponent, reactive, shallowRef, watch, useTemplateRef } from 'vue'
import { FileInput, FileOutput, Plus, RotateCcw, Save, Trash2 } from '@lucide/vue'
import Button from '@/components/ui/Button.vue'
import FieldControl from '@/components/ui/FieldControl.vue'
import TextInput from '@/components/ui/TextInput.vue'
import { stripCodeFence } from '@/lib/code'
import { normalizeCategoryPath } from '@/lib/templates'
import type { TemplateEntry } from '@/types/template'

export type TemplateDraft = Omit<TemplateEntry, 'id' | 'source'> & { id?: string }

const CppCodeEditor = defineAsyncComponent(() => import('@/components/CppCodeEditor.vue'))

const props = defineProps<{
  template: TemplateEntry | null
  isDefaultTemplate: boolean
  isOverride: boolean
  standalonePersonalCount: number
}>()

const emit = defineEmits<{
  new: []
  save: [template: TemplateDraft]
  delete: [templateId: string]
  revert: [templateId: string]
  importJson: [json: string]
  exportJson: []
}>()

const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const codeWrap = shallowRef(false)
const form = reactive({
  id: '',
  title: '',
  categoryPath: '个人模板',
  timeComplexity: '未注明',
  spaceComplexity: '未注明',
  brief: '',
  detail: '',
  codeLanguage: 'cpp',
  code: ''
})

const canDelete = computed(() => Boolean(form.id) && !props.isDefaultTemplate)
const canRevert = computed(() => Boolean(form.id) && props.isDefaultTemplate && props.isOverride)

watch(
  () => props.template,
  (template) => {
    if (!template) {
      resetForm()
      return
    }
    form.id = template.id
    form.title = template.title
    form.categoryPath = template.category.join('/')
    form.timeComplexity = template.timeComplexity
    form.spaceComplexity = template.spaceComplexity
    form.brief = template.brief
    form.detail = template.detail
    form.codeLanguage = template.codeLanguage
    form.code = stripCodeFence(template.code)
  },
  { immediate: true }
)

function resetForm(): void {
  form.id = ''
  form.title = ''
  form.categoryPath = '个人模板'
  form.timeComplexity = '未注明'
  form.spaceComplexity = '未注明'
  form.brief = ''
  form.detail = ''
  form.codeLanguage = 'cpp'
  form.code = ''
}

function createNew(): void {
  resetForm()
  emit('new')
}

function save(): void {
  if (!form.title.trim()) return

  const draft: TemplateDraft = {
    id: form.id || undefined,
    title: form.title.trim(),
    category: normalizeCategoryPath(form.categoryPath),
    learningOrder: props.template?.learningOrder ?? 9000,
    tags: props.template?.tags ?? ['personal'],
    timeComplexity: form.timeComplexity.trim() || '未注明',
    spaceComplexity: form.spaceComplexity.trim() || '未注明',
    brief: form.brief,
    detail: form.detail,
    codeLanguage: form.codeLanguage.trim() || 'cpp',
    code: stripCodeFence(form.code),
    origin: props.template?.origin,
    updatedAt: new Date().toISOString()
  }

  emit('save', draft)
}

function openImport(): void {
  fileInput.value?.click()
}

async function readImportFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  emit('importJson', await file.text())
  input.value = ''
}
</script>

<template>
  <aside class="template-editor flex min-h-0 flex-col bg-[rgba(255,252,245,0.74)]">
    <div class="panel-head">
      <div class="flex items-start justify-between gap-3">
        <h2 class="panel-title">编辑</h2>
        <Button variant="outline" size="sm" @click="createNew">
          <Plus class="h-4 w-4" />
          新建
        </Button>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-auto p-5">
      <div class="grid gap-4">
        <FieldControl label="标题">
          <TextInput v-model="form.title" aria-label="标题" placeholder="Dijkstra" />
        </FieldControl>

        <FieldControl label="分类路径">
          <TextInput v-model="form.categoryPath" aria-label="分类路径" placeholder="图论/最短路" />
        </FieldControl>

        <div class="editor-field-grid">
          <FieldControl label="时间复杂度" dense>
            <TextInput v-model="form.timeComplexity" aria-label="时间复杂度" placeholder="O(m log n)" />
          </FieldControl>
          <FieldControl label="空间复杂度" dense>
            <TextInput v-model="form.spaceComplexity" aria-label="空间复杂度" placeholder="O(n + m)" />
          </FieldControl>
        </div>

        <FieldControl label="简略介绍">
          <TextInput v-model="form.brief" aria-label="简略介绍" multiline autosize :rows="2" />
        </FieldControl>

        <FieldControl label="详细介绍">
          <TextInput v-model="form.detail" aria-label="详细介绍" multiline autosize :rows="3" />
        </FieldControl>

        <FieldControl label="C++ 代码" hint="Consolas">
          <div class="code-editor-tools">
            <div class="segmented grid grid-cols-2 text-xs">
              <button
                type="button"
                :aria-pressed="!codeWrap"
                :class="!codeWrap ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'"
                @click="codeWrap = false"
              >
                不换行
              </button>
              <button
                type="button"
                :aria-pressed="codeWrap"
                :class="codeWrap ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'"
                @click="codeWrap = true"
              >
                换行
              </button>
            </div>
          </div>
          <CppCodeEditor v-model="form.code" language="cpp" :wrap="codeWrap" />
        </FieldControl>

        <div class="grid grid-cols-2 gap-2">
          <Button :disabled="!form.title.trim()" @click="save">
            <Save class="h-4 w-4" />
            保存
          </Button>
          <Button variant="outline" :disabled="!canRevert" @click="form.id && emit('revert', form.id)">
            <RotateCcw class="h-4 w-4" />
            默认
          </Button>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <Button variant="outline" @click="openImport">
            <FileInput class="h-4 w-4" />
            导入
          </Button>
          <Button variant="outline" :disabled="props.standalonePersonalCount === 0" @click="emit('exportJson')">
            <FileOutput class="h-4 w-4" />
            导出
          </Button>
        </div>

        <Button variant="destructive" :disabled="!canDelete" @click="form.id && emit('delete', form.id)">
          <Trash2 class="h-4 w-4" />
          删除
        </Button>
      </div>
    </div>

    <input ref="fileInput" class="hidden" type="file" accept="application/json,.json" @change="readImportFile" />
  </aside>
</template>
