<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown, ArrowDownToLine, ArrowUp, ArrowUpToLine, GripVertical, Trash2 } from '@lucide/vue'
import { VueDraggable } from 'vue-draggable-plus'
import DraftPresetPanel from '@/components/DraftPresetPanel.vue'
import Button from '@/components/ui/Button.vue'
import FieldControl from '@/components/ui/FieldControl.vue'
import type { DraftPresetPack } from '@/lib/presets'
import type { DetailLevel, MoveDirection, PrintSelection, TemplateEntry } from '@/types/template'

type CheckedMoveDirection = Extract<MoveDirection, 'top' | 'bottom'>

export interface DraftItem {
  selection: PrintSelection
  template: TemplateEntry
}

const props = defineProps<{
  items: DraftItem[]
  checkedIds: Set<string>
  density: 'compact' | 'comfortable' | 'large'
  presetPacks: DraftPresetPack[]
}>()

const emit = defineEmits<{
  applyPreset: [presetId: DraftPresetPack['id']]
  reorder: [items: PrintSelection[]]
  move: [templateId: string, direction: MoveDirection]
  moveChapter: [chapterKey: string, direction: MoveDirection]
  moveChecked: [direction: CheckedMoveDirection]
  remove: [templateId: string]
  detailChange: [templateId: string, detailLevel: DetailLevel]
  toggleCheck: [templateId: string]
  selectAll: [checked: boolean]
  removeChecked: []
  bulkDetail: [detailLevel: DetailLevel]
  densityChange: [density: 'compact' | 'comfortable' | 'large']
}>()

const draggableItems = computed({
  get: () => props.items,
  set: (items: DraftItem[]) => {
    emit(
      'reorder',
      items.map((item) => item.selection)
    )
  }
})

const allChecked = computed(
  () => props.items.length > 0 && props.items.every((item) => props.checkedIds.has(item.template.id))
)

const checkedCount = computed(() => props.items.filter((item) => props.checkedIds.has(item.template.id)).length)

const densityClass = computed(() => ({
  compact: 'draft-row-compact',
  comfortable: 'draft-row-comfortable',
  large: 'draft-row-large'
})[props.density])

const chapters = computed(() => {
  const groups = new Map<string, { key: string; title: string; count: number }>()
  for (const item of props.items) {
    const title = item.template.category[0]?.trim() || '未分类'
    const group = groups.get(title)
    if (group) {
      group.count += 1
      continue
    }
    groups.set(title, { key: title, title, count: 1 })
  }
  return [...groups.values()]
})
</script>

