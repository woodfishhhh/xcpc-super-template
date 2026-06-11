<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string
    hint?: string
    controlId?: string
    dense?: boolean
  }>(),
  {
    hint: '',
    controlId: '',
    dense: false
  }
)
</script>

<template>
  <div class="form-field" :class="{ 'form-field--dense': props.dense }">
    <div class="form-field__head">
      <label v-if="props.controlId" class="form-field__label" :for="props.controlId">
        {{ props.label }}
      </label>
      <span v-else class="form-field__label">{{ props.label }}</span>
      <span v-if="props.hint" class="form-field__hint">{{ props.hint }}</span>
    </div>
    <slot />
  </div>
</template>
