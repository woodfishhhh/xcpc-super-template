```cpp
struct SegTree {
    int n = 1;
    vector<long long> tree;

    SegTree(int size = 0) { init(size); }

    void init(int size) {
        n = 1;
        while (n < size) n <<= 1;
        tree.assign(2 * n, 0);
    }

    void build(const vector<long long> &a) {
        init((int)a.size());
        for (int i = 0; i < (int)a.size(); ++i) tree[n + i] = a[i];
        for (int i = n - 1; i > 0; --i) tree[i] = tree[i << 1] + tree[i << 1 | 1];
    }

    void add(int pos, long long val) {
        int p = pos + n;
        tree[p] += val;
        for (p >>= 1; p; p >>= 1) tree[p] = tree[p << 1] + tree[p << 1 | 1];
    }

    long long query(int l, int r) {
        long long res = 0;
        for (l += n, r += n; l <= r; l >>= 1, r >>= 1) {
            if (l & 1) res += tree[l++];
            if (!(r & 1)) res += tree[r--];
        }
        return res;
    }
};
```
