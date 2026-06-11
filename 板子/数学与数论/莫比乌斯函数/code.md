```cpp
vector<int> mobius_sieve(int n) {
    vector<int> mu(n + 1), primes, is_comp(n + 1);
    mu[1] = 1;
    for (int i = 2; i <= n; ++i) {
        if (!is_comp[i]) primes.push_back(i), mu[i] = -1;
        for (int p : primes) {
            if (1LL * i * p > n) break;
            is_comp[i * p] = 1;
            if (i % p == 0) {
                mu[i * p] = 0;
                break;
            }
            mu[i * p] = -mu[i];
        }
    }
    return mu;
}
```
