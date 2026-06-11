```cpp
struct FastInput {
    static constexpr int S = 1 << 20;
    int idx = 0, size = 0;
    char buf[S];

    char getch() {
        if (idx >= size) {
            size = (int)fread(buf, 1, S, stdin);
            idx = 0;
            if (size == 0) return 0;
        }
        return buf[idx++];
    }

    template <class T>
    bool read(T &x) {
        char c;
        T sign = 1, val = 0;
        do {
            c = getch();
            if (!c) return false;
        } while (c <= ' ');
        if (c == '-') {
            sign = -1;
            c = getch();
        }
        while (c > ' ') {
            val = val * 10 + (c - '0');
            c = getch();
        }
        x = val * sign;
        return true;
    }
};
```
