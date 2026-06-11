```cpp
int first_true(int l, int r, const auto &ok) {
    // Search the first x in [l, r] with ok(x) == true.
    while (l < r) {
        int mid = l + (r - l) / 2;
        if (ok(mid)) r = mid;
        else l = mid + 1;
    }
    return l;
}

int last_true(int l, int r, const auto &ok) {
    // Search the last x in [l, r] with ok(x) == true.
    while (l < r) {
        int mid = l + (r - l + 1) / 2;
        if (ok(mid)) l = mid;
        else r = mid - 1;
    }
    return l;
}
```
