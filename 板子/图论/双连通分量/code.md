```cpp
struct VertexBCC {
    int n, timer = 0;
    vector<vector<int>> g;
    vector<int> dfn, low;
    vector<pair<int, int>> stack_edges;
    vector<vector<int>> components;

    explicit VertexBCC(int n) : n(n), g(n), dfn(n), low(n) {}
    void add_edge(int u, int v) { g[u].push_back(v); g[v].push_back(u); }

    void dfs(int u, int parent = -1) {
        dfn[u] = low[u] = ++timer;
        for (int v : g[u]) {
            if (v == parent) continue;
            if (!dfn[v]) {
                stack_edges.push_back({u, v});
                dfs(v, u);
                low[u] = min(low[u], low[v]);
                if (low[v] >= dfn[u]) {
                    vector<int> comp;
                    while (true) {
                        auto e = stack_edges.back(); stack_edges.pop_back();
                        comp.push_back(e.first);
                        comp.push_back(e.second);
                        if (e.first == u && e.second == v) break;
                    }
                    sort(comp.begin(), comp.end());
                    comp.erase(unique(comp.begin(), comp.end()), comp.end());
                    components.push_back(comp);
                }
            } else if (dfn[v] < dfn[u]) {
                stack_edges.push_back({u, v});
                low[u] = min(low[u], dfn[v]);
            }
        }
    }
};
```
