```cpp
long long interval_merge_cost(const vector<int> &a) {
    int n = (int)a.size();
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; ++i) pre[i + 1] = pre[i] + a[i];
    vector<vector<long long>> dp(n, vector<long long>(n, 0));
    for (int len = 2; len <= n; ++len) {
        for (int l = 0; l + len - 1 < n; ++l) {
            int r = l + len - 1;
            dp[l][r] = (1LL << 60);
            for (int k = l; k < r; ++k) {
                dp[l][r] = min(dp[l][r], dp[l][k] + dp[k + 1][r] + pre[r + 1] - pre[l]);
            }
        }
    }
    return dp[0][n - 1];
}
```
