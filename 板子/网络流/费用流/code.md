```cpp
struct MinCostMaxFlow {
    struct Edge { int to, rev, cap; long long cost; };
    int n;
    vector<vector<Edge>> g;
    explicit MinCostMaxFlow(int n) : n(n), g(n) {}

    void add_edge(int u, int v, int cap, long long cost) {
        Edge a{v, (int)g[v].size(), cap, cost};
        Edge b{u, (int)g[u].size(), 0, -cost};
        g[u].push_back(a);
        g[v].push_back(b);
    }

    pair<int, long long> min_cost_flow(int s, int t) {
        const long long INF = (1LL << 62);
        int flow = 0;
        long long cost = 0;
        vector<long long> pot(n), dist(n);
        vector<int> pv(n), pe(n);
        while (true) {
            fill(dist.begin(), dist.end(), INF);
            priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> pq;
            dist[s] = 0;
            pq.push({0, s});
            while (!pq.empty()) {
                auto [d, u] = pq.top(); pq.pop();
                if (d != dist[u]) continue;
                for (int i = 0; i < (int)g[u].size(); ++i) {
                    Edge &e = g[u][i];
                    if (e.cap <= 0) continue;
                    long long nd = d + e.cost + pot[u] - pot[e.to];
                    if (nd < dist[e.to]) {
                        dist[e.to] = nd;
                        pv[e.to] = u;
                        pe[e.to] = i;
                        pq.push({nd, e.to});
                    }
                }
            }
            if (dist[t] == INF) break;
            for (int i = 0; i < n; ++i) if (dist[i] < INF) pot[i] += dist[i];
            int add = numeric_limits<int>::max();
            for (int v = t; v != s; v = pv[v]) add = min(add, g[pv[v]][pe[v]].cap);
            for (int v = t; v != s; v = pv[v]) {
                Edge &e = g[pv[v]][pe[v]];
                e.cap -= add;
                g[v][e.rev].cap += add;
                cost += 1LL * add * e.cost;
            }
            flow += add;
        }
        return {flow, cost};
    }
};
```
