```cpp
struct LiChaoTree {
    struct Line {
        long long k = 0, b = (1LL << 62);
        long long get(long long x) const { return k * x + b; }
    };
    struct Node { Line line; int left = 0, right = 0; };
    vector<Node> tr{{}};
    long long xl, xr;

    LiChaoTree(long long xl, long long xr) : xl(xl), xr(xr) {}

    void add_line(Line nw) { add_line(0, xl, xr, nw); }
    void add_line(int p, long long l, long long r, Line nw) {
        long long m = (l + r) >> 1;
        bool lef = nw.get(l) < tr[p].line.get(l);
        bool mid = nw.get(m) < tr[p].line.get(m);
        if (mid) swap(nw, tr[p].line);
        if (r - l == 1) return;
        if (lef != mid) {
            if (!tr[p].left) tr[p].left = new_node();
            add_line(tr[p].left, l, m, nw);
        } else {
            if (!tr[p].right) tr[p].right = new_node();
            add_line(tr[p].right, m, r, nw);
        }
    }

    int new_node() { tr.push_back(Node{}); return (int)tr.size() - 1; }

    long long query(long long x) const { return query(0, xl, xr, x); }
    long long query(int p, long long l, long long r, long long x) const {
        long long ans = tr[p].line.get(x);
        if (r - l == 1) return ans;
        long long m = (l + r) >> 1;
        if (x < m && tr[p].left) ans = min(ans, query(tr[p].left, l, m, x));
        if (x >= m && tr[p].right) ans = min(ans, query(tr[p].right, m, r, x));
        return ans;
    }
};
```
