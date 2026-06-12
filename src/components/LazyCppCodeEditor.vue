<script setup lang="ts">
import { defineAsyncComponent, shallowRef } from 'vue'

const MonacoCppCodeEditor = defineAsyncComponent(() => import('@/components/CppCodeEditor.vue'))

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

const shouldLoadEditor = shallowRef(false)

function loadEditor(): void {
  shouldLoadEditor.value = true
}

function updateFallbackCode(event: Event): void {
  model.value = (event.target as HTMLTextAreaElement).value
}
</script>

<template>
  <div class="code-editor-lazy">
    <MonacoCppCodeEditor
      v-if="shouldLoadEditor"
      v-model="model"
      :aria-label="props.ariaLabel"
      :language="props.language"
      :wrap="props.wrap"
    />
    <div v-else class="code-editor-shell" :data-wrap="props.wrap ? 'on' : 'off'">
      <textarea
        class="code-editor-fallback"
        :aria-label="props.ariaLabel"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        :value="model"
        :wrap="props.wrap ? 'soft' : 'off'"
        @focus="loadEditor"
        @pointerdown="loadEditor"
        @input="updateFallbackCode"
      />
    </div>
  </div>
</template>
