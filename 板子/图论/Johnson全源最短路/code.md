```cpp
struct JohnsonEdge { int u, v; long long w; };

vector<vector<long long>> johnson(int n, vector<JohnsonEdge> edges) {
    const long long INF = (1LL << 62);
    vector<long long> h(n + 1, 0);
    vector<JohnsonEdge> all = edges;
    for (int i = 0; i < n; ++i) all.push_back({n, i, 0});
    for (int it = 0; it < n; ++it) {
        for (auto [u, v, w] : all) {
            if (h[v] > h[u] + w) h[v] = h[u] + w;
        }
    }
    for (auto [u, v, w] : all) {
        if (h[v] > h[u] + w) return {}; // negative cycle
    }
    vector<vector<pair<int, long long>>> g(n);
    for (auto [u, v, w] : edges) g[u].push_back({v, w + h[u] - h[v]});
    vector<vector<long long>> ans(n, vector<long long>(n, INF));
    for (int s = 0; s < n; ++s) {
        priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> pq;
        ans[s][s] = 0;
        pq.push({0, s});
        while (!pq.empty()) {
            auto [d, u] = pq.top(); pq.pop();
            if (d != ans[s][u]) continue;
            for (auto [v, w] : g[u]) if (ans[s][v] > d + w) {
                ans[s][v] = d + w;
                pq.push({ans[s][v], v});
            }
        }
        for (int v = 0; v < n; ++v) if (ans[s][v] < INF) ans[s][v] += h[v] - h[s];
    }
    return ans;
}
```
