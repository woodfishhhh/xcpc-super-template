# Contributing

欢迎贡献超级板子。这个项目采用 GPL-3.0，公共模板和应用代码放在同一个仓库里。提交代码或模板前，请确认来源和许可证允许以 GPL-3.0 方式分发。

## 本地开发

```bash
npm install
npm run dev
```

常用验证：

```bash
npm run validate:templates
npm test
npm run build
npm run test:e2e
```

第一次运行 E2E 前可能需要安装浏览器：

```bash
npx playwright install chromium
```

## 公共模板结构

公共模板放在 `板子/` 下。每个最底层算法目录必须包含：

- `meta.json`
- `code.md`

示例：

```text
板子/
  图论/
    最短路/
      meta.json
      code.md
```

`meta.json` 必须符合 `板子/meta.schema.json`。其中 `category` 必须和 `板子/` 下的目录路径一致，`learningOrder` 必须落在 [`板子/TAXONOMY.md`](板子/TAXONOMY.md) 定义的顶级分类范围内。

示例：

```json
{
  "id": "graph.shortest-path.dijkstra",
  "title": "Dijkstra",
  "category": ["图论", "最短路"],
  "learningOrder": 220,
  "tags": ["graph", "shortest-path", "priority-queue"],
  "timeComplexity": "O(m log n)",
  "spaceComplexity": "O(n + m)",
  "brief": "用于非负边权图的单源最短路。",
  "detail": "每次从优先队列中取出当前距离最小的点进行松弛。",
  "codeLanguage": "cpp",
  "source": {
    "name": "XCPC Super Template sample",
    "license": "GPL-3.0-only"
  },
  "updatedAt": "2026-06-10"
}
```

`code.md` 使用 Markdown 代码块：

````markdown
```cpp
// code here
```
````

## 模板贡献要求

- `id` 使用小写英文、数字、点号或短横线，例如 `graph.shortest-path.dijkstra`。
- `learningOrder` 越小越靠前，默认按学习顺序排序。
- `brief` 适合打印在代码前的一句话。
- `detail` 写使用条件、关键注意事项、常见坑。
- `source` 必须记录来源和许可证；当前公共库只接受 `GPL-3.0-only`。
- 不提交来源不明、许可证不兼容的代码。

提交前运行：

```bash
npm run validate:templates
```

## Pull Request

PR 请尽量保持主题单一：

- UI/交互改动附上验证方式。
- PDF 或导出改动说明测试样本。
- 公共模板改动说明来源和许可证。
- 新增脚本或 schema 改动同步更新 README/文档。

CI 会运行模板校验、单元测试、构建、E2E 和 high severity audit。

## 来源与 GPL-3.0

公共模板会随仓库一起以 GPL-3.0 分发。提交模板时请按下面规则处理来源：

- 自己为本仓库原创的代码，`source.name` 写清楚来源，例如 `Team original implementation`，`source.license` 写 `GPL-3.0-only`。
- 从外部 GPL-3.0 兼容项目改写的代码，必须保留原始链接、项目名和许可证。
- 参考题解、博客或队内私有代码重新实现时，请确认原文允许复用；不确定时不要提交到公共库。
- 不接受来源不明、仅供比赛现场内部使用、禁止转载或许可证不兼容的模板。
- 如果模板来自第三方，PR 描述里也要写出 source URL 和 license，方便审查。

## 样例 PR

新增公共模板前可以参考 [`docs/SAMPLE_TEMPLATE_PR.md`](docs/SAMPLE_TEMPLATE_PR.md)。它展示了推荐的 PR 标题、说明、`meta.json`、`code.md` 和验证清单。
