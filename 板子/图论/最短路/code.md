```cpp
using i64 = long long;
const i64 INF = (1LL << 62);

vector<i64> dijkstra(int n, int s, const vector<vector<pair<int, int>>> &g) {
    vector<i64> dist(n, INF);
    priority_queue<pair<i64, int>, vector<pair<i64, int>>, greater<pair<i64, int>>> pq;
    dist[s] = 0;
    pq.push({0, s});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d != dist[u]) continue;
        for (auto [v, w] : g[u]) {
            if (dist[v] > d + w) {
                dist[v] = d + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}
```
