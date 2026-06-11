```cpp
struct Constraint { int u, v; long long w; }; // x[v] - x[u] <= w
struct DifferenceEdge { int u, v; long long w; };

optional<vector<long long>> solve_difference_constraints(int n, const vector<Constraint> &constraints) {
    vector<DifferenceEdge> edges;
    edges.reserve(constraints.size() + n);
    for (auto [u, v, w] : constraints) edges.push_back({u, v, w});
    for (int i = 0; i < n; ++i) edges.push_back({n, i, 0});
    vector<long long> dist(n + 1, 0);
    for (int it = 0; it < n; ++it) {
        for (auto [u, v, w] : edges) dist[v] = min(dist[v], dist[u] + w);
    }
    for (auto [u, v, w] : edges) {
        if (dist[v] > dist[u] + w) return nullopt;
    }
    dist.pop_back();
    return dist;
}
```
