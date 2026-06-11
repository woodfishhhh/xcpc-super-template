```cpp
struct VirtualTreeBuilder {
    vector<int> tin, depth;
    vector<vector<int>> up;

    bool is_ancestor(int u, int v) const { return tin[u] <= tin[v] && tin[v] < tin[u] + (1 << 30); }
    int lca(int a, int b) const; // provide project LCA implementation
    long long dist(int a, int b) const; // provide tree distance

    vector<pair<int, int>> build(vector<int> nodes) {
        auto by_dfn = [&](int a, int b) { return tin[a] < tin[b]; };
        sort(nodes.begin(), nodes.end(), by_dfn);
        nodes.erase(unique(nodes.begin(), nodes.end()), nodes.end());
        int k = (int)nodes.size();
        for (int i = 0; i + 1 < k; ++i) nodes.push_back(lca(nodes[i], nodes[i + 1]));
        sort(nodes.begin(), nodes.end(), by_dfn);
        nodes.erase(unique(nodes.begin(), nodes.end()), nodes.end());

        vector<int> st;
        vector<pair<int, int>> edges;
        for (int u : nodes) {
            while (!st.empty() && !is_ancestor(st.back(), u)) st.pop_back();
            if (!st.empty()) edges.push_back({st.back(), u});
            st.push_back(u);
        }
        return edges;
    }
};
```
