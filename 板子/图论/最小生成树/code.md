```cpp
struct Edge {
    int u, v;
    long long w;
    bool operator<(const Edge &other) const {
        return w < other.w;
    }
};

long long kruskal(int n, vector<Edge> edges) {
    sort(edges.begin(), edges.end());
    DSU dsu(n);
    long long total = 0;
    int picked = 0;
    for (auto [u, v, w] : edges) {
        if (dsu.unite(u, v)) {
            total += w;
            ++picked;
        }
    }
    return picked == n - 1 ? total : -1;
}
```
