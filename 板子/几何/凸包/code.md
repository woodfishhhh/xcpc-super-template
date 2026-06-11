```cpp
struct Point {
    long long x, y;
    bool operator<(const Point &o) const {
        return x == o.x ? y < o.y : x < o.x;
    }
    bool operator==(const Point &o) const {
        return x == o.x && y == o.y;
    }
};

long long cross(Point a, Point b, Point c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

vector<Point> convex_hull(vector<Point> p) {
    sort(p.begin(), p.end());
    p.erase(unique(p.begin(), p.end()), p.end());
    if (p.size() <= 1) return p;
    vector<Point> h;
    for (Point pt : p) {
        while (h.size() >= 2 && cross(h[h.size() - 2], h.back(), pt) <= 0) h.pop_back();
        h.push_back(pt);
    }
    int lower = (int)h.size();
    for (int i = (int)p.size() - 2; i >= 0; --i) {
        while ((int)h.size() > lower && cross(h[h.size() - 2], h.back(), p[i]) <= 0) h.pop_back();
        h.push_back(p[i]);
    }
    h.pop_back();
    return h;
}
```
