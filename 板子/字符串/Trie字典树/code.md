```cpp
struct Trie {
    struct Node {
        int next[26];
        int end = 0;
        Node() { fill(next, next + 26, -1); }
    };
    vector<Node> tr{Node()};

    void insert(const string &s) {
        int u = 0;
        for (char ch : s) {
            int c = ch - 'a';
            if (tr[u].next[c] == -1) {
                tr[u].next[c] = (int)tr.size();
                tr.push_back(Node());
            }
            u = tr[u].next[c];
        }
        ++tr[u].end;
    }

    bool contains(const string &s) const {
        int u = 0;
        for (char ch : s) {
            int c = ch - 'a';
            if (tr[u].next[c] == -1) return false;
            u = tr[u].next[c];
        }
        return tr[u].end > 0;
    }
};
```
