```cpp
struct WeightedDSU {
    vector<int> parent, size;
    vector<long long> diff; // value[x] - value[parent[x]]

    explicit WeightedDSU(int n) : parent(n), size(n, 1), diff(n, 0) {
        iota(parent.begin(), parent.end(), 0);
    }

    pair<int, long long> find(int x) {
        if (parent[x] == x) return {x, 0};
        auto [r, w] = find(parent[x]);
        diff[x] += w;
        parent[x] = r;
        return {parent[x], diff[x]};
    }

    bool unite(int a, int b, long long w) { // value[a] - value[b] = w
        auto [ra, wa] = find(a);
        auto [rb, wb] = find(b);
        if (ra == rb) return wa - wb == w;
        if (size[ra] < size[rb]) {
            swap(ra, rb);
            swap(a, b);
            swap(wa, wb);
            w = -w;
        }
        parent[rb] = ra;
        diff[rb] = wa - wb - w;
        size[ra] += size[rb];
        return true;
    }

    optional<long long> difference(int a, int b) {
        auto [ra, wa] = find(a);
        auto [rb, wb] = find(b);
        if (ra != rb) return nullopt;
        return wa - wb;
    }
};
```
