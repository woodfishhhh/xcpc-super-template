<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { Edit3, Plus, Search, X } from '@lucide/vue'
import Button from '@/components/ui/Button.vue'
import FieldControl from '@/components/ui/FieldControl.vue'
import TextInput from '@/components/ui/TextInput.vue'
import {
  ALL_CATEGORY_KEY,
  buildTemplateCategoryOptions,
  categoryKey,
  filterTemplatesForLibrary,
  type TemplateSourceFilter
} from '@/lib/templates'
import type { DetailLevel, TemplateEntry } from '@/types/template'

const props = defineProps<{
  templates: TemplateEntry[]
  selectedIds: Set<string>
  selectionDetailLevels: Map<string, DetailLevel>
  activeTemplateId: string
}>()

const emit = defineEmits<{
  add: [templateId: string, detailLevel: DetailLevel]
  remove: [templateId: string]
  edit: [templateId: string]
  detailChange: [templateId: string, detailLevel: DetailLevel]
}>()

const query = shallowRef('')
const sourceFilter = shallowRef<TemplateSourceFilter>('all')
const activeCategoryKey = shallowRef(ALL_CATEGORY_KEY)
const detailDrafts = shallowRef<Record<string, DetailLevel>>({})

const categoryOptions = computed(() => buildTemplateCategoryOptions(props.templates, sourceFilter.value))
const activeCategoryPath = computed(
  () => categoryOptions.value.find((option) => option.key === activeCategoryKey.value)?.path ?? []
)
const sourceQueryTemplates = computed(() =>
  filterTemplatesForLibrary(props.templates, {
    source: sourceFilter.value,
    query: query.value
  })
)
const visibleTemplates = computed(() =>
  filterTemplatesForLibrary(sourceQueryTemplates.value, { categoryPath: activeCategoryPath.value })
)

const filteredGroups = computed(() => {
  const groups = new Map<string, TemplateEntry[]>()

  for (const template of visibleTemplates.value) {
    const category = groupLabel(template)
    groups.set(category, [...(groups.get(category) ?? []), template])
  }

  return [...groups].map(([category, templates]) => ({ category, templates }))
})

watch(categoryOptions, (options) => {
  if (activeCategoryKey.value === ALL_CATEGORY_KEY) return
  if (!options.some((option) => option.key === activeCategoryKey.value)) {
    activeCategoryKey.value = ALL_CATEGORY_KEY
  }
})

function setSourceFilter(source: TemplateSourceFilter): void {
  sourceFilter.value = source
  activeCategoryKey.value = ALL_CATEGORY_KEY
}

function setCategory(path: string[]): void {
  activeCategoryKey.value = path.length > 0 ? categoryKey(path) : ALL_CATEGORY_KEY
}

function groupLabel(template: TemplateEntry): string {
  if (template.source === 'personal') {
    return template.category.length > 0 ? template.category.join(' / ') : '我的'
  }

  return template.category[0] ?? '未分类'
}

function isSelected(id: string): boolean {
  return props.selectedIds.has(id)
}

function detailLevelFor(templateId: string): DetailLevel {
  return props.selectionDetailLevels.get(templateId) ?? detailDrafts.value[templateId] ?? 'brief'
}

function changeDetailLevel(templateId: string, detailLevel: DetailLevel): void {
  if (isSelected(templateId)) {
    emit('detailChange', templateId, detailLevel)
    return
  }

  detailDrafts.value = {
    ...detailDrafts.value,
    [templateId]: detailLevel
  }
}

function toggleTemplate(templateId: string): void {
  if (isSelected(templateId)) {
    emit('remove', templateId)
    return
  }

  emit('add', templateId, detailLevelFor(templateId))
}

function isNestedControl(event: Event): boolean {
  const target = event.target as HTMLElement | null
  const currentTarget = event.currentTarget as HTMLElement | null
  const nestedControl = target?.closest('button, select, input, textarea, a, [role="button"], [role="separator"]')
  return Boolean(nestedControl && nestedControl !== currentTarget)
}

function editFromCard(event: MouseEvent, templateId: string): void {
  if (isNestedControl(event)) return
  emit('edit', templateId)
}

function editFromKeyboard(event: KeyboardEvent, templateId: string): void {
  if (event.target !== event.currentTarget) return
  emit('edit', templateId)
}
</script>

