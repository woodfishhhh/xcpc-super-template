```cpp
void dfs_graph(int u, const vector<vector<int>> &g, vector<int> &vis, vector<int> &order) {
    vis[u] = 1;
    order.push_back(u);
    for (int v : g[u]) {
        if (!vis[v]) dfs_graph(v, g, vis, order);
    }
}

void backtrack(int pos, vector<int> &cur, vector<vector<int>> &ans, int n) {
    if (pos == n) {
        ans.push_back(cur);
        return;
    }
    for (int x = 0; x <= 1; ++x) {
        cur.push_back(x);
        backtrack(pos + 1, cur, ans, n);
        cur.pop_back();
    }
}
```
