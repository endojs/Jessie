It does occur nested with a control flow branch. But it is at top
level within that branch, followed by another await also at
top level within that branch. Therefore, this await introduces
no unsafety beyond that potentially caused by the next await.

Go pay attention to some other await instead of this one.

e.g. in an if-then-else

```js
// It does occur nested with a control flow branch. But it is at top
// level within that branch, followed by another await also at
// top level within that branch. Therefore, this await introduces
// no unsafety beyond that potentially caused by the next await.
```
