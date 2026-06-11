```cpp
const long long INF = (1LL << 60);

void floyd(vector<vector<long long>> &dist) {
    int n = (int)dist.size();
    for (int k = 0; k < n; ++k) {
        for (int i = 0; i < n; ++i) {
            if (dist[i][k] >= INF) continue;
            for (int j = 0; j < n; ++j) {
                if (dist[k][j] >= INF) continue;
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
            }
        }
    }
}
```
