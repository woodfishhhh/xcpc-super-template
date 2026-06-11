```cpp
template <class T>
struct Fenwick {
    int n;
    vector<T> tr;

    Fenwick(int n = 0) { init(n); }

    void init(int n_) {
        n = n_;
        tr.assign(n + 1, T{});
    }

    void add(int x, T v) {
        for (; x <= n; x += x & -x) tr[x] += v;
    }

    T sum(int x) const {
        T res{};
        for (; x > 0; x -= x & -x) res += tr[x];
        return res;
    }

    T rangeSum(int l, int r) const {
        return sum(r) - sum(l - 1);
    }
};
```
