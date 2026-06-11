```cpp
struct LCA {
    int n, lg;
    vector<int> depth;
    vector<vector<int>> up, g;

    LCA(int n) : n(n), lg(1), g(n) {
        while ((1 << lg) <= n) ++lg;
        depth.assign(n, 0);
        up.assign(lg, vector<int>(n, 0));
    }

    void add_edge(int u, int v) {
        g[u].push_back(v);
        g[v].push_back(u);
    }

    void build(int root = 0) { dfs(root, root); }

    void dfs(int u, int p) {
        up[0][u] = p;
        for (int k = 1; k < lg; ++k) up[k][u] = up[k - 1][up[k - 1][u]];
        for (int v : g[u]) if (v != p) {
            depth[v] = depth[u] + 1;
            dfs(v, u);
        }
    }

    int query(int a, int b) const {
        if (depth[a] < depth[b]) swap(a, b);
        int diff = depth[a] - depth[b];
        for (int k = 0; k < lg; ++k) if (diff >> k & 1) a = up[k][a];
        if (a == b) return a;
        for (int k = lg - 1; k >= 0; --k) {
            if (up[k][a] != up[k][b]) {
                a = up[k][a];
                b = up[k][b];
            }
        }
        return up[0][a];
    }
};
```
