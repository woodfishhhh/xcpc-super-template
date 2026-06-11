```cpp
long long count_subarrays_with_sum_at_most(const vector<int> &a, long long limit) {
    long long ans = 0, sum = 0;
    int l = 0;
    for (int r = 0; r < (int)a.size(); ++r) {
        sum += a[r];
        while (l <= r && sum > limit) sum -= a[l++];
        ans += r - l + 1;
    }
    return ans;
}
```
