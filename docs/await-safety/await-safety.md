_context: [[Coding Style]]_

# Avoid Nested/Conditional Await

Our general rule (which will be enforced as part of the Jessie linter) is that an `await` may only appear in the top level of a function body. It must not appear otherwise inside of control syntax, such as a conditional, loop, or switch.

(More precisely, the rule is that an `await` or a for-await-of loops must only appear in the top level of a function body, module, or for-await-of loop body.)

For example, the following function runs `thunk()` (which might or might not be `async`), and wants to ensure that the `meteringDisabled` counter is decremented afterwards. The non-recommended approach is:

```js
async function runWithoutMeteringAsync(thunk) {
  meteringDisabled += 1;
  try {
    return await thunk(); // NOT RECOMMENDED
  } finally {
    meteringDisabled -= 1;
  }
}
```

This version has a subtle timing concern. If `thunk()` throws synchronously, the `await` is bypassed entirely, and control jumps immediately to the `finally { }` block. This is made more obvious by holding the supposed return Promise in a separate variable:

```js
async function runWithoutMeteringAsync(thunk) {
  meteringDisabled += 1;
  try {
    const p = thunk(); // if this throws..
    return await p; // .. this never even runs
  } finally {
    meteringDisabled -= 1; // .. and control jumps here immediately
  }
}
```

The recommended approach rewrites this to avoid the `await`, and instead uses the Promise's `.finally` method to achieve the same thing:

```js
async function runWithoutMeteringAsync(thunk) {
  meteringDisabled += 1;
  return Promise.resolve()
    .then(() => thunk())
    .finally(() => {
      meteringDisabled -= 1;
    });
}
```

(Note that `thunk()` must be called inside a `.then` to protect against any synchronous behavior it might have. It would not be safe to use `return thunk().finally(...)`, and `thunk()` might even return a non-Promise with some bogus `.finally` method.)

`await` effectively splits the function into two pieces: the part that runs before the `await`, and the part that runs after, and we must review it with that in mind (including reentrancy concerns enabled by the loss of control between the two). Using `await` inside a conditional means that _sometimes_ the function is split into two pieces, and sometimes it is not, which makes this review process much harder.

We sometimes refer to this rule as "only use top-level `await`". Keep in mind that we mean "top of each function", rather than "top level of the file" (i.e. outside of any function body, which is a relatively recent addition to JS, and only works in a module context).

See ["Atomic" vs "Transactional" terminology note](https://github.com/Agoric/agoric-sdk/wiki/%22Atomic%22-vs-%22Transactional%22-terminology-note)
