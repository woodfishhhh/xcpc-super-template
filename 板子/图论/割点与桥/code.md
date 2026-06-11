```cpp
struct BridgesCuts {
    int n, timer = 0;
    vector<vector<pair<int, int>>> g;
    vector<int> dfn, low, is_cut;
    vector<pair<int, int>> bridges;

    explicit BridgesCuts(int n) : n(n), g(n), dfn(n), low(n), is_cut(n) {}
    void add_edge(int u, int v, int id) { g[u].push_back({v, id}); g[v].push_back({u, id}); }

    void dfs(int u, int parent_edge = -1) {
        dfn[u] = low[u] = ++timer;
        int child = 0;
        for (auto [v, id] : g[u]) {
            if (id == parent_edge) continue;
            if (!dfn[v]) {
                ++child;
                dfs(v, id);
                low[u] = min(low[u], low[v]);
                if (low[v] > dfn[u]) bridges.push_back({u, v});
                if (parent_edge != -1 && low[v] >= dfn[u]) is_cut[u] = 1;
            } else {
                low[u] = min(low[u], dfn[v]);
            }
        }
        if (parent_edge == -1 && child > 1) is_cut[u] = 1;
    }
};
```
