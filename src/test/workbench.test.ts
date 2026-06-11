import { describe, expect, it } from 'vitest'
import type { PrintConfig, PrintSelection, TemplateEntry } from '@/types/template'
import {
  exportPersonalLibrary,
  exportSingleTemplate,
  importPersonalLibrary,
  importPersonalLibraryWithReport
} from '@/lib/importExport'
import { generateMarkdown } from '@/lib/markdown'
import { inspectDraftComposition } from '@/lib/draftChecks'
import { normalizeEditorDraftState } from '@/lib/editorDraftStore'
import { stripCodeFence } from '@/lib/code'
import {
  buildTemplateCategoryOptions,
  cloneTemplateAsPersonal,
  filterTemplatesForLibrary,
  moveSelectionChapter,
  mergeTemplateOverrides,
  moveSelection,
  sortTemplates
} from '@/lib/templates'
import { normalizeWorkbenchState } from '@/lib/workbenchStore'

const templates: TemplateEntry[] = [
  {
    id: 'graph.dijkstra',
    title: 'Dijkstra',
    category: ['图论', '最短路'],
    learningOrder: 220,
    tags: ['graph'],
    timeComplexity: 'O(m log n)',
    spaceComplexity: 'O(n + m)',
    brief: '单源最短路。',
    detail: '适用于非负边权图的单源最短路，常用优先队列优化。',
    codeLanguage: 'cpp',
    code: '```cpp\nvoid dijkstra();\n```',
    source: 'public'
  },
  {
    id: 'graph.bipartite',
    title: '二分图匹配',
    category: ['图论', '二分图'],
    learningOrder: 210,
    tags: ['matching'],
    timeComplexity: 'O(nm)',
    spaceComplexity: 'O(n + m)',
    brief: '寻找二分图最大匹配。',
    detail: '可用于配对、覆盖与分配问题。',
    codeLanguage: 'cpp',
    code: '```cpp\nint match();\n```',
    source: 'public'
  }
]

const config: PrintConfig = {
  title: 'ICPC 打印稿',
  includeToc: true,
  tocDepth: 2,
  layout: 'compact',
  output: 'both',
  sortMode: 'learning'
}

