```cpp
vector<pair<int, int>> lyndon_factorization(const string &s) {
    int n = (int)s.size();
    vector<pair<int, int>> factors; // [start, length]
    for (int i = 0; i < n; ) {
        int j = i + 1, k = i;
        while (j < n && s[k] <= s[j]) {
            if (s[k] < s[j]) k = i;
            else ++k;
            ++j;
        }
        int len = j - k;
        while (i <= k) {
            factors.push_back({i, len});
            i += len;
        }
    }
    return factors;
}
```
