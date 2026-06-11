```cpp
struct EulerUndirected {
    int n, edge_count = 0;
    vector<vector<pair<int, int>>> g;
    vector<int> used, iter, path;

    explicit EulerUndirected(int n) : n(n), g(n), iter(n) {}
    void add_edge(int u, int v) {
        g[u].push_back({v, edge_count});
        g[v].push_back({u, edge_count});
        used.push_back(0);
        ++edge_count;
    }

    void dfs(int u) {
        while (iter[u] < (int)g[u].size()) {
            auto [v, id] = g[u][iter[u]++];
            if (used[id]) continue;
            used[id] = 1;
            dfs(v);
        }
        path.push_back(u);
    }

    vector<int> get_path(int start) {
        dfs(start);
        reverse(path.begin(), path.end());
        if ((int)path.size() != edge_count + 1) return {};
        return path;
    }
};
```
