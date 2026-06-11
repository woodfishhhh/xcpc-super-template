<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, reactive, shallowRef, watch, useTemplateRef } from 'vue'
import { Copy, FileInput, FileOutput, Plus, RotateCcw, Save, Trash2 } from '@lucide/vue'
import Button from '@/components/ui/Button.vue'
import FieldControl from '@/components/ui/FieldControl.vue'
import TextInput from '@/components/ui/TextInput.vue'
import { stripCodeFence } from '@/lib/code'
import {
  deleteEditorDraft,
  getEditorDraftKey,
  loadEditorDraft,
  saveEditorDraft,
  type EditorTemplateDraft
} from '@/lib/editorDraftStore'
import { normalizeCategoryPath } from '@/lib/templates'
import type { TemplateEntry } from '@/types/template'

export type TemplateDraft = Omit<TemplateEntry, 'id' | 'source'> & { id?: string }

const CppCodeEditor = defineAsyncComponent(() => import('@/components/CppCodeEditor.vue'))

const props = defineProps<{
  template: TemplateEntry | null
  isDefaultTemplate: boolean
  isOverride: boolean
  standalonePersonalCount: number
  categorySuggestions: string[]
}>()

const emit = defineEmits<{
  new: []
  copy: [templateId: string]
  save: [template: TemplateDraft]
  delete: [templateId: string]
  revert: [templateId: string]
  importJson: [json: string]
  exportJson: []
  exportTemplateJson: [templateId: string]
}>()

const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const codeWrap = shallowRef(false)
const isApplyingTemplate = shallowRef(false)
const restoredDraft = shallowRef(false)
const currentDraftKey = shallowRef(getEditorDraftKey(''))
const baselineDraft = shallowRef<EditorTemplateDraft>(createBlankEditorDraft())
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
const canCopy = computed(() => Boolean(form.id) && props.isDefaultTemplate)
const canExportCurrent = computed(() => Boolean(form.id))
const currentDraft = computed(() => serializeForm())
const hasUnsavedChanges = computed(() => !areEditorDraftsEqual(currentDraft.value, baselineDraft.value))
const editorStateLabel = computed(() => {
  if (restoredDraft.value) return '草稿已恢复'
  if (hasUnsavedChanges.value) return '未保存，已自动保存草稿'
  if (!form.id && !form.title.trim()) return '空白草稿'
  return '已保存'
})
const visibleCategorySuggestions = computed(() =>
  props.categorySuggestions.filter((path) => path !== form.categoryPath).slice(0, 8)
)

watch(
  () => props.template,
  (template) => {
    applyTemplateToForm(template)
  },
  { immediate: true }
)

watch(
  currentDraft,
  (draft) => {
    if (isApplyingTemplate.value) return

    restoredDraft.value = false
    if (areEditorDraftsEqual(draft, baselineDraft.value)) {
      deleteEditorDraft(currentDraftKey.value)
      return
    }

    saveEditorDraft(currentDraftKey.value, draft)
  },
  { deep: true }
)

function createNew(): void {
  emit('new')
}

function applyCategorySuggestion(path: string): void {
  form.categoryPath = path
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

  baselineDraft.value = currentDraft.value
  restoredDraft.value = false
  deleteEditorDraft(currentDraftKey.value)
  emit('save', draft)
}

function deleteCurrentTemplate(): void {
  if (!form.id) return
  deleteEditorDraft(currentDraftKey.value)
  restoredDraft.value = false
  emit('delete', form.id)
}

