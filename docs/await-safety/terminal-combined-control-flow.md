In an an async function, the turn boundary always happens at the end of each
iteration. However, the control-flow is still unbalanced. If the loop iterates
zero times, we proceed to the next code synchronously. Else we proceed
asynchronously. However, the next loop is terminal, and each iteration of that
loop resemble each iteration of this one. Considered together, in all cases the
first iteration of one of these loops will happen first, if there are any. And
if there are more iterations from either loop, a turn boundary separated each
iteration from the next.

If you've got a non-terminal control block that has an unbalanced await, but the
next control block always has an await before it does something statefully
coupled then it's still the case that something statefully coupled is on the
other side of an await

```js
// `ensureVatOnline` is an async function, so this turn boundary always
// happens at the end of each iteration. However, the control-flow is
// still unbalanced. If the loop iterates zero times, we proceed to
// the next code synchronously. Else we proceed asynchronously.
// However, the next loop is terminal, and each iteration of that loop
// resemble each iteration of this one. Considered together, in all
// cases the first iteration of one of these loops will happen first,
// if there are any. And if there are more iterations from either loop,
// a turn boundary separated each iteration from the next.
```

```js
// It occurs at the top level of the loop body of a non-terminal top
// level loop, so we need to consider the zero-vs-non-zero iteration
// cases wrt the potentially stateful `getBootstrap()`. However, there is
// a turn boundary immediately prior to the loop, with no
// potentially stateful execution between that turn boundary and the loop.
// So, considering the loop and that previous await together,
// `getBootstrap()` in always called in a new turn.
```
