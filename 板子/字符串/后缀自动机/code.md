```cpp
struct SuffixAutomaton {
    struct State { int link = -1, len = 0; map<char, int> next; };
    vector<State> st{{}};
    int last = 0;

    void extend(char c) {
        int cur = (int)st.size();
        st.push_back(State{});
        st[cur].len = st[last].len + 1;
        int p = last;
        while (p != -1 && !st[p].next.count(c)) st[p].next[c] = cur, p = st[p].link;
        if (p == -1) st[cur].link = 0;
        else {
            int q = st[p].next[c];
            if (st[p].len + 1 == st[q].len) st[cur].link = q;
            else {
                int clone = (int)st.size();
                st.push_back(st[q]);
                st[clone].len = st[p].len + 1;
                while (p != -1 && st[p].next[c] == q) st[p].next[c] = clone, p = st[p].link;
                st[q].link = st[cur].link = clone;
            }
        }
        last = cur;
    }

    long long distinct_substrings() const {
        long long ans = 0;
        for (int i = 1; i < (int)st.size(); ++i) ans += st[i].len - st[st[i].link].len;
        return ans;
    }
};
```
