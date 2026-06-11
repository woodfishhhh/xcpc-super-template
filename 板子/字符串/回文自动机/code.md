```cpp
struct PalindromicAutomaton {
    struct Node { int len = 0, fail = 0, cnt = 0; map<char, int> next; };
    vector<Node> tr;
    string s;
    int last = 1;

    PalindromicAutomaton() {
        tr.push_back(Node{-1, 0, 0, {}});
        tr.push_back(Node{0, 0, 0, {}});
        s.push_back('#');
    }

    int get_fail(int x) {
        int pos = (int)s.size() - 1;
        while (s[pos - tr[x].len - 1] != s[pos]) x = tr[x].fail;
        return x;
    }

    void add(char c) {
        s.push_back(c);
        int cur = get_fail(last);
        if (!tr[cur].next.count(c)) {
            Node node;
            node.len = tr[cur].len + 2;
            node.fail = tr[get_fail(tr[cur].fail)].next[c];
            if (node.len == 1) node.fail = 1;
            tr[cur].next[c] = (int)tr.size();
            tr.push_back(node);
        }
        last = tr[cur].next[c];
        ++tr[last].cnt;
    }

    int distinct_palindromes() const { return (int)tr.size() - 2; }
};
```
