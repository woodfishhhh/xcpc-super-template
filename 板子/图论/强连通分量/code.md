```cpp
struct SCC {
    int n, timer = 0, comp_cnt = 0;
    vector<vector<int>> g;
    vector<int> dfn, low, stk, in_stk, comp;

    SCC(int n) : n(n), g(n), dfn(n), low(n), in_stk(n), comp(n, -1) {}

    void add_edge(int u, int v) { g[u].push_back(v); }

    void dfs(int u) {
        dfn[u] = low[u] = ++timer;
        stk.push_back(u);
        in_stk[u] = 1;
        for (int v : g[u]) {
            if (!dfn[v]) {
                dfs(v);
                low[u] = min(low[u], low[v]);
            } else if (in_stk[v]) {
                low[u] = min(low[u], dfn[v]);
            }
        }
        if (dfn[u] == low[u]) {
            while (true) {
                int x = stk.back();
                stk.pop_back();
                in_stk[x] = 0;
                comp[x] = comp_cnt;
                if (x == u) break;
            }
            ++comp_cnt;
        }
    }

    vector<int> solve() {
        for (int i = 0; i < n; ++i) if (!dfn[i]) dfs(i);
        return comp;
    }
};
```
