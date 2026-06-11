```cpp
struct Interval {
    int l, r;
};

int max_non_overlapping_intervals(vector<Interval> segs) {
    sort(segs.begin(), segs.end(), [](const Interval &a, const Interval &b) {
        if (a.r != b.r) return a.r < b.r;
        return a.l < b.l;
    });
    int ans = 0;
    int last_right = numeric_limits<int>::min();
    for (auto [l, r] : segs) {
        if (l >= last_right) {
            ++ans;
            last_right = r;
        }
    }
    return ans;
}
```
