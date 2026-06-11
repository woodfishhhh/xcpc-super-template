```cpp
struct RollingHash {
    using ull = unsigned long long;
    static constexpr ull base = 1315423911ULL;
    vector<ull> h, p;

    RollingHash(const string &s = "") { build(s); }

    void build(const string &s) {
        int n = (int)s.size();
        h.assign(n + 1, 0);
        p.assign(n + 1, 1);
        for (int i = 0; i < n; ++i) {
            h[i + 1] = h[i] * base + (unsigned char)s[i] + 1;
            p[i + 1] = p[i] * base;
        }
    }

    ull get(int l, int r) const {
        return h[r + 1] - h[l] * p[r - l + 1];
    }
};
```
