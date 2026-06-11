```cpp
struct Point {
    long long x, y;
    Point operator+(const Point &o) const { return {x + o.x, y + o.y}; }
    Point operator-(const Point &o) const { return {x - o.x, y - o.y}; }
};

long long dot(Point a, Point b) {
    return a.x * b.x + a.y * b.y;
}

long long cross(Point a, Point b) {
    return a.x * b.y - a.y * b.x;
}

long long cross(Point a, Point b, Point c) {
    return cross(b - a, c - a);
}

int sgn(long long x) {
    return (x > 0) - (x < 0);
}
```
