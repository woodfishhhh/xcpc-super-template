```cpp
struct SplayTree {
    struct Node { int ch[2] = {0, 0}, fa = 0, val = 0, size = 1; };
    vector<Node> tr{{}};
    int root = 0;

    int new_node(int val, int fa = 0) {
        tr.push_back(Node{});
        int x = (int)tr.size() - 1;
        tr[x].val = val;
        tr[x].fa = fa;
        return x;
    }

    int size(int x) const { return x ? tr[x].size : 0; }
    void pull(int x) { if (x) tr[x].size = 1 + size(tr[x].ch[0]) + size(tr[x].ch[1]); }
    bool side(int x) const { return tr[tr[x].fa].ch[1] == x; }

    void rotate(int x) {
        int y = tr[x].fa, z = tr[y].fa;
        bool sx = side(x);
        int b = tr[x].ch[sx ^ 1];
        if (z) tr[z].ch[side(y)] = x;
        tr[x].fa = z;
        tr[x].ch[sx ^ 1] = y;
        tr[y].fa = x;
        tr[y].ch[sx] = b;
        if (b) tr[b].fa = y;
        pull(y); pull(x);
    }

    void splay(int x, int goal = 0) {
        while (tr[x].fa != goal) {
            int y = tr[x].fa, z = tr[y].fa;
            if (z != goal) rotate(side(x) == side(y) ? y : x);
            rotate(x);
        }
        if (!goal) root = x;
    }
};
```
