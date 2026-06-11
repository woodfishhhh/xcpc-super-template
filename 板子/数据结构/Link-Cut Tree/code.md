```cpp
struct LinkCutTree {
    struct Node { int ch[2] = {0, 0}, fa = 0, val = 0, sum = 0; bool rev = false; };
    vector<Node> tr;
    explicit LinkCutTree(int n) : tr(n + 1) {}

    bool is_root(int x) const {
        int f = tr[x].fa;
        return f == 0 || (tr[f].ch[0] != x && tr[f].ch[1] != x);
    }
    void pull(int x) { tr[x].sum = tr[tr[x].ch[0]].sum ^ tr[x].val ^ tr[tr[x].ch[1]].sum; }
    void reverse_node(int x) { if (x) swap(tr[x].ch[0], tr[x].ch[1]), tr[x].rev = !tr[x].rev; }
    void push(int x) { if (tr[x].rev) reverse_node(tr[x].ch[0]), reverse_node(tr[x].ch[1]), tr[x].rev = false; }

    void push_path(int x) {
        if (!is_root(x)) push_path(tr[x].fa);
        push(x);
    }
    void rotate(int x) {
        int y = tr[x].fa, z = tr[y].fa;
        int sx = tr[y].ch[1] == x, b = tr[x].ch[sx ^ 1];
        if (!is_root(y)) tr[z].ch[tr[z].ch[1] == y] = x;
        tr[x].fa = z;
        tr[x].ch[sx ^ 1] = y; tr[y].fa = x;
        tr[y].ch[sx] = b; if (b) tr[b].fa = y;
        pull(y); pull(x);
    }
    void splay(int x) {
        push_path(x);
        while (!is_root(x)) {
            int y = tr[x].fa, z = tr[y].fa;
            if (!is_root(y)) rotate((tr[y].ch[1] == x) == (tr[z].ch[1] == y) ? y : x);
            rotate(x);
        }
    }
    void access(int x) { for (int y = 0; x; y = x, x = tr[x].fa) splay(x), tr[x].ch[1] = y, pull(x); }
    void makeroot(int x) { access(x); splay(x); reverse_node(x); }
    int findroot(int x) { access(x); splay(x); while (push(x), tr[x].ch[0]) x = tr[x].ch[0]; splay(x); return x; }
    void link(int x, int y) { makeroot(x); if (findroot(y) != x) tr[x].fa = y; }
    void cut(int x, int y) { makeroot(x); access(y); splay(y); if (tr[y].ch[0] == x && !tr[x].ch[1]) tr[y].ch[0] = tr[x].fa = 0, pull(y); }
    int query(int x, int y) { makeroot(x); access(y); splay(y); return tr[y].sum; }
};
```
