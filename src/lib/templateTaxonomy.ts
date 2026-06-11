export interface TemplateCategoryBand {
  name: string
  range: readonly [number, number]
  description: string
}

export const templateCategoryBands = [
  { name: '基础算法', range: [1, 99], description: '排序、二分、搜索、贪心等入门基础。' },
  { name: '数据结构', range: [100, 199], description: '并查集、树状数组、线段树、RMQ 等常用结构。' },
  { name: '图论', range: [200, 299], description: '最短路、生成树、连通性、拓扑序、匹配等图算法。' },
  { name: '字符串', range: [300, 399], description: '字符串匹配、哈希、自动机、后缀结构等。' },
  { name: '数学与数论', range: [400, 499], description: 'gcd、逆元、组合数、筛法、矩阵等。' },
  { name: '动态规划', range: [500, 599], description: '背包、区间、树形、数位、状态压缩等。' },
  { name: '几何', range: [600, 699], description: '二维几何、凸包、半平面、最近点对等。' },
  { name: '网络流', range: [700, 799], description: '最大流、最小割、费用流、匹配建模等。' },
  { name: '杂项', range: [900, 999], description: '随机化、调试、输入输出、工程辅助模板。' }
] as const satisfies readonly TemplateCategoryBand[]

export const templateTopCategories = templateCategoryBands.map((category) => category.name)

export function getCategoryBand(topCategory: string): TemplateCategoryBand | undefined {
  return templateCategoryBands.find((category) => category.name === topCategory)
}

export function isLearningOrderInBand(topCategory: string, learningOrder: number): boolean {
  const band = getCategoryBand(topCategory)
  if (!band) return false
  const [min, max] = band.range
  return learningOrder >= min && learningOrder <= max
}
