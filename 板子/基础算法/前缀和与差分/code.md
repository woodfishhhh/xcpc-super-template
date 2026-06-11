```cpp
vector<long long> build_prefix(const vector<long long> &a) {
    int n = (int)a.size();
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; ++i) pre[i + 1] = pre[i] + a[i];
    return pre;
}

long long range_sum(const vector<long long> &pre, int l, int r) {
    return pre[r + 1] - pre[l];
}

vector<long long> apply_range_add(int n, const vector<array<long long, 3>> &ops) {
    vector<long long> diff(n + 1, 0), a(n);
    for (auto [l, r, v] : ops) {
        diff[l] += v;
        if (r + 1 < n) diff[r + 1] -= v;
    }
    long long cur = 0;
    for (int i = 0; i < n; ++i) {
        cur += diff[i];
        a[i] = cur;
    }
    return a;
}
```
