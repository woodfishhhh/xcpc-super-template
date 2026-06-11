```cpp
long long exgcd(long long a, long long b, long long &x, long long &y) {
    if (!b) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = exgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - a / b * y1;
    return g;
}

optional<pair<long long, long long>> excrt(vector<pair<long long, long long>> eqs) {
    long long r = 0, mod = 1;
    for (auto [a, m] : eqs) {
        long long x, y;
        long long g = exgcd(mod, m, x, y);
        if ((a - r) % g != 0) return nullopt;
        long long lcm = mod / g * m;
        __int128 t = (__int128)(a - r) / g * x;
        long long k = (long long)(t % (m / g));
        r = (r + (__int128)mod * k) % lcm;
        if (r < 0) r += lcm;
        mod = lcm;
    }
    return pair{r, mod};
}
```
