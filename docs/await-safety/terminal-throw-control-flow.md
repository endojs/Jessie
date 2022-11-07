```js
// This statement appears at the top level of a top level try block,
// and so is executed
// unconditionally. If it throws, we do nothing significantly stateful
// before exiting. (We do not consider `console.log` to be stateful
// for these purposes.) Otherwise, it will always cause a turn boundary
// before control flow continues.
```

```js
// We assume `E` cannot synchronously throw, and all the argument
// expressions are simple variables. If the await expression throws
// we exit the function immediately. Thus, there is a reliable
// turn boundary before each iteration of the loop. There remains
// the issue of zero iterations of the loop, which in this case is
// impossible because of the absence of a condition in the head.
//
// Finally, there remains the issue of the unbalances `if`. The
// then case will always take at least one turn boundary before
// proceeding. But the else case will proceed synchronously to
// the subsequent code. Fortunately, the next interesting statement
// is a top level await, so this await does not introduce any
// unsafety beyond that caused by the other await.
// Hence "not-my-problem". That await is manifestly safe because it
// is at top level of the function and always forces a turn boundary.
// The awaited expression is another `E` message send expression in
// which all the argument expressions are only variables, so it will
// not cause anything stateful prior to that turn boundary.
```
