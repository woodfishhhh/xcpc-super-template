```cpp
template <class T>
struct MinHeap {
    priority_queue<T, vector<T>, greater<T>> pq;

    void push(const T &x) { pq.push(x); }
    void pop() { pq.pop(); }
    const T &top() const { return pq.top(); }
    bool empty() const { return pq.empty(); }
    int size() const { return (int)pq.size(); }
};
```
