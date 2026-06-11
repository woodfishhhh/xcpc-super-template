<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker'
import 'monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution.js'
import 'monaco-editor/min/vs/editor/editor.main.css'

const model = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    language?: string
    ariaLabel?: string
    wrap?: boolean
  }>(),
  {
    language: 'cpp',
    ariaLabel: 'C++ 代码编辑器',
    wrap: false
  }
)

;(self as unknown as { MonacoEnvironment?: monaco.Environment }).MonacoEnvironment = {
  getWorker() {
    return new EditorWorker()
  }
}

const editorHost = useTemplateRef<HTMLElement>('editorHost')
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null)
const resizeObserver = shallowRef<ResizeObserver | null>(null)

monaco.editor.defineTheme('xcpc-light', {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '050505', fontStyle: 'bold' },
    { token: 'number', foreground: '555555' },
    { token: 'string', foreground: '222222' },
    { token: 'comment', foreground: '777777', fontStyle: 'italic' }
  ],
  colors: {
    'editor.background': '#fffdf7',
    'editor.foreground': '#050505',
    'editor.lineHighlightBackground': '#f1eee5',
    'editorLineNumber.foreground': '#8b877c',
    'editorLineNumber.activeForeground': '#050505',
    'editorCursor.foreground': '#050505',
    'editor.selectionBackground': '#d8d4ca',
    'editor.inactiveSelectionBackground': '#ede9df'
  }
})

onMounted(() => {
  if (!editorHost.value) return

  editor.value = monaco.editor.create(editorHost.value, {
    value: model.value,
    language: props.language,
    theme: 'xcpc-light',
    automaticLayout: false,
    fontFamily: 'Consolas, "Cascadia Mono", "Courier New", monospace',
    fontSize: 13,
    lineHeight: 20,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: props.wrap ? 'on' : 'off',
    tabSize: 4,
    insertSpaces: true,
    renderWhitespace: 'selection',
    padding: { top: 12, bottom: 12 },
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    scrollbar: {
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10
    },
    ariaLabel: props.ariaLabel
  })

  editor.value.onDidChangeModelContent(() => {
    const next = editor.value?.getValue() ?? ''
    if (next !== model.value) model.value = next
  })

  resizeObserver.value = new ResizeObserver(() => {
    editor.value?.layout()
  })
  resizeObserver.value.observe(editorHost.value)
})

watch(model, (next) => {
  const current = editor.value?.getValue()
  if (editor.value && current !== next) {
    editor.value.setValue(next)
  }
})

watch(
  () => props.language,
  (language) => {
    const monacoModel = editor.value?.getModel()
    if (monacoModel) monaco.editor.setModelLanguage(monacoModel, language || 'cpp')
  }
)

watch(
  () => props.wrap,
  (wrap) => {
    editor.value?.updateOptions({ wordWrap: wrap ? 'on' : 'off' })
    editor.value?.layout()
  }
)

onBeforeUnmount(() => {
  resizeObserver.value?.disconnect()
  editor.value?.dispose()
})
</script>

<template>
  <div class="code-editor-shell" :data-wrap="props.wrap ? 'on' : 'off'">
    <div ref="editorHost" class="code-editor-host" />
  </div>
</template>
