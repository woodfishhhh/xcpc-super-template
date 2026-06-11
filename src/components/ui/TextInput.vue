<script setup lang="ts">
import { nextTick, onMounted, useTemplateRef, watch } from 'vue'
import { cn } from '@/lib/utils'

const model = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    id?: string
    ariaLabel?: string
    placeholder?: string
    multiline?: boolean
    autosize?: boolean
    rows?: number
    type?: string
    inputClass?: string
  }>(),
  {
    id: '',
    ariaLabel: '',
    placeholder: '',
    multiline: false,
    autosize: false,
    rows: 3,
    type: 'text',
    inputClass: ''
  }
)

const inputRef = useTemplateRef<HTMLInputElement | HTMLTextAreaElement>('control')

function resizeTextarea(): void {
  if (!props.multiline || !props.autosize) return
  const element = inputRef.value
  if (!(element instanceof HTMLTextAreaElement)) return
  element.style.height = 'auto'
  element.style.height = `${element.scrollHeight}px`
}

function updateValue(event: Event): void {
  model.value = (event.target as HTMLInputElement | HTMLTextAreaElement).value
  void nextTick(resizeTextarea)
}

onMounted(resizeTextarea)

watch(model, () => {
  void nextTick(resizeTextarea)
})
</script>

<template>
  <textarea
    v-if="props.multiline"
    :id="props.id || undefined"
    :aria-label="props.ariaLabel || undefined"
    ref="control"
    class="text-control text-control--textarea"
    :class="cn(props.autosize ? 'overflow-hidden' : 'resize-y', props.inputClass)"
    :placeholder="props.placeholder"
    :rows="props.rows"
    :value="model"
    @input="updateValue"
  />
  <input
    v-else
    :id="props.id || undefined"
    :aria-label="props.ariaLabel || undefined"
    ref="control"
    class="text-control"
    :class="props.inputClass"
    :placeholder="props.placeholder"
    :type="props.type"
    :value="model"
    @input="updateValue"
  />
</template>
