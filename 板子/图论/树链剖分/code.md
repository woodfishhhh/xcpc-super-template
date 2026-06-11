```cpp
struct HLD {
    int n, timer = 0;
    vector<vector<int>> g;
    vector<int> parent, depth, heavy, size, head, pos;

    explicit HLD(int n) : n(n), g(n), parent(n, -1), depth(n), heavy(n, -1), size(n), head(n), pos(n) {}
    void add_edge(int u, int v) { g[u].push_back(v); g[v].push_back(u); }

    int dfs_size(int u) {
        size[u] = 1;
        int best = 0;
        for (int v : g[u]) if (v != parent[u]) {
            parent[v] = u;
            depth[v] = depth[u] + 1;
            int sub = dfs_size(v);
            size[u] += sub;
            if (sub > best) best = sub, heavy[u] = v;
        }
        return size[u];
    }

    void dfs_decompose(int u, int h) {
        head[u] = h;
        pos[u] = timer++;
        if (heavy[u] != -1) dfs_decompose(heavy[u], h);
        for (int v : g[u]) if (v != parent[u] && v != heavy[u]) dfs_decompose(v, v);
    }

    void build(int root = 0) { dfs_size(root); dfs_decompose(root, root); }

    template <class F>
    void for_path(int u, int v, F apply) const {
        while (head[u] != head[v]) {
            if (depth[head[u]] < depth[head[v]]) swap(u, v);
            apply(pos[head[u]], pos[u] + 1);
            u = parent[head[u]];
        }
        if (depth[u] > depth[v]) swap(u, v);
        apply(pos[u], pos[v] + 1);
    }
};
```
