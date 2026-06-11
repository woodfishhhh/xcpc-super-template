```cpp
using i64 = long long;

i64 exgcd(i64 a, i64 b, i64 &x, i64 &y) {
    if (b == 0) {
        x = 1;
        y = 0;
        return a;
    }
    i64 x1, y1;
    i64 g = exgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - a / b * y1;
    return g;
}

i64 inverse(i64 a, i64 mod) {
    i64 x, y;
    i64 g = exgcd(a, mod, x, y);
    if (g != 1) return -1;
    return (x % mod + mod) % mod;
}
```
