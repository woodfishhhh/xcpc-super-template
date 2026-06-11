import { stripCodeFence } from '@/lib/code'

export const EDITOR_DRAFT_STORAGE_KEY = 'xcpc-super-template.editor-drafts.v1'
export const NEW_TEMPLATE_DRAFT_ID = '__new-template__'

export interface EditorTemplateDraft {
  id?: string
  title: string
  categoryPath: string
  timeComplexity: string
  spaceComplexity: string
  brief: string
  detail: string
  codeLanguage: string
  code: string
}

export interface EditorDraftEntry {
  templateId: string
  draft: EditorTemplateDraft
  savedAt: string
}

export interface EditorDraftState {
  schemaVersion: 1
  drafts: EditorDraftEntry[]
}

export function getEditorDraftKey(templateId: string | undefined): string {
  return templateId?.trim() || NEW_TEMPLATE_DRAFT_ID
}

export function loadEditorDraft(templateId: string | undefined): EditorDraftEntry | null {
  const state = loadEditorDraftState()
  const draftKey = getEditorDraftKey(templateId)
  return state?.drafts.find((entry) => entry.templateId === draftKey) ?? null
}

export function saveEditorDraft(templateId: string | undefined, draft: EditorTemplateDraft): void {
  const storage = getStorage()
  if (!storage) return

  const draftKey = getEditorDraftKey(templateId)
  const current = loadEditorDraftState() ?? { schemaVersion: 1 as const, drafts: [] }
  const entry: EditorDraftEntry = {
    templateId: draftKey,
    draft: normalizeEditorTemplateDraft(draft),
    savedAt: new Date().toISOString()
  }

  storage.setItem(
    EDITOR_DRAFT_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: 1,
      drafts: [entry, ...current.drafts.filter((item) => item.templateId !== draftKey)]
    } satisfies EditorDraftState)
  )
}

export function deleteEditorDraft(templateId: string | undefined): void {
  const storage = getStorage()
  if (!storage) return

  const draftKey = getEditorDraftKey(templateId)
  const current = loadEditorDraftState()
  if (!current) return

  const drafts = current.drafts.filter((entry) => entry.templateId !== draftKey)
  if (drafts.length === 0) {
    storage.removeItem(EDITOR_DRAFT_STORAGE_KEY)
    return
  }

  storage.setItem(
    EDITOR_DRAFT_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: 1,
      drafts
    } satisfies EditorDraftState)
  )
}

export function normalizeEditorDraftState(value: unknown): EditorDraftState | null {
  if (!isRecord(value)) return null
  if (value.schemaVersion !== 1) return null
  if (!Array.isArray(value.drafts)) return { schemaVersion: 1, drafts: [] }

  const usedIds = new Set<string>()
  const drafts = value.drafts.flatMap((entry): EditorDraftEntry[] => {
    if (!isRecord(entry)) return []
    if (typeof entry.templateId !== 'string' || !entry.templateId.trim()) return []
    if (!isRecord(entry.draft)) return []

    const templateId = getEditorDraftKey(entry.templateId)
    if (usedIds.has(templateId)) return []
    usedIds.add(templateId)

    return [
      {
        templateId,
        draft: normalizeEditorTemplateDraft(entry.draft),
        savedAt: typeof entry.savedAt === 'string' ? entry.savedAt : ''
      }
    ]
  })

  return { schemaVersion: 1, drafts }
}

function loadEditorDraftState(): EditorDraftState | null {
  const storage = getStorage()
  if (!storage) return null

  try {
    const raw = storage.getItem(EDITOR_DRAFT_STORAGE_KEY)
    if (!raw) return null
    return normalizeEditorDraftState(JSON.parse(raw))
  } catch {
    return null
  }
}

function normalizeEditorTemplateDraft(value: unknown): EditorTemplateDraft {
  const draft = isRecord(value) ? value : {}

  return {
    id: typeof draft.id === 'string' && draft.id.trim() ? draft.id : undefined,
    title: typeof draft.title === 'string' ? draft.title : '',
    categoryPath: typeof draft.categoryPath === 'string' && draft.categoryPath.trim()
      ? draft.categoryPath
      : '个人模板',
    timeComplexity: typeof draft.timeComplexity === 'string' && draft.timeComplexity.trim()
      ? draft.timeComplexity
      : '未注明',
    spaceComplexity: typeof draft.spaceComplexity === 'string' && draft.spaceComplexity.trim()
      ? draft.spaceComplexity
      : '未注明',
    brief: typeof draft.brief === 'string' ? draft.brief : '',
    detail: typeof draft.detail === 'string' ? draft.detail : '',
    codeLanguage: typeof draft.codeLanguage === 'string' && draft.codeLanguage.trim()
      ? draft.codeLanguage
      : 'cpp',
    code: stripCodeFence(typeof draft.code === 'string' ? draft.code : '')
  }
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
