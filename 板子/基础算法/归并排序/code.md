```cpp
template <class T>
long long merge_sort(vector<T> &a) {
    int n = (int)a.size();
    vector<T> tmp(n);
    auto solve = [&](auto &&self, int l, int r) -> long long {
        if (r - l <= 1) return 0;
        int m = (l + r) >> 1;
        long long inv = self(self, l, m) + self(self, m, r);
        int i = l, j = m, k = l;
        while (i < m || j < r) {
            if (j == r || (i < m && a[i] <= a[j])) tmp[k++] = a[i++];
            else {
                tmp[k++] = a[j++];
                inv += m - i;
            }
        }
        for (int p = l; p < r; ++p) a[p] = tmp[p];
        return inv;
    };
    return solve(solve, 0, n);
}
```
