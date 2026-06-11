```cpp
struct Edge { int u, v; long long w; };

pair<vector<long long>, bool> bellman_ford(int n, int s, const vector<Edge> &edges) {
    const long long INF = (1LL << 62);
    vector<long long> dist(n, INF);
    dist[s] = 0;
    for (int it = 0; it < n - 1; ++it) {
        bool changed = false;
        for (auto [u, v, w] : edges) {
            if (dist[u] != INF && dist[v] > dist[u] + w) {
                dist[v] = dist[u] + w;
                changed = true;
            }
        }
        if (!changed) break;
    }
    bool has_negative_cycle = false;
    for (auto [u, v, w] : edges) {
        if (dist[u] != INF && dist[v] > dist[u] + w) has_negative_cycle = true;
    }
    return {dist, has_negative_cycle};
}
```
