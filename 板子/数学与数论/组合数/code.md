```cpp
const long long MOD = 1'000'000'007;

long long mod_pow(long long a, long long e) {
    long long r = 1;
    while (e) {
        if (e & 1) r = r * a % MOD;
        a = a * a % MOD;
        e >>= 1;
    }
    return r;
}

struct Comb {
    vector<long long> fac, ifac;

    Comb(int n = 0) { if (n) init(n); }

    void init(int n) {
        fac.assign(n + 1, 1);
        ifac.assign(n + 1, 1);
        for (int i = 1; i <= n; ++i) fac[i] = fac[i - 1] * i % MOD;
        ifac[n] = mod_pow(fac[n], MOD - 2);
        for (int i = n; i >= 1; --i) ifac[i - 1] = ifac[i] * i % MOD;
    }

    long long C(int n, int k) const {
        if (k < 0 || k > n) return 0;
        return fac[n] * ifac[k] % MOD * ifac[n - k] % MOD;
    }
};
```
