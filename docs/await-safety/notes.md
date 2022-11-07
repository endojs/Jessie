The "await hazard" is when there is stateful coupling between blocks of code such that on some paths, the stateful coupling happens within the same turn and in other paths there's a turn boundary between them. (By "turn" we mean a processing of the Node event loop.) Using `await` is a loss of execution control similar to calling a function.

When you `await` you don't know what might have changed before the next line executes. But fortunately, you know that the call stack is now empty. (There's nobody else that's waiting to get control back from you.)

So the equivalence classes are:
- zero awaits
- one or more awaits

With our await rules we're trying to only worry about one of those hazards at a time.

Top-level awaits are always safe.

Some control structures are always safe:
- `for await ... of` because it awaits even with zero iterations

When there is no turn boundary, you know that no interleaving happened between A and B. (You have an implicit mutual exclusion lock to all state to which you have synchronous access.)

When there is a turn boundary, you benefit from the stateful isolation wrt invariant maintenance. The code before the turn boundary is responsible for restoring all invariants before the turn is over (because arbitrary other turns happen before the await).

The risk to inconsistent turn boundaries to legibility (reader understanding of the code) and to testing. E.g. you happen to test when the stateful coupling is across a turn boundary but in production there isn't (or vice-versa). Consider function A calls function B. If there is a turn boundary in the midst of B executing, at the turn boundary control returns to A which proceeds to potentially manipulate state and all that happens before B resumes executing.

Example: Splicing into a doubly-linked list. There are two things that must change but can't happen at the same time. You have to temporarily suspend the invariant. If any code executes while that invariant is suspended that depends on the invariant being true, then you're in trouble.

So when execution resumes after an `await` the awaiting block must check state assumptions that may have changed. 
