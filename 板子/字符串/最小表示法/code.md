```cpp
int minimal_rotation(const string &s) {
    int n = (int)s.size();
    string t = s + s;
    int i = 0, j = 1, k = 0;
    while (i < n && j < n && k < n) {
        if (t[i + k] == t[j + k]) ++k;
        else if (t[i + k] > t[j + k]) {
            i += k + 1;
            if (i == j) ++i;
            k = 0;
        } else {
            j += k + 1;
            if (i == j) ++j;
            k = 0;
        }
    }
    return min(i, j);
}
```
