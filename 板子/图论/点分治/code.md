```cpp
struct CentroidDecomposition {
    int n;
    vector<vector<int>> g;
    vector<int> size, removed, parent;

    explicit CentroidDecomposition(int n) : n(n), g(n), size(n), removed(n), parent(n, -1) {}
    void add_edge(int u, int v) { g[u].push_back(v); g[v].push_back(u); }

    int calc_size(int u, int p) {
        size[u] = 1;
        for (int v : g[u]) if (v != p && !removed[v]) size[u] += calc_size(v, u);
        return size[u];
    }

    int find_centroid(int u, int p, int total) {
        for (int v : g[u]) if (v != p && !removed[v] && size[v] * 2 > total) {
            return find_centroid(v, u, total);
        }
        return u;
    }

    void build(int entry = 0, int p = -1) {
        int total = calc_size(entry, -1);
        int c = find_centroid(entry, -1, total);
        parent[c] = p;
        removed[c] = 1;
        for (int v : g[c]) if (!removed[v]) build(v, c);
    }
};
```
