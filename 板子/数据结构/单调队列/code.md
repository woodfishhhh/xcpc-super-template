```cpp
vector<int> sliding_window_max(const vector<int> &a, int k) {
    deque<int> q;
    vector<int> ans;
    for (int i = 0; i < (int)a.size(); ++i) {
        while (!q.empty() && q.front() <= i - k) q.pop_front();
        while (!q.empty() && a[q.back()] <= a[i]) q.pop_back();
        q.push_back(i);
        if (i + 1 >= k) ans.push_back(a[q.front()]);
    }
    return ans;
}
```