<template>
  <section class="flex min-h-0 flex-col">
    <div class="panel-head">
      <h2 class="panel-title">当前打印稿</h2>
      <div class="mt-4 grid gap-3 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <label class="flex items-center gap-2 text-sm">
          <input
            class="h-4 w-4 accent-black"
            type="checkbox"
            :checked="allChecked"
            @change="emit('selectAll', ($event.target as HTMLInputElement).checked)"
          />
          全选
        </label>

        <div class="segmented grid grid-cols-3 text-xs">
          <button
            type="button"
            :class="props.density === 'compact' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'"
            @click="emit('densityChange', 'compact')"
          >
            紧凑
          </button>
          <button
            type="button"
            :class="props.density === 'comfortable' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'"
            @click="emit('densityChange', 'comfortable')"
          >
            标准
          </button>
          <button
            type="button"
            :class="props.density === 'large' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'"
            @click="emit('densityChange', 'large')"
          >
            展开
          </button>
        </div>

        <div class="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" :disabled="checkedCount === 0" @click="emit('removeChecked')">
            删除
          </Button>
          <Button variant="outline" size="sm" :disabled="checkedCount === 0" @click="emit('moveChecked', 'top')">
            置顶
          </Button>
          <Button variant="outline" size="sm" :disabled="checkedCount === 0" @click="emit('moveChecked', 'bottom')">
            置底
          </Button>
          <Button variant="outline" size="sm" :disabled="checkedCount === 0" @click="emit('bulkDetail', 'brief')">
            简略
          </Button>
          <Button variant="outline" size="sm" :disabled="checkedCount === 0" @click="emit('bulkDetail', 'detail')">
            详细
          </Button>
          <Button variant="outline" size="sm" :disabled="checkedCount === 0" @click="emit('bulkDetail', 'none')">
            无介绍
          </Button>
        </div>
      </div>

      <DraftPresetPanel :packs="props.presetPacks" @apply-preset="emit('applyPreset', $event)" />

      <div v-if="chapters.length > 1" class="mt-4 grid gap-2" aria-label="章节顺序">
        <article
          v-for="(chapter, index) in chapters"
          :key="chapter.key"
          class="flex flex-wrap items-center justify-between gap-2 border border-primary bg-background px-3 py-2"
        >
          <div class="min-w-0">
            <h3 class="truncate text-sm font-semibold">{{ chapter.title }}</h3>
            <p class="text-[11px] text-muted-foreground">{{ chapter.count }} 条</p>
          </div>
          <div class="grid grid-cols-4 gap-1">
            <Button variant="ghost" size="icon" :title="`${chapter.title} 置顶`" :disabled="index === 0" @click="emit('moveChapter', chapter.key, 'top')">
              <ArrowUpToLine class="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" :title="`${chapter.title} 上移`" :disabled="index === 0" @click="emit('moveChapter', chapter.key, 'up')">
              <ArrowUp class="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" :title="`${chapter.title} 下移`" :disabled="index === chapters.length - 1" @click="emit('moveChapter', chapter.key, 'down')">
              <ArrowDown class="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" :title="`${chapter.title} 置底`" :disabled="index === chapters.length - 1" @click="emit('moveChapter', chapter.key, 'bottom')">
              <ArrowDownToLine class="h-4 w-4" />
            </Button>
          </div>
        </article>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-auto p-5 lg:pt-10">
      <div v-if="props.items.length === 0" class="empty-state p-10 text-center text-sm text-muted-foreground">
        暂无条目
      </div>

      <VueDraggable v-else v-model="draggableItems" tag="div" class="space-y-4" handle=".drag-handle">
        <article
          v-for="(item, index) in draggableItems"
          :key="item.template.id"
          class="draft-row p-4"
          :class="[densityClass, props.checkedIds.has(item.template.id) ? 'shadow-[7px_7px_0_#050505]' : '']"
        >
          <div class="flex items-start gap-3">
            <input
              class="mt-2 h-4 w-4 shrink-0 accent-black"
              type="checkbox"
              :aria-label="`选择 ${item.template.title}`"
              :checked="props.checkedIds.has(item.template.id)"
              @change="emit('toggleCheck', item.template.id)"
            />
            <div class="draft-index">{{ String(index + 1).padStart(2, '0') }}</div>
            <button
              class="drag-handle mt-0.5 rounded-md p-2 text-muted-foreground hover:bg-secondary"
              type="button"
              title="拖拽排序"
            >
              <GripVertical class="h-4 w-4" />
            </button>

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="truncate text-lg font-semibold">{{ item.template.title }}</h3>
                <span class="source-chip text-[10px]">
                  {{ item.template.category.join(' / ') }}
                </span>
              </div>
              <p class="mt-1 text-xs text-muted-foreground">
                {{ item.template.timeComplexity }} · {{ item.template.spaceComplexity }}
              </p>
              <p v-if="props.density === 'large'" class="mt-3 text-sm leading-6 text-muted-foreground">
                {{ item.template.detail || item.template.brief }}
              </p>

              <FieldControl
                class="mt-4"
                label="介绍详细度"
                dense
                :class="props.density === 'compact' ? 'hidden' : ''"
              >
                <select
                  class="select-control"
                  aria-label="介绍详细度"
                  :value="item.selection.detailLevel"
                  @change="
                    emit(
                      'detailChange',
                      item.template.id,
                      ($event.target as HTMLSelectElement).value as DetailLevel
                    )
                  "
                >
                  <option value="none">不显示介绍</option>
                  <option value="brief">简略介绍</option>
                  <option value="detail">详细介绍</option>
                </select>
              </FieldControl>
            </div>

            <div class="grid shrink-0 grid-cols-2 gap-1.5">
              <Button variant="ghost" size="icon" title="移到顶部" :disabled="index === 0" @click="emit('move', item.template.id, 'top')">
                <ArrowUpToLine class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="上移" :disabled="index === 0" @click="emit('move', item.template.id, 'up')">
                <ArrowUp class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="下移" :disabled="index === draggableItems.length - 1" @click="emit('move', item.template.id, 'down')">
                <ArrowDown class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="移到底部" :disabled="index === draggableItems.length - 1" @click="emit('move', item.template.id, 'bottom')">
                <ArrowDownToLine class="h-4 w-4" />
              </Button>
              <Button
                class="col-span-2"
                variant="ghost"
                size="sm"
                title="移出打印稿"
                @click="emit('remove', item.template.id)"
              >
                <Trash2 class="h-4 w-4" />
                移除
              </Button>
            </div>
          </div>
        </article>
      </VueDraggable>
    </div>
  </section>
</template>
