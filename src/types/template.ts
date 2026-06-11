export type TemplateSource = 'public' | 'personal'

export type DetailLevel = 'none' | 'brief' | 'detail'

export type SortMode = 'learning' | 'alphabetical' | 'manual'

export type PrintLayout = 'compact' | 'book'

export type OutputMode = 'markdown' | 'pdf' | 'both'

export interface TemplateMeta {
  id: string
  title: string
  category: readonly string[]
  learningOrder: number
  tags: readonly string[]
  timeComplexity: string
  spaceComplexity: string
  brief: string
  detail: string
  codeLanguage: string
  source?: {
    name: string
    url?: string
    license?: string
  }
  updatedAt?: string
}

export interface TemplateEntry extends Omit<TemplateMeta, 'source'> {
  code: string
  source: TemplateSource
  origin?: TemplateMeta['source']
}

export interface PrintSelection {
  templateId: string
  detailLevel: DetailLevel
}

export interface PrintConfig {
  title: string
  includeToc: boolean
  tocDepth: 1 | 2
  layout: PrintLayout
  output: OutputMode
  sortMode: SortMode
}

export interface PersonalLibraryExport {
  schemaVersion: 1
  exportedAt: string
  templates: TemplateEntry[]
}

export type MoveDirection = 'up' | 'down' | 'top' | 'bottom'
