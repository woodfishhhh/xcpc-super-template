# Sample Template Contribution PR

This page shows the expected shape of a small public-template contribution.

## Pull Request Title

```text
template: add Dijkstra shortest path
```

## Pull Request Body

```markdown
## Summary

- Added `graph.shortest-path.dijkstra` under `板子/图论/最短路/`.
- Included `meta.json` with complexity, category, source, and GPL-3.0-compatible license.
- Included `code.md` with a C++ implementation wrapped in a Markdown code fence.

## Source And License

- Source name: Team original implementation
- Source URL: N/A
- License: GPL-3.0-only
- Notes: Written for this repository; no third-party code copied.

## Verification

- [x] `npm run validate:templates`
- [x] `npm test`
- [x] `npm run build`
- [ ] `npm run test:e2e`

## Template Checklist

- [x] New public templates include `meta.json` and `code.md`.
- [x] `category` matches the folder path under `板子/`.
- [x] `learningOrder` is inside the taxonomy range.
- [x] Time and space complexity are filled in.
- [x] Source and license are recorded.
```

## File Layout

```text
板子/
  图论/
    最短路/
      meta.json
      code.md
```

## `meta.json`

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
  "detail": "每次从优先队列中取出当前距离最小的点进行松弛。若图中存在负边权，应改用其他最短路算法。",
  "codeLanguage": "cpp",
  "source": {
    "name": "Team original implementation",
    "license": "GPL-3.0-only"
  },
  "updatedAt": "2026-06-11"
}
```

## `code.md`

````markdown
```cpp
using Edge = pair<int, int>;

vector<long long> dijkstra(int source, const vector<vector<Edge>> &graph) {
  const long long inf = 4e18;
  vector<long long> dist(graph.size(), inf);
  priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
  dist[source] = 0;
  pq.push({0, source});

  while (!pq.empty()) {
    auto [du, u] = pq.top();
    pq.pop();
    if (du != dist[u]) continue;
    for (auto [v, w] : graph[u]) {
      if (dist[v] > du + w) {
        dist[v] = du + w;
        pq.push({dist[v], v});
      }
    }
  }

  return dist;
}
```
````

## Source Rules

- Original code written for this repository can use `GPL-3.0-only`.
- Adapted code must keep a source URL and a compatible license in `source`.
- Do not submit templates copied from unknown, private, contest-only, or license-incompatible sources.
