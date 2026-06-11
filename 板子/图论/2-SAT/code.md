```cpp
struct TwoSAT {
    int n;
    vector<vector<int>> g;
    vector<int> dfn, low, comp, st;
    vector<char> in_stack;
    int timer = 0, comp_cnt = 0;

    explicit TwoSAT(int n) : n(n), g(2 * n), dfn(2 * n), low(2 * n), comp(2 * n, -1), in_stack(2 * n) {}
    int id(int x, bool val) const { return 2 * x + (val ? 0 : 1); }
    int neg(int x) const { return x ^ 1; }
    void imply(int a, int b) { g[a].push_back(b); }
    void add_or(int a, bool av, int b, bool bv) {
        int x = id(a, av), y = id(b, bv);
        imply(neg(x), y);
        imply(neg(y), x);
    }

    void tarjan(int u) {
        dfn[u] = low[u] = ++timer;
        st.push_back(u); in_stack[u] = true;
        for (int v : g[u]) {
            if (!dfn[v]) tarjan(v), low[u] = min(low[u], low[v]);
            else if (in_stack[v]) low[u] = min(low[u], dfn[v]);
        }
        if (dfn[u] == low[u]) {
            while (true) {
                int x = st.back(); st.pop_back(); in_stack[x] = false;
                comp[x] = comp_cnt;
                if (x == u) break;
            }
            ++comp_cnt;
        }
    }

    optional<vector<bool>> solve() {
        for (int i = 0; i < 2 * n; ++i) if (!dfn[i]) tarjan(i);
        vector<bool> ans(n);
        for (int i = 0; i < n; ++i) {
            if (comp[2 * i] == comp[2 * i + 1]) return nullopt;
            ans[i] = comp[2 * i] < comp[2 * i + 1];
        }
        return ans;
    }
};
```
