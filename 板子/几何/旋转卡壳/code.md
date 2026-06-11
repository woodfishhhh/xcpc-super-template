```cpp
struct Point {
    long long x, y;
    Point operator-(const Point &o) const { return {x - o.x, y - o.y}; }
};

long long cross(Point a, Point b) { return a.x * b.y - a.y * b.x; }
long long dist2(Point a, Point b) {
    long long dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;
}

long long convex_diameter(const vector<Point> &p) {
    int n = (int)p.size();
    if (n < 2) return 0;
    if (n == 2) return dist2(p[0], p[1]);
    long long ans = 0;
    int j = 1;
    for (int i = 0; i < n; ++i) {
        int ni = (i + 1) % n;
        while (cross(p[ni] - p[i], p[(j + 1) % n] - p[j]) > 0) j = (j + 1) % n;
        ans = max({ans, dist2(p[i], p[j]), dist2(p[ni], p[j])});
    }
    return ans;
}
```
