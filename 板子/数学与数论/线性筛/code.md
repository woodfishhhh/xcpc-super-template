```cpp
struct LinearSieve {
    vector<int> primes, spf;

    LinearSieve(int n = 0) { if (n) init(n); }

    void init(int n) {
        primes.clear();
        spf.assign(n + 1, 0);
        for (int i = 2; i <= n; ++i) {
            if (!spf[i]) {
                spf[i] = i;
                primes.push_back(i);
            }
            for (int p : primes) {
                if (p > spf[i] || 1LL * i * p > n) break;
                spf[i * p] = p;
            }
        }
    }
};
```
