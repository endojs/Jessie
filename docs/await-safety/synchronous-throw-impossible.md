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

```js
// normalizeConfigDescriptor is an async function. The only argument
// expression that might in theory throw is `config.bundles`, which we
// are confident could not actually throw. Even if it could, we'd still
// be safe because "terminal-control-flow". The catch body is not stateful.
// eslint-disable-next-line @jessie.js/no-nested-await
```
