```cpp
struct BipartiteMatcher {
    int n, m;
    vector<vector<int>> g;
    vector<int> match, vis;

    BipartiteMatcher(int n, int m) : n(n), m(m), g(n), match(m, -1), vis(m) {}

    void addEdge(int u, int v) {
        g[u].push_back(v);
    }

    bool dfs(int u, int stamp) {
        for (int v : g[u]) {
            if (vis[v] == stamp) continue;
            vis[v] = stamp;
            if (match[v] == -1 || dfs(match[v], stamp)) {
                match[v] = u;
                return true;
            }
        }
        return false;
    }

    int solve() {
        int ans = 0;
        for (int i = 0; i < n; i++) {
            ans += dfs(i, i + 1);
        }
        return ans;
    }
};
```
