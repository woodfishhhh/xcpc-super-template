```cpp
using Matrix = vector<vector<long long>>;
const long long MOD = 1'000'000'007;

Matrix multiply(const Matrix &a, const Matrix &b) {
    int n = (int)a.size(), m = (int)b[0].size(), p = (int)b.size();
    Matrix c(n, vector<long long>(m, 0));
    for (int i = 0; i < n; ++i) {
        for (int k = 0; k < p; ++k) if (a[i][k]) {
            for (int j = 0; j < m; ++j) {
                c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;
            }
        }
    }
    return c;
}

Matrix matrix_power(Matrix a, long long e) {
    int n = (int)a.size();
    Matrix r(n, vector<long long>(n, 0));
    for (int i = 0; i < n; ++i) r[i][i] = 1;
    while (e) {
        if (e & 1) r = multiply(r, a);
        a = multiply(a, a);
        e >>= 1;
    }
    return r;
}
```