function revertCurrentTemplate(): void {
  if (!form.id) return
  deleteEditorDraft(currentDraftKey.value)
  restoredDraft.value = false
  emit('revert', form.id)
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

function applyTemplateToForm(template: TemplateEntry | null): void {
  const baseDraft = createEditorDraftFromTemplate(template)
  const draftKey = getEditorDraftKey(template?.id)
  const savedDraft = loadEditorDraft(draftKey)
  const nextDraft = savedDraft?.draft ?? baseDraft

  isApplyingTemplate.value = true
  currentDraftKey.value = draftKey
  baselineDraft.value = baseDraft
  restoredDraft.value = Boolean(savedDraft && !areEditorDraftsEqual(savedDraft.draft, baseDraft))
  applyDraftToForm(nextDraft)
  void nextTick(() => {
    isApplyingTemplate.value = false
  })
}

function applyDraftToForm(draft: EditorTemplateDraft): void {
  form.id = draft.id ?? ''
  form.title = draft.title
  form.categoryPath = draft.categoryPath
  form.timeComplexity = draft.timeComplexity
  form.spaceComplexity = draft.spaceComplexity
  form.brief = draft.brief
  form.detail = draft.detail
  form.codeLanguage = draft.codeLanguage
  form.code = stripCodeFence(draft.code)
}

function createEditorDraftFromTemplate(template: TemplateEntry | null): EditorTemplateDraft {
  if (!template) return createBlankEditorDraft()

  return {
    id: template.id,
    title: template.title,
    categoryPath: template.category.join('/'),
    timeComplexity: template.timeComplexity,
    spaceComplexity: template.spaceComplexity,
    brief: template.brief,
    detail: template.detail,
    codeLanguage: template.codeLanguage,
    code: stripCodeFence(template.code)
  }
}

function createBlankEditorDraft(): EditorTemplateDraft {
  return {
    title: '',
    categoryPath: '个人模板',
    timeComplexity: '未注明',
    spaceComplexity: '未注明',
    brief: '',
    detail: '',
    codeLanguage: 'cpp',
    code: ''
  }
}

function serializeForm(): EditorTemplateDraft {
  return {
    id: form.id || undefined,
    title: form.title,
    categoryPath: form.categoryPath,
    timeComplexity: form.timeComplexity,
    spaceComplexity: form.spaceComplexity,
    brief: form.brief,
    detail: form.detail,
    codeLanguage: form.codeLanguage,
    code: stripCodeFence(form.code)
  }
}

function areEditorDraftsEqual(left: EditorTemplateDraft, right: EditorTemplateDraft): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}
</script>

<template>
  <aside class="template-editor flex min-h-0 flex-col bg-[rgba(255,252,245,0.74)]">
    <div class="panel-head">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="panel-title">编辑</h2>
          <p aria-label="编辑状态" class="mt-1 text-xs text-muted-foreground">{{ editorStateLabel }}</p>
        </div>
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
          <div v-if="visibleCategorySuggestions.length > 0" class="category-suggestions">
            <button
              v-for="path in visibleCategorySuggestions"
              :key="path"
              type="button"
              :title="`套用分类 ${path}`"
              @click="applyCategorySuggestion(path)"
            >
              {{ path }}
            </button>
          </div>
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
          <Button variant="outline" :disabled="!canCopy" @click="form.id && emit('copy', form.id)">
            <Copy class="h-4 w-4" />
            复制
          </Button>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <Button variant="outline" :disabled="!canRevert" @click="revertCurrentTemplate">
            <RotateCcw class="h-4 w-4" />
            默认
          </Button>
          <Button variant="destructive" :disabled="!canDelete" @click="deleteCurrentTemplate">
            <Trash2 class="h-4 w-4" />
            删除
          </Button>
        </div>

        <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button variant="outline" @click="openImport">
            <FileInput class="h-4 w-4" />
            导入
          </Button>
          <Button variant="outline" :disabled="!canExportCurrent" @click="form.id && emit('exportTemplateJson', form.id)">
            <FileOutput class="h-4 w-4" />
            导出当前
          </Button>
          <Button variant="outline" :disabled="props.standalonePersonalCount === 0" @click="emit('exportJson')">
            <FileOutput class="h-4 w-4" />
            导出库
          </Button>
        </div>
      </div>
    </div>

    <input ref="fileInput" class="hidden" type="file" accept="application/json,.json" @change="readImportFile" />
  </aside>
</template>
