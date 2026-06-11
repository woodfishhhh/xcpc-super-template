```cpp
long long mod_pow(long long a, long long e, long long mod) {
    long long r = 1;
    while (e) {
        if (e & 1) r = r * a % mod;
        a = a * a % mod;
        e >>= 1;
    }
    return r;
}

struct Lucas {
    int p;
    vector<long long> fac, ifac;
    explicit Lucas(int p) : p(p), fac(p), ifac(p) {
        fac[0] = 1;
        for (int i = 1; i < p; ++i) fac[i] = fac[i - 1] * i % p;
        ifac[p - 1] = mod_pow(fac[p - 1], p - 2, p);
        for (int i = p - 1; i; --i) ifac[i - 1] = ifac[i] * i % p;
    }
    long long small_c(int n, int m) const {
        if (m < 0 || m > n) return 0;
        return fac[n] * ifac[m] % p * ifac[n - m] % p;
    }
    long long C(long long n, long long m) const {
        if (m < 0 || m > n) return 0;
        long long ans = 1;
        while (n || m) {
            ans = ans * small_c(n % p, m % p) % p;
            n /= p;
            m /= p;
        }
        return ans;
    }
};
```
