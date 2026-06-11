```cpp
struct HopcroftKarp {
    int n, m;
    vector<vector<int>> g;
    vector<int> dist, matchL, matchR;

    HopcroftKarp(int n, int m) : n(n), m(m), g(n), dist(n), matchL(n, -1), matchR(m, -1) {}
    void add_edge(int u, int v) { g[u].push_back(v); }

    bool bfs() {
        queue<int> q;
        fill(dist.begin(), dist.end(), -1);
        for (int i = 0; i < n; ++i) if (matchL[i] == -1) dist[i] = 0, q.push(i);
        bool found = false;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int v : g[u]) {
                int nxt = matchR[v];
                if (nxt == -1) found = true;
                else if (dist[nxt] == -1) dist[nxt] = dist[u] + 1, q.push(nxt);
            }
        }
        return found;
    }

    bool dfs(int u) {
        for (int v : g[u]) {
            int nxt = matchR[v];
            if (nxt == -1 || (dist[nxt] == dist[u] + 1 && dfs(nxt))) {
                matchL[u] = v;
                matchR[v] = u;
                return true;
            }
        }
        dist[u] = -1;
        return false;
    }

    int max_matching() {
        int ans = 0;
        while (bfs()) {
            for (int i = 0; i < n; ++i) if (matchL[i] == -1 && dfs(i)) ++ans;
        }
        return ans;
    }
};
```
