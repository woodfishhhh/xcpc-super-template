```cpp
vector<int> previous_less(const vector<int> &a) {
    int n = (int)a.size();
    vector<int> pre(n, -1), st;
    for (int i = 0; i < n; ++i) {
        while (!st.empty() && a[st.back()] >= a[i]) st.pop_back();
        if (!st.empty()) pre[i] = st.back();
        st.push_back(i);
    }
    return pre;
}

long long largest_rectangle_area(const vector<int> &h) {
    vector<int> a = h;
    a.push_back(0);
    vector<int> st;
    long long ans = 0;
    for (int i = 0; i < (int)a.size(); ++i) {
        while (!st.empty() && a[st.back()] >= a[i]) {
            int height = a[st.back()];
            st.pop_back();
            int left = st.empty() ? -1 : st.back();
            ans = max(ans, 1LL * height * (i - left - 1));
        }
        st.push_back(i);
    }
    return ans;
}
```
