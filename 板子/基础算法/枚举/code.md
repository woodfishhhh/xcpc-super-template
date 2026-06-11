```cpp
template <class Check>
vector<int> enumerate_answers(int n, Check check) {
    vector<int> ans;
    for (int mask = 0; mask < (1 << n); ++mask) {
        if (check(mask)) ans.push_back(mask);
    }
    return ans;
}

// Example: enumerate all subsets of mask.
vector<int> subsets(int mask) {
    vector<int> res;
    for (int sub = mask; ; sub = (sub - 1) & mask) {
        res.push_back(sub);
        if (sub == 0) break;
    }
    return res;
}
```
