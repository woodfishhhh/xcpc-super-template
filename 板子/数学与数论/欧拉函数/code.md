```cpp
long long phi_single(long long n) {
    long long ans = n;
    for (long long p = 2; p * p <= n; ++p) if (n % p == 0) {
        ans = ans / p * (p - 1);
        while (n % p == 0) n /= p;
    }
    if (n > 1) ans = ans / n * (n - 1);
    return ans;
}

vector<int> phi_sieve(int n) {
    vector<int> phi(n + 1), primes;
    vector<int> is_comp(n + 1);
    phi[1] = 1;
    for (int i = 2; i <= n; ++i) {
        if (!is_comp[i]) primes.push_back(i), phi[i] = i - 1;
        for (int p : primes) {
            if (1LL * i * p > n) break;
            is_comp[i * p] = 1;
            if (i % p == 0) { phi[i * p] = phi[i] * p; break; }
            phi[i * p] = phi[i] * (p - 1);
        }
    }
    return phi;
}
```
