```cpp
vector<int> topo_sort(const vector<vector<int>> &g) {
    int n = (int)g.size();
    vector<int> indeg(n), order;
    for (int u = 0; u < n; ++u) {
        for (int v : g[u]) ++indeg[v];
    }
    queue<int> q;
    for (int i = 0; i < n; ++i) {
        if (indeg[i] == 0) q.push(i);
    }
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);
        for (int v : g[u]) {
            if (--indeg[v] == 0) q.push(v);
        }
    }
    return order; // order.size() < n means a cycle exists.
}
```
