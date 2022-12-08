# Failure Atomicity Hazards

```js
const foo1 = () => {
  doFirst();
  subgoal();
  doLast();
};
```

Of the stateful [interference hazards](./interference-hazards.md) of sequential imperative code, the trickiest is _failure atomicity_. In `foo1`, if `subGoal()` throws, then `doLast()` never gets a chance to restore the invariants suspended by `doFirst()`. Defensive programming against this will often look like

```js
const foo1a = () => {
  doFirst();
  try {
    subgoal();
  } finally {
    doLast();
  }
};
```

This code is only properly defensive assuming

- `doFirst` is failure atomic, at least in regards to the invariants at stake. If `doFirst()` throws, we assume that it throws in a state without suspended invariants.
- `subGoal()` is only needed when `doFirst()` succeeds. If `subGoal()` throws, it also needs to be failure atomic, but of a more delicate form. It need to leave the suspended invariants of `doFirst()` in a state where `doLast()` would still succeed at restoring the invariants.
- As code within a `finally` block, we need to ensue that `doLast()` does not throw, or at worst, throws only after restoring the invariants.

For some failures where restoring invariants is impractical, we need to ensure instead that all potentially corrupted state is _abandoned_--no longer reachable from observable computation. Since the state in question is sequentially accessible state, and therefore intravat, a way to abandon this state is to [abort this crank of the vat](https://github.com/Agoric/agoric-sdk/wiki/%22Atomic%22-vs-%22Transactional%22-terminology-note), or to kill the vat as a whole. For these, we use patterns such as

```js
const foo1b = () => {
  doFirst();
  try {
    // COMMIT POINT
    subgoal();
    doLast();
  } catch (err) {
    shutdownSomethingWithFailure(err);
    throw err;
  }
};
```

The assumption here is that any throw after the `COMMIT POINT`, i.e., that escapes `subGoal()` or `doLast()`, might leave behind unrepairable corrupted state, and that `shutdownSomethingWithFailure(err)` is enough to ensure that all that state becomes inaccessible--usually by killing the vat, or at least by aborting the current crank.

The _crank_ is our transactional unit, and aborting the crank is a transactional abort. It restores invariants not by repair, but by restoring a previous computation state before these invariants became suspended. In our system, this can work well because an aborted crank causes no obserable effects beyond resource use (including gas) and diagnostic information reporting about how or why the crank has failed. For most purposes, we do not consider these to be "observable".

Killing a vat also kills the vat during some crank of the vat, thereby _also_ aborting the crank, ensuring that its effects are not observable. It is appropriate to kill the vat when there is no correct way for the vat to proceed without that crank having succeeded.

Under SwingSet, we may eventually also support an intermediate form of abandonment, killing the vat incarnation with the hope that the vat might be upgraded from its persistent state into one that can still continue execution. This would be the *crash-upgrade*, which our upgrade plans do not yet support.

---

In a correct program, either

- **_Clean up after yourself_** - All stateful invariants are restored by end-of-turn, even if the term terminates with a thrown exception, so that the next turn is guarantees to start in a good state.
- **_Death before confusion_** - If invariants cannot practically be restored, all potentially corrupt state must be abandoned, usually by immediately killing the vat in question.

The author of `foo1` thus needs to worry about reentrancy (and other sequential interference hazards) but **_NOT_** about interleaving.
