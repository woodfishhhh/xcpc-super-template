import type { DetailLevel, PrintSelection } from '@/types/template'

export interface DraftPresetPack {
  id: 'freshman' | 'regional' | 'graph-boost' | 'math-boost'
  title: string
  category: string
  templateIds: string[]
  detailLevel: DetailLevel
}

export const draftPresetPacks: DraftPresetPack[] = [
  {
    id: 'freshman',
    title: '新生版',
    category: '基础算法 / 入门数据结构 / 字符串',
    detailLevel: 'brief',
    templateIds: [
      'basic.binary-search',
      'basic.prefix-difference',
      'basic.bfs-grid',
      'basic.dfs',
      'ds.dsu',
      'ds.fenwick',
      'string.kmp',
      'math.number-theory.extgcd',
      'misc.fast-io'
    ]
  },
  {
    id: 'regional',
    title: '区域赛版',
    category: '常用数据结构 / 图论 / 数学 / 字符串',
    detailLevel: 'brief',
    templateIds: [
      'misc.fast-io',
      'basic.binary-search',
      'basic.prefix-difference',
      'ds.dsu',
      'ds.fenwick',
      'ds.segment-tree',
      'ds.sparse-table',
      'ds.monotonic-queue',
      'graph.shortest-path.dijkstra',
      'graph.shortest-path.floyd',
      'graph.mst.kruskal',
      'graph.topological-sort',
      'graph.scc.tarjan',
      'graph.tree.lca-binary-lifting',
      'string.kmp',
      'string.rolling-hash',
      'string.trie',
      'math.number-theory.extgcd',
      'math.number-theory.linear-sieve',
      'math.combination.factorial',
      'math.matrix-power',
      'dp.knapsack.zero-one',
      'dp.lis',
      'flow.dinic'
    ]
  },
  {
    id: 'graph-boost',
    title: '图论强化版',
    category: '最短路 / 连通性 / 树上算法 / 网络流',
    detailLevel: 'brief',
    templateIds: [
      'ds.dsu',
      'graph.shortest-path.dijkstra',
      'graph.shortest-path.floyd',
      'graph.mst.kruskal',
      'graph.topological-sort',
      'graph.scc.tarjan',
      'graph.tree.lca-binary-lifting',
      'graph.bipartite.matching',
      'flow.dinic'
    ]
  },
  {
    id: 'math-boost',
    title: '数学强化版',
    category: '基础数论 / 筛法 / 组合 / 矩阵',
    detailLevel: 'brief',
    templateIds: [
      'basic.binary-search',
      'math.number-theory.extgcd',
      'math.number-theory.linear-sieve',
      'math.combination.factorial',
      'math.matrix-power',
      'dp.knapsack.zero-one',
      'dp.lis',
      'geometry.point-vector',
      'geometry.convex-hull'
    ]
  }
]

export function applyDraftPresetSelections(
  selections: PrintSelection[],
  preset: DraftPresetPack,
  availableTemplateIds: ReadonlySet<string>
): PrintSelection[] {
  const selectedIds = new Set(selections.map((selection) => selection.templateId))
  const additions = preset.templateIds
    .filter((templateId) => availableTemplateIds.has(templateId) && !selectedIds.has(templateId))
    .map((templateId) => ({
      templateId,
      detailLevel: preset.detailLevel
    }))

  return [...selections, ...additions]
}

export function getDraftPresetAddedCount(
  selections: PrintSelection[],
  preset: DraftPresetPack,
  availableTemplateIds: ReadonlySet<string>
): number {
  const selectedIds = new Set(selections.map((selection) => selection.templateId))
  return preset.templateIds.filter((templateId) => availableTemplateIds.has(templateId) && !selectedIds.has(templateId))
    .length
}
