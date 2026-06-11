```cpp
struct Treap {
    struct Node {
        int key, priority, size = 1;
        Node *left = nullptr, *right = nullptr;
        explicit Node(int key) : key(key), priority((rand() << 16) ^ rand()) {}
    };

    static int size(Node *t) { return t ? t->size : 0; }
    static void pull(Node *t) { if (t) t->size = 1 + size(t->left) + size(t->right); }

    static void split(Node *t, int key, Node *&a, Node *&b) {
        if (!t) { a = b = nullptr; return; }
        if (t->key < key) {
            split(t->right, key, t->right, b);
            a = t;
        } else {
            split(t->left, key, a, t->left);
            b = t;
        }
        pull(t);
    }

    static Node *merge(Node *a, Node *b) {
        if (!a || !b) return a ? a : b;
        if (a->priority < b->priority) {
            a->right = merge(a->right, b);
            pull(a);
            return a;
        }
        b->left = merge(a, b->left);
        pull(b);
        return b;
    }

    Node *root = nullptr;

    void insert(int key) {
        Node *a, *b;
        split(root, key, a, b);
        root = merge(merge(a, new Node(key)), b);
    }
};
```
