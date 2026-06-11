```cpp
struct MoQuery { int l, r, id; };

template <class Add, class Remove, class Answer>
vector<long long> mo_algorithm(int n, vector<MoQuery> queries, Add add, Remove remove, Answer answer) {
    int block = max(1, (int)sqrt(n));
    sort(queries.begin(), queries.end(), [&](const MoQuery &a, const MoQuery &b) {
        int ba = a.l / block, bb = b.l / block;
        if (ba != bb) return ba < bb;
        return (ba & 1) ? a.r > b.r : a.r < b.r;
    });
    vector<long long> res(queries.size());
    int l = 0, r = 0;
    for (auto q : queries) {
        while (l > q.l) add(--l);
        while (r < q.r) add(r++);
        while (l < q.l) remove(l++);
        while (r > q.r) remove(--r);
        res[q.id] = answer();
    }
    return res;
}
```
