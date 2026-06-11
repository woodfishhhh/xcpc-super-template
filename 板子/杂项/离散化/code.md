```cpp
struct Compressor {
    vector<long long> xs;

    void add(long long x) { xs.push_back(x); }

    void build() {
        sort(xs.begin(), xs.end());
        xs.erase(unique(xs.begin(), xs.end()), xs.end());
    }

    int get(long long x) const {
        return (int)(lower_bound(xs.begin(), xs.end(), x) - xs.begin());
    }

    long long value(int id) const {
        return xs[id];
    }
};
```
