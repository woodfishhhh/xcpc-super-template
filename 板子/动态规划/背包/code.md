```cpp
vector<int> zeroOneKnapsack(int capacity, const vector<int> &w, const vector<int> &val) {
    vector<int> dp(capacity + 1);
    for (int i = 0; i < (int)w.size(); i++) {
        for (int j = capacity; j >= w[i]; j--) {
            dp[j] = max(dp[j], dp[j - w[i]] + val[i]);
        }
    }
    return dp;
}
```
