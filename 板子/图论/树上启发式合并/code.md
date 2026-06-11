```cpp
struct DSUOnTree {
    int n;
    vector<vector<int>> g;
    vector<int> color, size, heavy, answer, cnt;
    int best = 0;

    DSUOnTree(int n, int color_count) : n(n), g(n), color(n), size(n), heavy(n, -1), answer(n), cnt(color_count) {}
    void add_edge(int u, int v) { g[u].push_back(v); g[v].push_back(u); }

    void dfs_size(int u, int p) {
        size[u] = 1;
        for (int v : g[u]) if (v != p) {
            dfs_size(v, u);
            size[u] += size[v];
            if (heavy[u] == -1 || size[v] > size[heavy[u]]) heavy[u] = v;
        }
    }

    void add_subtree(int u, int p, int delta) {
        cnt[color[u]] += delta;
        if (delta > 0) best = max(best, cnt[color[u]]);
        for (int v : g[u]) if (v != p) add_subtree(v, u, delta);
    }

    void solve(int u, int p, bool keep) {
        for (int v : g[u]) if (v != p && v != heavy[u]) solve(v, u, false);
        if (heavy[u] != -1) solve(heavy[u], u, true);
        cnt[color[u]]++;
        best = max(best, cnt[color[u]]);
        for (int v : g[u]) if (v != p && v != heavy[u]) add_subtree(v, u, +1);
        answer[u] = best;
        if (!keep) {
            add_subtree(u, p, -1);
            best = 0;
        }
    }
};
```
