```cpp
struct LinearBasis {
    static constexpr int LOG = 62;
    long long basis[LOG + 1] = {};

    bool insert(long long x) {
        for (int i = LOG; i >= 0; --i) if ((x >> i) & 1LL) {
            if (!basis[i]) { basis[i] = x; return true; }
            x ^= basis[i];
        }
        return false;
    }

    long long max_xor(long long seed = 0) const {
        long long ans = seed;
        for (int i = LOG; i >= 0; --i) ans = max(ans, ans ^ basis[i]);
        return ans;
    }

    bool can_make(long long x) const {
        for (int i = LOG; i >= 0; --i) if ((x >> i) & 1LL) {
            if (!basis[i]) return false;
            x ^= basis[i];
        }
        return true;
    }
};
```
