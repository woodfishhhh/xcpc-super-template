```cpp
pair<vector<long long>, bool> spfa(int n, int s, const vector<vector<pair<int, int>>> &g) {
    const long long INF = (1LL << 62);
    vector<long long> dist(n, INF);
    vector<int> cnt(n, 0), inq(n, 0);
    queue<int> q;
    dist[s] = 0;
    q.push(s);
    inq[s] = 1;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        inq[u] = 0;
        for (auto [v, w] : g[u]) {
            if (dist[u] != INF && dist[v] > dist[u] + w) {
                dist[v] = dist[u] + w;
                if (!inq[v]) {
                    q.push(v);
                    inq[v] = 1;
                    if (++cnt[v] >= n) return {dist, true};
                }
            }
        }
    }
    return {dist, false};
}
```