describe('workbench document model', () => {
  it('sorts templates by learning order and title', () => {
    expect(sortTemplates(templates, 'learning').map((item) => item.id)).toEqual([
      'graph.bipartite',
      'graph.dijkstra'
    ])
    expect(sortTemplates(templates, 'alphabetical').map((item) => item.title)).toEqual([
      'Dijkstra',
      '二分图匹配'
    ])
  })

  it('moves selected entries with keyboard controls', () => {
    const selections: PrintSelection[] = [
      { templateId: 'a', detailLevel: 'brief' },
      { templateId: 'b', detailLevel: 'detail' },
      { templateId: 'c', detailLevel: 'none' }
    ]

    expect(moveSelection(selections, 'b', 'up').map((item) => item.templateId)).toEqual([
      'b',
      'a',
      'c'
    ])
    expect(moveSelection(selections, 'b', 'bottom').map((item) => item.templateId)).toEqual([
      'a',
      'c',
      'b'
    ])
  })

  it('moves whole draft chapters while preserving item order inside each chapter', () => {
    const chapterTemplates: TemplateEntry[] = [
      templates[0],
      templates[1],
      {
        ...templates[0],
        id: 'string.kmp',
        title: 'KMP',
        category: ['字符串', '字符串匹配']
      },
      {
        ...templates[0],
        id: 'math.comb',
        title: '组合数',
        category: ['数学与数论', '组合数']
      }
    ]
    const selections: PrintSelection[] = [
      { templateId: 'graph.dijkstra', detailLevel: 'brief' },
      { templateId: 'string.kmp', detailLevel: 'brief' },
      { templateId: 'graph.bipartite', detailLevel: 'detail' },
      { templateId: 'math.comb', detailLevel: 'none' }
    ]

    expect(
      moveSelectionChapter(chapterTemplates, selections, '图论', 'down').map((item) => item.templateId)
    ).toEqual(['string.kmp', 'graph.dijkstra', 'graph.bipartite', 'math.comb'])

    expect(
      moveSelectionChapter(chapterTemplates, selections, '数学与数论', 'top').map((item) => item.templateId)
    ).toEqual(['math.comb', 'graph.dijkstra', 'graph.bipartite', 'string.kmp'])
  })

  it('generates markdown with title, toc, complexity, selected detail and code', () => {
    const markdown = generateMarkdown(config, templates, [
      { templateId: 'graph.bipartite', detailLevel: 'brief' },
      { templateId: 'graph.dijkstra', detailLevel: 'detail' }
    ])

    expect(markdown).toContain('# ICPC 打印稿')
    expect(markdown).toContain('## 目录')
    expect(markdown).toContain('- [图论](#图论)')
    expect(markdown).toContain('### 二分图匹配')
    expect(markdown).toContain('时间复杂度：`O(nm)`')
    expect(markdown).toContain('寻找二分图最大匹配。')
    expect(markdown).toContain('适用于非负边权图的单源最短路')
    expect(markdown).toContain('```cpp')
    expect(markdown).not.toContain('```cpp\n```cpp')
  })

  it('round-trips personal library JSON and resolves id conflicts', () => {
    const exported = exportPersonalLibrary([templates[0]])
    const report = importPersonalLibraryWithReport(exported, new Set(['graph.dijkstra']))
    const imported = importPersonalLibrary(exported, new Set(['graph.dijkstra']))

    expect(report.ok).toBe(true)
    expect(report.importedCount).toBe(1)
    expect(report.renamedCount).toBe(1)
    expect(imported).toHaveLength(1)
    expect(imported[0]?.id).not.toBe('graph.dijkstra')
    expect(imported[0]?.title).toBe('Dijkstra')
    expect(imported[0]?.source).toBe('personal')
    expect(imported[0]?.code).toBe('void dijkstra();')
  })

  it('round-trips a single template JSON and resolves id conflicts through the import entrypoint', () => {
    const exported = exportSingleTemplate(templates[0])
    const payload = JSON.parse(exported) as { template?: TemplateEntry; templates?: TemplateEntry[] }
    const report = importPersonalLibraryWithReport(exported, new Set(['graph.dijkstra']))

    expect(payload.template?.title).toBe('Dijkstra')
    expect(payload.templates).toBeUndefined()
    expect(report.ok).toBe(true)
    expect(report.importedCount).toBe(1)
    expect(report.renamedCount).toBe(1)
    expect(report.templates[0]?.id).not.toBe('graph.dijkstra')
    expect(report.templates[0]?.source).toBe('personal')
    expect(report.templates[0]?.code).toBe('void dijkstra();')
  })

  it('rejects bad personal library JSON without producing imported templates', () => {
    const brokenSyntax = importPersonalLibraryWithReport('{ broken', new Set(['graph.dijkstra']))
    const brokenShape = importPersonalLibraryWithReport('{"templates":[{"id":""}]}', new Set())

    expect(brokenSyntax.ok).toBe(false)
    expect(brokenSyntax.templates).toEqual([])
    expect(brokenSyntax.importedCount).toBe(0)
    expect(brokenSyntax.renamedCount).toBe(0)
    expect(brokenSyntax.errors).toEqual(['个人模板 JSON 无法解析'])

    expect(brokenShape.ok).toBe(false)
    expect(brokenShape.templates).toEqual([])
    expect(brokenShape.errors).toEqual(['个人模板 JSON 格式不正确'])
  })

  it('normalizes markdown fenced code for editor storage', () => {
    expect(stripCodeFence('```cpp\nint main();\n```')).toBe('int main();')
    expect(stripCodeFence('int main();')).toBe('int main();')
  })

  it('uses personal edits as public template overrides without duplicating library rows', () => {
    const override: TemplateEntry = {
      ...templates[0],
      title: 'Dijkstra 队内版',
      brief: '队内改过的默认模板。',
      source: 'personal'
    }

    const merged = mergeTemplateOverrides(templates, [override])

    expect(merged).toHaveLength(2)
    expect(merged.find((item) => item.id === 'graph.dijkstra')?.title).toBe('Dijkstra 队内版')
    expect(merged.find((item) => item.id === 'graph.dijkstra')?.source).toBe('personal')
  })

  it('copies a public template into a standalone personal template draft', () => {
    const copy = cloneTemplateAsPersonal(templates[0], new Set(['graph.dijkstra']))

    expect(copy.id).not.toBe('graph.dijkstra')
    expect(copy.id).toMatch(/^personal\./)
    expect(copy.title).toBe('Dijkstra 副本')
    expect(copy.category).toEqual(['个人模板', '图论', '最短路'])
    expect(copy.source).toBe('personal')
    expect(copy.code).toBe('void dijkstra();')
  })

  it('builds folder-style category filters and filters by category prefix', () => {
    const personalTemplates: TemplateEntry[] = [
      {
        ...templates[0],
        id: 'personal.flow.dinic',
        title: 'Dinic 队内版',
        category: ['个人模板', '图论', '网络流'],
        code: 'int dinic();',
        source: 'personal'
      },
      {
        ...templates[1],
        id: 'personal.math.extgcd',
        title: 'exgcd 队内版',
        category: ['个人模板', '数学'],
        code: 'long long exgcd();',
        source: 'personal'
      }
    ]

    const options = buildTemplateCategoryOptions(personalTemplates, 'personal')
    expect(options.map((option) => `${option.label}:${option.count}`)).toEqual([
      '个人模板:2',
      '个人模板 / 图论:1',
      '个人模板 / 图论 / 网络流:1',
      '个人模板 / 数学:1'
    ])

    expect(
      filterTemplatesForLibrary(personalTemplates, {
        source: 'personal',
        categoryPath: ['个人模板', '图论']
      }).map((template) => template.title)
    ).toEqual(['Dinic 队内版'])
  })

  it('searches title, category, tags, complexity, and code content', () => {
    expect(filterTemplatesForLibrary(templates, { query: 'match' }).map((item) => item.id)).toEqual([
      'graph.bipartite'
    ])
    expect(filterTemplatesForLibrary(templates, { query: 'priority_queue' })).toEqual([])
    expect(
      filterTemplatesForLibrary(
        [
          ...templates,
          {
            ...templates[0],
            id: 'personal.heap-dijkstra',
            title: '堆优化最短路',
            code: 'priority_queue<pair<int, int>> pq;',
            source: 'personal'
          }
        ],
        { query: 'priority_queue' }
      ).map((item) => item.id)
    ).toEqual(['personal.heap-dijkstra'])
  })

  it('normalizes persisted workbench state before restoring it', () => {
    const saved = normalizeWorkbenchState(
      {
        schemaVersion: 1,
        activeTemplateId: 'graph.dijkstra',
        draftDensity: 'large',
        config: {
          ...config,
          output: 'pdf',
          tocDepth: 3
        },
        selections: [
          { templateId: 'graph.dijkstra', detailLevel: 'detail' },
          { templateId: 'broken', detailLevel: 'huge' }
        ],
        savedAt: '2026-06-10T00:00:00.000Z'
      },
      config
    )

    expect(saved?.activeTemplateId).toBe('graph.dijkstra')
    expect(saved?.draftDensity).toBe('large')
    expect(saved?.config.output).toBe('pdf')
    expect(saved?.config.tocDepth).toBe(2)
    expect(saved?.selections).toEqual([{ templateId: 'graph.dijkstra', detailLevel: 'detail' }])
  })

  it('normalizes editor autosave drafts and drops malformed entries', () => {
    const normalized = normalizeEditorDraftState({
      schemaVersion: 1,
      drafts: [
        {
          templateId: 'graph.dijkstra',
          savedAt: '2026-06-11T00:00:00.000Z',
          draft: {
            id: 'graph.dijkstra',
            title: 'Dijkstra 草稿版',
            categoryPath: '图论/最短路',
            timeComplexity: 'O(m log n)',
            spaceComplexity: 'O(n + m)',
            brief: '改过的简略介绍',
            detail: '改过的详细介绍',
            codeLanguage: 'cpp',
            code: '```cpp\nvoid draft();\n```'
          }
        },
        {
          templateId: '',
          savedAt: '2026-06-11T00:00:00.000Z',
          draft: { title: '' }
        }
      ]
    })

    expect(normalized?.drafts).toHaveLength(1)
    expect(normalized?.drafts[0]?.templateId).toBe('graph.dijkstra')
    expect(normalized?.drafts[0]?.draft.title).toBe('Dijkstra 草稿版')
    expect(normalized?.drafts[0]?.draft.code).toBe('void draft();')
  })

  it('reports generate-before draft issues for empty code, duplicate templates, missing complexity, and long code', () => {
    const report = inspectDraftComposition(
      [
        {
          ...templates[0],
          id: 'broken.empty-code',
          title: '空代码模板',
          timeComplexity: '未注明',
          code: '```cpp\n```'
        },
        {
          ...templates[1],
          id: 'heavy.long-code',
          title: '超长代码模板',
          code: Array.from({ length: 220 }, (_, index) => `int line_${index};`).join('\n')
        }
      ],
      [
        { templateId: 'broken.empty-code', detailLevel: 'brief' },
        { templateId: 'broken.empty-code', detailLevel: 'detail' },
        { templateId: 'missing.template', detailLevel: 'brief' },
        { templateId: 'heavy.long-code', detailLevel: 'none' }
      ]
    )

    expect(report.errorCount).toBe(3)
    expect(report.warningCount).toBe(2)
    expect(report.issues.map((issue) => issue.code)).toEqual([
      'duplicate-template',
      'missing-template',
      'empty-code',
      'missing-complexity',
      'long-code'
    ])
  })
})
