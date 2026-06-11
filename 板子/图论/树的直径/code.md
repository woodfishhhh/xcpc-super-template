```cpp
pair<int, long long> farthest(int s, const vector<vector<pair<int, int>>> &g, vector<int> *parent = nullptr) {
    int n = (int)g.size();
    vector<long long> dist(n, -1);
    if (parent) parent->assign(n, -1);
    queue<int> q;
    dist[s] = 0;
    q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (auto [v, w] : g[u]) if (dist[v] == -1) {
            dist[v] = dist[u] + w;
            if (parent) (*parent)[v] = u;
            q.push(v);
        }
    }
    int best = s;
    for (int i = 0; i < n; ++i) if (dist[i] > dist[best]) best = i;
    return {best, dist[best]};
}

long long tree_diameter(const vector<vector<pair<int, int>>> &g) {
    auto [a, _] = farthest(0, g);
    auto [b, diameter] = farthest(a, g);
    return diameter;
}
```
