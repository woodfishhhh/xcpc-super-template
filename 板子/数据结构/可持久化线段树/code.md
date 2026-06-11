```cpp
struct PersistentSegTree {
    struct Node { int l = 0, r = 0, sum = 0; };
    vector<Node> tr{{}};

    int clone(int p) {
        tr.push_back(tr[p]);
        return (int)tr.size() - 1;
    }

    int add(int p, int l, int r, int pos, int delta = 1) {
        int q = clone(p);
        tr[q].sum += delta;
        if (r - l == 1) return q;
        int m = (l + r) >> 1;
        if (pos < m) tr[q].l = add(tr[q].l, l, m, pos, delta);
        else tr[q].r = add(tr[q].r, m, r, pos, delta);
        return q;
    }

    int kth(int left_root, int right_root, int l, int r, int k) const {
        if (r - l == 1) return l;
        int cnt_left = tr[tr[right_root].l].sum - tr[tr[left_root].l].sum;
        int m = (l + r) >> 1;
        if (k <= cnt_left) return kth(tr[left_root].l, tr[right_root].l, l, m, k);
        return kth(tr[left_root].r, tr[right_root].r, m, r, k - cnt_left);
    }
};
```