<template>
  <section class="flex min-h-0 flex-col">
    <div class="panel-head">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="panel-title">模板库</h2>
        </div>
      </div>

      <div class="relative mt-5">
        <Search class="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <TextInput v-model="query" aria-label="搜索模板" input-class="pl-9" placeholder="搜索标题、分类、标签、复杂度、代码" />
      </div>

      <div class="segmented mt-3 grid grid-cols-3 text-xs">
        <button
          class="px-2 py-2"
          :class="sourceFilter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'"
          type="button"
          @click="setSourceFilter('all')"
        >
          全部
        </button>
        <button
          class="px-2 py-2"
          :class="sourceFilter === 'public' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'"
          type="button"
          @click="setSourceFilter('public')"
        >
          公共
        </button>
        <button
          class="px-2 py-2"
          :class="sourceFilter === 'personal' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'"
          type="button"
          @click="setSourceFilter('personal')"
        >
          我的
        </button>
      </div>

      <div class="category-filter mt-3" aria-label="分类筛选">
        <button
          class="category-filter__item"
          :class="{ active: activeCategoryKey === ALL_CATEGORY_KEY }"
          type="button"
          @click="setCategory([])"
        >
          <span>全部分类</span>
          <strong>{{ sourceQueryTemplates.length }}</strong>
        </button>
        <button
          v-for="option in categoryOptions"
          :key="option.key"
          class="category-filter__item"
          :class="{ active: activeCategoryKey === option.key }"
          :style="{ paddingLeft: `${0.65 + (option.depth - 1) * 0.75}rem` }"
          type="button"
          :title="option.label"
          @click="setCategory(option.path)"
        >
          <span>{{ option.label }}</span>
          <strong>{{ option.count }}</strong>
        </button>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-auto p-5">
      <div v-if="filteredGroups.length === 0" class="px-2 py-8 text-center text-sm text-muted-foreground">
        没有匹配的模板
      </div>

      <div v-for="group in filteredGroups" :key="group.category" class="mb-6">
        <div class="category-line mb-3">
          <h3>{{ group.category }}</h3>
          <span class="text-[11px] text-muted-foreground">{{ group.templates.length }}</span>
        </div>

        <div class="space-y-3">
          <article
            v-for="template in group.templates"
            :key="template.id"
            class="template-row p-4"
            :class="props.activeTemplateId === template.id ? 'shadow-[7px_7px_0_#050505]' : ''"
            tabindex="0"
            role="button"
            :aria-current="props.activeTemplateId === template.id ? 'true' : undefined"
            :aria-label="`编辑 ${template.title}`"
            @click="editFromCard($event, template.id)"
            @keydown.enter="editFromKeyboard($event, template.id)"
            @keydown.space.prevent="editFromKeyboard($event, template.id)"
          >
            <div class="grid gap-3">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h4 class="truncate text-base font-semibold">{{ template.title }}</h4>
                    <span
                      class="source-chip"
                      :data-source="template.source"
                    >
                      {{ template.source === 'public' ? '公共' : '我的' }}
                    </span>
                  </div>
                  <p class="mt-2 text-xs text-muted-foreground">{{ template.category.join(' / ') }}</p>
                  <p class="mt-1 text-xs text-muted-foreground">时间 {{ template.timeComplexity }}</p>
                </div>
                <div class="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="编辑模板"
                    @click.stop="emit('edit', template.id)"
                  >
                    <Edit3 class="h-4 w-4" />
                  </Button>
                  <Button
                    :variant="isSelected(template.id) ? 'secondary' : 'outline'"
                    size="icon"
                    :title="isSelected(template.id) ? '移出打印稿' : '加入打印稿'"
                    @click.stop="toggleTemplate(template.id)"
                  >
                    <X v-if="isSelected(template.id)" class="h-4 w-4" />
                    <Plus v-else class="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <FieldControl label="介绍详细度" dense>
                <select
                  class="select-control select-control--sm"
                  :aria-label="`${template.title} 介绍详细度`"
                  :value="detailLevelFor(template.id)"
                  @click.stop
                  @change.stop="changeDetailLevel(template.id, ($event.target as HTMLSelectElement).value as DetailLevel)"
                >
                  <option value="none">不显示介绍</option>
                  <option value="brief">简略介绍</option>
                  <option value="detail">详细介绍</option>
                </select>
              </FieldControl>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
