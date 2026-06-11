```cpp
long long tsp_shortest_path(const vector<vector<long long>> &w) {
    int n = (int)w.size();
    const long long INF = (1LL << 60);
    vector<vector<long long>> dp(1 << n, vector<long long>(n, INF));
    dp[1][0] = 0;
    for (int mask = 1; mask < (1 << n); ++mask) {
        for (int u = 0; u < n; ++u) if (dp[mask][u] < INF) {
            for (int v = 0; v < n; ++v) if (!(mask >> v & 1)) {
                dp[mask | (1 << v)][v] = min(dp[mask | (1 << v)][v], dp[mask][u] + w[u][v]);
            }
        }
    }
    long long ans = INF;
    for (int u = 0; u < n; ++u) ans = min(ans, dp[(1 << n) - 1][u] + w[u][0]);
    return ans;
}
```
