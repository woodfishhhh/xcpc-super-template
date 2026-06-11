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

`meta.json` 必须符合 `板子/meta.schema.json`。其中 `category` 必须和 `板子/` 下的目录路径一致。

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
- `source` 必须记录来源和许可证。
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
