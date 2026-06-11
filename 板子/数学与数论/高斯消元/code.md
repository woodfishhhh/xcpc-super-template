```cpp
optional<vector<double>> gaussian_elimination(vector<vector<double>> a) {
    const double EPS = 1e-9;
    int n = (int)a.size(), m = (int)a[0].size() - 1;
    vector<int> where(m, -1);
    for (int col = 0, row = 0; col < m && row < n; ++col) {
        int sel = row;
        for (int i = row; i < n; ++i) if (abs(a[i][col]) > abs(a[sel][col])) sel = i;
        if (abs(a[sel][col]) < EPS) continue;
        swap(a[sel], a[row]);
        where[col] = row;
        double div = a[row][col];
        for (int j = col; j <= m; ++j) a[row][j] /= div;
        for (int i = 0; i < n; ++i) if (i != row) {
            double factor = a[i][col];
            for (int j = col; j <= m; ++j) a[i][j] -= factor * a[row][j];
        }
        ++row;
    }
    vector<double> ans(m, 0);
    for (int i = 0; i < m; ++i) if (where[i] != -1) ans[i] = a[where[i]][m];
    for (int i = 0; i < n; ++i) {
        double sum = 0;
        for (int j = 0; j < m; ++j) sum += ans[j] * a[i][j];
        if (abs(sum - a[i][m]) > 1e-7) return nullopt;
    }
    return ans;
}
```
