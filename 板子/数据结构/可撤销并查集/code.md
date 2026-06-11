```cpp
struct RollbackDSU {
    vector<int> parent, size;
    vector<pair<int, int>> history;
    int components;

    explicit RollbackDSU(int n) : parent(n), size(n, 1), components(n) {
        iota(parent.begin(), parent.end(), 0);
    }

    int find(int x) const {
        while (parent[x] != x) x = parent[x];
        return x;
    }

    int snapshot() const { return (int)history.size(); }

    bool unite(int a, int b) {
        a = find(a), b = find(b);
        if (a == b) {
            history.push_back({-1, -1});
            return false;
        }
        if (size[a] < size[b]) swap(a, b);
        history.push_back({b, size[a]});
        parent[b] = a;
        size[a] += size[b];
        --components;
        return true;
    }

    void rollback(int snap) {
        while ((int)history.size() > snap) {
            auto [b, old_size] = history.back();
            history.pop_back();
            if (b == -1) continue;
            int a = parent[b];
            size[a] = old_size;
            parent[b] = b;
            ++components;
        }
    }
};
```
