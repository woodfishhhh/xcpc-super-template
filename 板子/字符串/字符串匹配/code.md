```cpp
vector<int> prefixFunction(const string &s) {
    int n = (int)s.size();
    vector<int> pi(n);
    for (int i = 1; i < n; i++) {
        int j = pi[i - 1];
        while (j > 0 && s[i] != s[j]) j = pi[j - 1];
        if (s[i] == s[j]) j++;
        pi[i] = j;
    }
    return pi;
}

vector<int> kmp(const string &text, const string &pat) {
    string s = pat + '#' + text;
    vector<int> pi = prefixFunction(s), pos;
    int m = (int)pat.size();
    for (int i = m + 1; i < (int)s.size(); i++) {
        if (pi[i] == m) pos.push_back(i - 2 * m);
    }
    return pos;
}
```
