# Stateful Plan Interference Hazards

JavaScript uses the [Communicating Event Loops](https://papers.agoric.com/papers/concurrency-among-strangers/abstract/) (CEL) concurrency model. The CEL model distinguishes between synchronous control flow within a turn _vs_ asynchronous control flow between turns. By _turn_ we mean everything that happens between one empty stack state and the next. Unlike most concurrency models, a great advantage of CEL is that it separates sequential plan intereference hazards, such as _reentrancy_, from asynchronous plan interfenece hazards, such as _interleavings_.

## Reentrancy Hazards _without_ Interleaving Hazards

```js
const foo1 = () => {
  doFirst();
  subgoal();
  doLast();
};
```

The `foo1` function calls `doFirst()`, `subGoal()`, and `doLast()` synchronously, in order, within a turn, stacked on a call to `foo1`. What plan inteference problems do we need to worry about? Let's say that `foo1` splices a doubly linked list. Assuming the list is well formed before the splice, `foo1` should do the splice and ensure the list is well formed again after the splice. However, there's no way to do the splice without suspending the invariant---without going through a state where the list is temporarily ill formed. Say `doFirst()` does the first part of the splice, leaving the list ill formed, and `doLast()` does the remainder, restoring the well-formed invariant. `subGoal()` might be a helper function that `foo1` calls from within this delicate state.

In general, the conservative assumption _whenever_ a function is called from a non-empty stack, is that it might be called in a state where some invariants are suspended.

This code has a *reentrancy* hazard. Such reentrancy hazards are a dangerous but inevitable part of normal imperative programming--the `subGoal()` helper function may be a necessary part of `foo1`'s plan. For `foo1` to be good code, either
   * The author of `foo1` needs to be confident that `subGoal()` will not read or write the synchronous state whose invariants are suspended; confident that this restriction is robust enough under maintenance by others. This assumption could be violated, for example, if `subGoal()` could cause `foo1()` to be called (reentered) during the execution of `subGoal()` to manipulate the same list. The object-capability (ocap) model can help the author of `foo1` reason about what state is inaccessible to `subGoal()`.
   * Or, the author of `foo1` knows how `subGoal()` does access that state, and is part of `foo1`'s overall plan for manipulating that state, just as `doFirst()` and `doLast()` are. In this case, the author of `subGoal` needs to ensure that `subGoal` is not called other than as part of `foo1`'s plan. The ocap model can help the authors of `foo1` and `subGoal` jointly reason about the inaccessibility of `subGoal` to others.

In Java or any language with shared state concurrency, this same code also has interleaving hazards. Two threads may both execute calls to `foo1()`, where these executions interleave at the fine grain of machine "units of operation", roughly the same as instructions or memory accesses. In such languages, the author of `foo1()` needs to prevent such interleaving using tricky locking constructs to create some form of mutual exclusion--exactly to coarsen this fine grain interleaving where it would be harmful. These locking constructs carry their own hazards of _deadlock_, a particularly pernicious form of lost-progress bug.

In CEL the author of `foo1()` knows that nothing can observably happen between calling `subGoal()` and `subGoal` beginning execution. Without need for further notation, `foo1` already has mutually exclusive access to all synchronously accessible state, such as the linked list. Although code in other vats runs in parallel to code in this vat, state within this vat is synchronously accessible only to execution within this vat. The effects of other vats are only observable within this vat at turn boundaries. During a turn, execution proceeds with only the well understood hazards of normal sequential imperative code. In a correct program, all stateful invariants are restored before a turn completes, enabling the next turn to assume it starts in a good state.

The author of `foo1` thus still needs to worry about conventional reentrancy (and other sequential interference hazards), ***but NOT about interleaving***.

(See [Failure Atomicity](./failure-atomicity.md) for more stateful interference hazard of sequential imperative code.)


## Interleaving Hazards _without_ Reentrancy Hazards

```js
const foo2() => {
  const p = doFirst();
  Promise.resolve(p).then(() => todoGoal());
  doLast();
};
```

Under normal conditions, all that happens during the execution of a call to `foo2()` is `doFirst()` and `doLast()`, plus scheduling `todoGoal()` to happen eventually, in its own turn starting from an empty stack, sometime after the current turn is done. This protects `foo2()`'s immediate plan from interference by `todoGoal()`, and it protects `todoGoal()`'s plan from the suspended invariants of `foo2()`.
