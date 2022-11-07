```js
// This nested synchronous-throw-impossible await at the top level of
// the then branch is safe because it is balanced by a
// synchronous-throw-impossible await at the top level of the else
// branch. In fact the await in the else branch was introduced for
// that balance, in order to make this one safe.
```
