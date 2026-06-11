import { describe, expect, it } from 'vitest'
import { validateTemplatePackages } from '@/lib/templateValidation'
import type { TemplateMeta } from '@/types/template'

const baseMeta: TemplateMeta = {
  id: 'graph.shortest-path.dijkstra',
  title: 'Dijkstra',
  category: ['图论', '最短路'],
  learningOrder: 220,
  tags: ['graph', 'shortest-path'],
  timeComplexity: 'O(m log n)',
  spaceComplexity: 'O(n + m)',
  brief: '用于非负边权图的单源最短路。',
  detail: '每次从优先队列中取出当前距离最小的点进行松弛。',
  codeLanguage: 'cpp',
  source: {
    name: 'XCPC Super Template sample',
    license: 'GPL-3.0-only'
  },
  updatedAt: '2026-06-10'
}

describe('template package validation', () => {
  it('accepts complete template packages', () => {
    const result = validateTemplatePackages([
      {
        directory: '板子/图论/最短路',
        meta: baseMeta,
        code: '```cpp\nvoid dijkstra();\n```'
      }
    ])

    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('reports duplicate ids, category mismatches, and empty code', () => {
    const result = validateTemplatePackages([
      {
        directory: '板子/图论/最短路',
        meta: baseMeta,
        code: '```cpp\nvoid dijkstra();\n```'
      },
      {
        directory: '板子/数据结构/树状数组',
        meta: {
          ...baseMeta,
          title: '树状数组',
          category: ['图论', '最短路']
        },
        code: ''
      }
    ])

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('duplicate id'),
        expect.stringContaining('category path'),
        expect.stringContaining('code.md is empty')
      ])
    )
  })
})
