```cpp
template <int MOD>
struct ModInt {
    int v;
    ModInt(long long x = 0) { v = int((x % MOD + MOD) % MOD); }
    ModInt &operator+=(ModInt o) { v += o.v; if (v >= MOD) v -= MOD; return *this; }
    ModInt &operator-=(ModInt o) { v -= o.v; if (v < 0) v += MOD; return *this; }
    ModInt &operator*=(ModInt o) { v = int(1LL * v * o.v % MOD); return *this; }
    friend ModInt operator+(ModInt a, ModInt b) { return a += b; }
    friend ModInt operator-(ModInt a, ModInt b) { return a -= b; }
    friend ModInt operator*(ModInt a, ModInt b) { return a *= b; }

    ModInt pow(long long e) const {
        ModInt a = *this, r = 1;
        while (e) {
            if (e & 1) r *= a;
            a *= a;
            e >>= 1;
        }
        return r;
    }
    ModInt inv() const { return pow(MOD - 2); }
    ModInt &operator/=(ModInt o) { return *this *= o.inv(); }
    friend ModInt operator/(ModInt a, ModInt b) { return a /= b; }
};
```
