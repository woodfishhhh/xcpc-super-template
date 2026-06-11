```cpp
template <class T, class Merge>
T divide_and_conquer(int l, int r, T identity, Merge merge) {
    if (l >= r) return identity;
    if (r - l == 1) return merge(identity, l);
    int m = (l + r) >> 1;
    T left = divide_and_conquer<T>(l, m, identity, merge);
    T right = divide_and_conquer<T>(m, r, identity, merge);
    return merge(left, right);
}

long long sum_range(const vector<int> &a, int l, int r) {
    auto solve = [&](auto &&self, int x, int y) -> long long {
        if (y - x == 1) return a[x];
        int m = (x + y) >> 1;
        return self(self, x, m) + self(self, m, y);
    };
    return l < r ? solve(solve, l, r) : 0;
}
```
