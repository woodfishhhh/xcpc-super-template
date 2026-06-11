```cpp
struct LazySegTree {
    int n;
    vector<long long> sum, lazy;

    explicit LazySegTree(const vector<long long> &a) : n((int)a.size()), sum(4 * n), lazy(4 * n) {
        build(1, 0, n, a);
    }

    void build(int p, int l, int r, const vector<long long> &a) {
        if (r - l == 1) { sum[p] = a[l]; return; }
        int m = (l + r) >> 1;
        build(p << 1, l, m, a);
        build(p << 1 | 1, m, r, a);
        pull(p);
    }

    void apply(int p, int l, int r, long long v) {
        sum[p] += v * (r - l);
        lazy[p] += v;
    }

    void push(int p, int l, int r) {
        if (!lazy[p] || r - l == 1) return;
        int m = (l + r) >> 1;
        apply(p << 1, l, m, lazy[p]);
        apply(p << 1 | 1, m, r, lazy[p]);
        lazy[p] = 0;
    }

    void pull(int p) { sum[p] = sum[p << 1] + sum[p << 1 | 1]; }

    void range_add(int ql, int qr, long long v) { range_add(1, 0, n, ql, qr, v); }
    void range_add(int p, int l, int r, int ql, int qr, long long v) {
        if (qr <= l || r <= ql) return;
        if (ql <= l && r <= qr) { apply(p, l, r, v); return; }
        push(p, l, r);
        int m = (l + r) >> 1;
        range_add(p << 1, l, m, ql, qr, v);
        range_add(p << 1 | 1, m, r, ql, qr, v);
        pull(p);
    }

    long long query(int ql, int qr) { return query(1, 0, n, ql, qr); }
    long long query(int p, int l, int r, int ql, int qr) {
        if (qr <= l || r <= ql) return 0;
        if (ql <= l && r <= qr) return sum[p];
        push(p, l, r);
        int m = (l + r) >> 1;
        return query(p << 1, l, m, ql, qr) + query(p << 1 | 1, m, r, ql, qr);
    }
};
```
