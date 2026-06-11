```cpp
template <class T>
void quick_sort(vector<T> &a, int l, int r) {
    if (r - l <= 1) return;
    int pivot_index = l + rand() % (r - l);
    T pivot = a[pivot_index];
    int i = l, j = l, k = r;
    while (j < k) {
        if (a[j] < pivot) swap(a[i++], a[j++]);
        else if (pivot < a[j]) swap(a[j], a[--k]);
        else ++j;
    }
    quick_sort(a, l, i);
    quick_sort(a, k, r);
}
```
