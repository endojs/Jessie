```js
// "initial-control-flow" is the time reversal of
// "terminal-control-flow". There is always a turn boundary before each
// iteration of a for-await-of loop. This await occurs in one branch
// of an unbalanced if within the loop body. But it happens before
// anything stateful executes within this iteration, so all subsequent
// code in the loop body only executes after a turn boundary.
// It is also safe because "terminal-control-flow" because non of the
// code in the remainder of the loop body is potentially stateful.
// The for-await-of loop protects all code after the loop anyway,
// because even in the zero iteration case it will always take a
// turn boundary.
```
