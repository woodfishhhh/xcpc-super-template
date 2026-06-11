<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'

const props = withDefaults(
  defineProps<{
    defaultSize?: number
    minSize?: number
    maxSize?: number
    breakpoint?: number
    label?: string
  }>(),
  {
    defaultSize: 62,
    minSize: 28,
    maxSize: 76,
    breakpoint: 1024,
    label: '调整面板尺寸'
  }
)

const container = useTemplateRef<HTMLElement>('container')
const firstSize = shallowRef(props.defaultSize)
const isHorizontal = shallowRef(true)
const isDragging = shallowRef(false)
const resizeObserver = shallowRef<ResizeObserver | null>(null)

const orientation = computed(() => (isHorizontal.value ? 'vertical' : 'horizontal'))
const gridStyle = computed(() =>
  isHorizontal.value
    ? {
        gridTemplateColumns: `minmax(18rem, ${firstSize.value}%) var(--splitter-size) minmax(20rem, 1fr)`,
        gridTemplateRows: 'minmax(0, 1fr)'
      }
    : {
        gridTemplateRows: `minmax(18rem, ${firstSize.value}%) var(--splitter-size) minmax(20rem, 1fr)`,
        gridTemplateColumns: 'minmax(0, 1fr)'
      }
)

function clamp(value: number): number {
  return Math.min(props.maxSize, Math.max(props.minSize, value))
}

function syncOrientation(): void {
  const width = container.value?.getBoundingClientRect().width ?? window.innerWidth
  isHorizontal.value = width >= props.breakpoint
}

function startDrag(event: PointerEvent): void {
  event.preventDefault()
  ;(event.currentTarget as HTMLElement).focus()
  isDragging.value = true
  window.addEventListener('pointermove', drag)
  window.addEventListener('pointerup', stopDrag, { once: true })
}

function drag(event: PointerEvent): void {
  if (!isDragging.value || !container.value) return
  const rect = container.value.getBoundingClientRect()
  const raw = isHorizontal.value
    ? ((event.clientX - rect.left) / rect.width) * 100
    : ((event.clientY - rect.top) / rect.height) * 100
  firstSize.value = clamp(raw)
}

function stopDrag(): void {
  isDragging.value = false
  window.removeEventListener('pointermove', drag)
}

function adjustByKeyboard(event: KeyboardEvent): void {
  const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
  if (!keys.includes(event.key)) return
  event.preventDefault()

  if (event.key === 'Home') {
    firstSize.value = props.minSize
    return
  }

  if (event.key === 'End') {
    firstSize.value = props.maxSize
    return
  }

  const delta = event.shiftKey ? 8 : 3
  const grow =
    (isHorizontal.value && event.key === 'ArrowRight') ||
    (!isHorizontal.value && event.key === 'ArrowDown')
  const shrink =
    (isHorizontal.value && event.key === 'ArrowLeft') ||
    (!isHorizontal.value && event.key === 'ArrowUp')

  if (grow) firstSize.value = clamp(firstSize.value + delta)
  if (shrink) firstSize.value = clamp(firstSize.value - delta)
}

onMounted(() => {
  syncOrientation()
  resizeObserver.value = new ResizeObserver(syncOrientation)
  if (container.value) resizeObserver.value.observe(container.value)
})

onBeforeUnmount(() => {
  resizeObserver.value?.disconnect()
  window.removeEventListener('pointermove', drag)
  window.removeEventListener('pointerup', stopDrag)
})
</script>

<template>
  <section
    ref="container"
    class="split-pane"
    :class="{
      'split-pane--horizontal': isHorizontal,
      'split-pane--vertical': !isHorizontal,
      'split-pane--dragging': isDragging
    }"
    :style="gridStyle"
  >
    <div class="split-pane__slot min-h-0 min-w-0">
      <slot name="first" />
    </div>
    <button
      class="split-pane__divider"
      type="button"
      role="separator"
      :aria-label="props.label"
      :aria-orientation="orientation"
      :aria-valuemin="props.minSize"
      :aria-valuemax="props.maxSize"
      :aria-valuenow="Math.round(firstSize)"
      @pointerdown="startDrag"
      @keydown="adjustByKeyboard"
    />
    <div class="split-pane__slot min-h-0 min-w-0">
      <slot name="second" />
    </div>
  </section>
</template>
