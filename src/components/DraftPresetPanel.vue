<script setup lang="ts">
import { Layers3 } from '@lucide/vue'
import Button from '@/components/ui/Button.vue'
import type { DraftPresetPack } from '@/lib/presets'

const props = defineProps<{
  packs: DraftPresetPack[]
}>()

const emit = defineEmits<{
  applyPreset: [presetId: DraftPresetPack['id']]
}>()
</script>

<template>
  <section v-if="props.packs.length > 0" class="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label="预设包">
    <article
      v-for="pack in props.packs"
      :key="pack.id"
      class="border border-primary bg-background p-3 transition-colors duration-200 hover:bg-secondary"
    >
      <div class="flex min-w-0 items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="truncate text-sm font-semibold">{{ pack.title }}</h3>
          <p class="mt-1 text-[11px] leading-4 text-muted-foreground">{{ pack.category }}</p>
        </div>
        <span class="source-chip shrink-0 text-[10px]">{{ pack.templateIds.length }} 条</span>
      </div>
      <Button
        class="mt-3 w-full"
        variant="outline"
        size="sm"
        :aria-label="`应用 ${pack.title}`"
        @click="emit('applyPreset', pack.id)"
      >
        <Layers3 class="h-3.5 w-3.5" />
        应用
      </Button>
    </article>
  </section>
</template>
