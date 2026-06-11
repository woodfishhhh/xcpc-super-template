```cpp
struct AhoCorasick {
    static constexpr int K = 26;
    struct Node { int next[K] = {}, fail = 0, out = 0; };
    vector<Node> tr{{}};

    void insert(const string &s) {
        int u = 0;
        for (char ch : s) {
            int c = ch - 'a';
            if (!tr[u].next[c]) tr[u].next[c] = new_node();
            u = tr[u].next[c];
        }
        ++tr[u].out;
    }

    int new_node() { tr.push_back(Node{}); return (int)tr.size() - 1; }

    void build() {
        queue<int> q;
        for (int c = 0; c < K; ++c) if (tr[0].next[c]) q.push(tr[0].next[c]);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            tr[u].out += tr[tr[u].fail].out;
            for (int c = 0; c < K; ++c) {
                int v = tr[u].next[c];
                if (v) tr[v].fail = tr[tr[u].fail].next[c], q.push(v);
                else tr[u].next[c] = tr[tr[u].fail].next[c];
            }
        }
    }

    long long count_matches(const string &text) const {
        long long ans = 0;
        int u = 0;
        for (char ch : text) {
            u = tr[u].next[ch - 'a'];
            ans += tr[u].out;
        }
        return ans;
    }
};
```
