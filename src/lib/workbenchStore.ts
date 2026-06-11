import type { DetailLevel, OutputMode, PrintConfig, PrintLayout, PrintSelection, SortMode } from '@/types/template'

export const WORKBENCH_STORAGE_KEY = 'xcpc-super-template.workbench.v1'

export type DraftDensity = 'compact' | 'comfortable' | 'large'

export interface WorkbenchState {
  schemaVersion: 1
  activeTemplateId: string
  config: PrintConfig
  draftDensity: DraftDensity
  selections: PrintSelection[]
  savedAt: string
}

const detailLevels = new Set<DetailLevel>(['none', 'brief', 'detail'])
const sortModes = new Set<SortMode>(['learning', 'alphabetical', 'manual'])
const layouts = new Set<PrintLayout>(['compact', 'book'])
const outputModes = new Set<OutputMode>(['markdown', 'pdf', 'both'])
const densities = new Set<DraftDensity>(['compact', 'comfortable', 'large'])

export function loadWorkbenchState(fallbackConfig: PrintConfig): WorkbenchState | null {
  const storage = getStorage()
  if (!storage) return null

  try {
    const raw = storage.getItem(WORKBENCH_STORAGE_KEY)
    if (!raw) return null
    return normalizeWorkbenchState(JSON.parse(raw), fallbackConfig)
  } catch {
    return null
  }
}

export function saveWorkbenchState(state: Omit<WorkbenchState, 'schemaVersion' | 'savedAt'>): void {
  const storage = getStorage()
  if (!storage) return

  const payload: WorkbenchState = {
    ...state,
    schemaVersion: 1,
    savedAt: new Date().toISOString()
  }

  storage.setItem(WORKBENCH_STORAGE_KEY, JSON.stringify(payload))
}

export function normalizeWorkbenchState(value: unknown, fallbackConfig: PrintConfig): WorkbenchState | null {
  if (!isRecord(value)) return null
  if (value.schemaVersion !== 1) return null

  const config = normalizeConfig(value.config, fallbackConfig)
  const selections = Array.isArray(value.selections)
    ? value.selections.flatMap((selection): PrintSelection[] => {
        if (!isRecord(selection)) return []
        if (typeof selection.templateId !== 'string' || !detailLevels.has(selection.detailLevel as DetailLevel)) {
          return []
        }
        return [{ templateId: selection.templateId, detailLevel: selection.detailLevel as DetailLevel }]
      })
    : []

  return {
    schemaVersion: 1,
    activeTemplateId: typeof value.activeTemplateId === 'string' ? value.activeTemplateId : '',
    config,
    draftDensity: densities.has(value.draftDensity as DraftDensity) ? (value.draftDensity as DraftDensity) : 'comfortable',
    selections,
    savedAt: typeof value.savedAt === 'string' ? value.savedAt : ''
  }
}

function normalizeConfig(value: unknown, fallback: PrintConfig): PrintConfig {
  if (!isRecord(value)) return { ...fallback }

  return {
    title: typeof value.title === 'string' && value.title.trim() ? value.title : fallback.title,
    includeToc: typeof value.includeToc === 'boolean' ? value.includeToc : fallback.includeToc,
    tocDepth: value.tocDepth === 1 || value.tocDepth === 2 ? value.tocDepth : fallback.tocDepth,
    layout: layouts.has(value.layout as PrintLayout) ? (value.layout as PrintLayout) : fallback.layout,
    output: outputModes.has(value.output as OutputMode) ? (value.output as OutputMode) : fallback.output,
    sortMode: sortModes.has(value.sortMode as SortMode) ? (value.sortMode as SortMode) : fallback.sortMode
  }
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
