```cpp
vector<int> suffix_array(const string &s) {
    int n = (int)s.size();
    vector<int> sa(n), rnk(s.begin(), s.end()), tmp(n);
    iota(sa.begin(), sa.end(), 0);
    for (int k = 1; k < n; k <<= 1) {
        auto cmp = [&](int i, int j) {
            if (rnk[i] != rnk[j]) return rnk[i] < rnk[j];
            int ri = i + k < n ? rnk[i + k] : -1;
            int rj = j + k < n ? rnk[j + k] : -1;
            return ri < rj;
        };
        sort(sa.begin(), sa.end(), cmp);
        tmp[sa[0]] = 0;
        for (int i = 1; i < n; ++i) tmp[sa[i]] = tmp[sa[i - 1]] + cmp(sa[i - 1], sa[i]);
        rnk.swap(tmp);
        if (rnk[sa.back()] == n - 1) break;
    }
    return sa;
}

vector<int> lcp_array(const string &s, const vector<int> &sa) {
    int n = (int)s.size();
    vector<int> rank(n), lcp(max(0, n - 1));
    for (int i = 0; i < n; ++i) rank[sa[i]] = i;
    for (int i = 0, h = 0; i < n; ++i) {
        if (rank[i] == 0) continue;
        int j = sa[rank[i] - 1];
        while (i + h < n && j + h < n && s[i + h] == s[j + h]) ++h;
        lcp[rank[i] - 1] = h;
        if (h) --h;
    }
    return lcp;
}
```
