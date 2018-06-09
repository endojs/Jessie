# TinySES

***This document is an early draft. Comments appreciated! Thanks.***


TinySES is a small safe ocap subset of JavaScript that
   * can easily run within a JavaScript system,
   * can be safely linked with adversarial SES code,
   * can be easily implemented for standalone use,
   * can be transmitted as lightweight safe mobile code,
   * is amenable to a range of static analysis,
   * omits most of JavaScript's bad parts,
   * non-experts can use to write non-trivial non-exploitable
     smart contracts,

##  Subsetting EcmaScript

Unless stated otherwise, all references to EcmaScript refer to
[EcmaScript 2017](http://www.ecma-international.org/ecma-262/8.0/),
the eighth edition of the standard.

One language is a *static subset* (<S) of another if every program
statically accepted by the smaller language is also statically
accepted by the larger language with the same meaning.

One language is a *dynamic subset* (<D) of another if non-erroneous
execution of code in the smaller language operates the same way in the
larger language. The smaller language may treat some dynamic cases as
errors that the larger language would not consider errors. Programs in
the smaller language whose correctness relies on these errors, even if
it does not provoke them itself, would generally become incorrect as
programs in the larger language.

One language is *absorbed* (<A) by another if code in the smaller
language can be run as code in the larger language without internal
modification. (Surrounding the code with a prelude and postlude is a
modification, but not an *internal modification*.)  A smaller language
which is not absorbed may often be *transpiled* (<T) into the larger
language by source-to-source transformation.

The following diagram illustrates the subsetting relationship between various subsets of EcmaScript. The vertical dimension represents syntactic subsetting by static means. The horizontal dimension represents semantic subsetting by either static or dynamic means. The word cloud in the contour between each language and its subset represents the features of the containing language omitted by that next smaller subset. The relative sizes of the feature names reflects only its explanatory significance.

![EcmaScript subsets Venn diagram](docs/ecmascript-subsets-solid.png "EcmaScript
 subsets Venn diagram")

<p align="center"><b>JSON</b> &lt;SA <b>TinySES</b> &lt;SA <b>SES</b>
  &lt;DA <b>ES-strict</b> &lt;SDA <b>EcmaScript</b></p>

Each step needs to be explained. Proceeding from larger to smaller.

**EcmaScript** code may be in either strict mode or sloppy
mode, so the **ES-strict** sublanguage is a static, dynamic,
absorbed subset of full EcmaScript by definition. (Historically, the
strict sublanguage started by approximating a static and dynamic
subset of the sloppy language, excluding `with` and throwing errors
where the sloppy language would instead silently act insane. But this
approximation has too many exceptions to remain useful.) Unlike full EcmaScript, ES-strict is statically scoped, ES-strict functions are strongly encapsulated, and implicit access to the global object is severely restricted.

**SES** is a dynamic, absorbed subset of ES-strict. SES
statically accepts all programs accepted by ES-strict and can run
on ES-strict without internal modification.  SES freezes the
primordials, so mutations that would succeed in ES-strict might
instead throw a `TypeError` in SES.  SES restricts the global scope,
so attempts to dereference a variable named, for example, `document`
that might succeed in ES-strict on a given host might instead
throw a `ReferenceError` within a SES environment run on that host.

SES is the largest subset of ES-strict which is still an ocap
language. Its purpose is to run as many conventional EcmaScript
programs as possible while staying within ocap rules.

**TinySES** is a static, absorbed subset of SES. TinySES approximates
the smallest useful subset of SES that is still pleasant to
program in using the objects-as-closures pattern. TinySES omits
`this` and classes. Once initialized, the API surface of a TinySES
object must be tamper-proofed before exposure to clients.
TinySES is not intended to run legacy code or code that uses
inheritance.

The TinySES grammar is simple enough to be parsed easily. TinySES
imposes static validation rules that are easy to check locally,
to ensure that objects are tamper-proofed before they escape.
Statically valid TinySES programs enable sound static analysis of
useful safety properties. A SES IDE can thereby flag which code
is in TinySES and provide static analysis info for that code.

Used outside of SES, TinySES can be implemented (compiled or
interpreted) easily and with high confidence.

**JSON** is a static, absorbed subset of all the languages above.

JSON is popular as a safe interchange format for data. Each
language that accepts JSON has its own JSON parser and "compiler" for
turning parsed data into data that this language can process. SES and
TinySES are interchange formats for data and behavior, i.e., safe
mobile code. TinySES is small enough to be easily implemented as a
compiler or interpreter in a wide range of other languages.


## TinySES as a syntactic subset of SES


The [TinySES grammar](src/tinyses.js) is based on the [ECMAScript 2017
Grammar
Summary](http://www.ecma-international.org/ecma-262/8.0/#sec-grammar-summary).
Unlike the Ecma page, lexical productions in the TinySES grammar are
named in all upper case.

Unlike EcmaScript and SES, TinySES has no semicolon insertion, and so
does not need a parser able to handle that. However, TinySES must
impose the `NO_NEWLINE` constraints from EcmaScript, so that every
non-rejected TinySES program is accepted as the same SES
program. `NO_NEWLINE` is a lexical-level placeholder that must
never consume anything. It should fail if the whitespace to skip
over contains a newline. TODO: Currently this placeholder always
succeeds.

TinySES omits the `RegularExpressionLiteral`, instead including the
[`RegExp.make`](https://github.com/mikesamuel/regexp-make-js) template
string tag. By omitting `RegularExpressionLiteral` and automatic
semicolon insertion, our lexical grammar avoids the context dependencies
that are most difficult for JavaScript lexers.

In TinySES, all reserved words are unconditionally reserved. By
contrast, in EcmaScript and SES, `yield`, `await`, `implements`, etc
are conditionally reserved. Thus we avoid the need for parameterized
lexical-level productions.

TinySES omits both the `in` expression and the for/in loop,
and thus avoids the need for parameterized parser-level
productions.

`QUASI_*` are lexical-level placeholders. `QUASI_ALL` should match a
self-contained template literal string that has no holes
" \`...\` ". `QUASI_HEAD` should match the initial literal part of a
template literal with holes " \`...${ ". `QUASI_MID` should match
the middle " }...${ ", and `QUASI_TAIL` the end " }...\` ". The
reason these are difficult is that a close curly "}" during a hole only
terminates the hole if it is balanced.  TODO: All these
placeholders currently fail. There is not yet the logic needed to
tell whether a close curly terminates a hole.

Outside the lexical grammar, other differences from [ECMAScript 2017
Grammar
Summary](http://www.ecma-international.org/ecma-262/8.0/#sec-grammar-summary)
are noted as comments within the grammar.  The Ecma page uses a cover
grammar to avoid unbounded lookahead. Because TinySES grammar is
defined using a PEG (parsing expression grammar) which supports
unbounded lookahead, we avoid the need for a cover grammar. TODO:
Determine where difficulties arise parsing according to this TinySES
grammar with bounded lookahead. If difficult, we may reintroduce a
cover grammar.

TinySES array literals omit elision (i.e., nothing between
commas).

TinySES treats `async`, `arguments`, and `eval` as reserved keywords.
Strict mode already limits `arguments` and `eval` to the point that
they are effectively keywords in strict code.  TinySES does include
ellipses `...` both as rest and spread, which provides the useful
functionality of `arguments` with less confusion.

TinySES omits computed property names. TinySES has syntax for
mutating only number-named properties, which include floating
point, `NaN`, `Infinity`, and `-Infinity`. TinySES omits syntactic
support for mutating other property names. TinySES has syntax for
computed lookup and mutation of number-named properties, but not
other property names. However, TinySES programs may still perform
these operations using the `Reflect` API.

TinySES includes arrow functions, `function` functions, concise method
syntax, and accessor (getter / setter) syntax.  TinySES may eventually
grow to accept generators, async functions, async iterator functions,
all in their `function`, arrow, and method form. TinySES does not
currently support symbols or general computed property access, but may
grow to as well, once we understand its impact on static
analyzability. However, TinySES will continue to omit `this` as the
central defining difference between SES and TinySES. TinySES will
therefore continue to omit `class` as well.

The TinySES `switch` statement grammar requires that all cases be
terminated by a terminating statement, `return`, `break`, `continue`
or `throw`, avoiding a perpetually annoying hazard of C-like
languages.

All control-flow branches, including `switch` cases, must be blocks,
not naked statements, avoiding hazards and giving each branch its own
lexical block scope.

TinySES has no for/in statememt, and so does not inherit the
non-determinism regarding property modification during for/in
enumeration. Everything useful about for/in is still available by
reflection but without this non-determinism issue.


## Additional Static Restrictions of TinySES


The following static restrictions are specified as if they occur
post-parsing, by analyzing the abstract syntax tree.

The EcmaScript-strict `eval` can be used for both direct and indirect
eval. SES and TinySES as absorbed into EcmaScript has no direct eval,
although we may support it based on future versions that support
Realms and Frozen Realms. So that this future repair of TinySES does
not break old programs, TinySES excludes expressions in the syntactic
form of direct eval.

SES can create objects whose API surface is not tamper-proofed and
expose these to clients. This is easy to do accidentally, and
hazardous when it happens. Even if the object was designed to be
directly mutated by its clients, any client may freeze the object,
preventing other clients from directly mutating it. To help the
TinySES programmer avoid these hazards, all objects made by literal
expressions (object literals, array literals, the many forms of
function literals) must be tamper-proofed with `def` before it can
escape from its static context of origin. Thus, direct mutation can
still be used to prepare an object for release. Use of `def` then
marks the object as being ready for use by its clients.

Looking up a function in an array and calling it would naturally be
coded as

```js
array[i](arg)
```

However, if the called function were written in SES it could use
`this` to capture the array itself. To protect against this, TinySES
statically rejects this call, forcing the programmer to write instead
something like

```js
(1,array[i])(arg)
```

which is safe. However, the TinySES programmer might still encounter
this hazard if storing a SES function on a named field of a
record, looking it up by name and immediately calling it:

```js
record.field(args)
```

This would still give the SES function access to the record as its
`this` argument.


## Caveats

### Aniticipating future EcmaScript changes

ES-strict does not include the `import` expression or the
`import.meta` expression. Once ES20xx-strict does include these, SES
must either exclude these by becoming a static subset, or it must
restrict their semantics, require transpilation if embedded into the
full language. Either embedding requires a full parse.

Beyond subsetting EcmaScript, this grammar also includes the infix bang
`!` (eventually) operator from Dr.SES. We hope infix bang `!` will
become part of the standard EcmaScript grammar. But until then, infix
bang `!` trivially transpiles into calls to the Dr.SES extended
promise API. See [Distributed Electronic Rights in
JavaScript](http://research.google.com/pubs/pub40673.html).

We will add BigInt to TinySES, even though it will only be in
EcmaScript well after ES2017.

### Exceptions to the subsetting claims

Freezing the primordials does more that just turn non-errors into
errors. It also changes how reflection describes these properties and
objects. Thus, SES and TinySES are technically not subsets of
ES-strict for programs using reflection, since these differences
are detectable by means other than errors.

### Remaining hazards

Arrow functions and concise methods have a [[Call]] behavior and no
[[Construct]] behavior, preventing them from being called as a
constructor, such as with `new`. However, TinySES `function` functions
can be called in this manner. Without `this` it is hard to see how
this could confuse a `function` function, but I am not yet confident
that this does not produce a hazard.

### Possible changes to current TinySES definition

We need to add `new` back into the TinySES grammar.

Should we add the bitwise operators back into the TinySES grammar?
There's little hazard here.

Should we add do/while back into the TinySES grammar? There's no
hazard here. We omitted it just for minimalism.

We will probably add `async`/`await` functions back in. There is some
hazard here, but probably less that trying to do without them. Can
better static analysis help avoid stateful hazards at `await` points?

What about generators or async iterators?

TODO: We must ensure that code containing "&lt;!--" or "--&gt;" that
could be parsed as an html comment according to the EcmaScript
Appendix B grammar is instead statically rejected. Otherwise the same
source may parse differently on different platforms, or even as script
vs module code on the same platform.


## Open Questions


Can TinySES be soundly statically typed with a structural type system?
What about trademarks/nominal-types and auditors? How would this map
to the wasm type system which does tag checking but no deep
parameterized type checking?  If static checking makes sense, should
we add some of TypeScript's or Flow's syntax for optional type
declarations?  Given function types (parameter and return value), can
the rest generally be inferred?  How would these types play with the
Cap'n Proto types? What about subtyping? What about contravariance?

It is possible that **Typed TinySES** can be soundly statically typed
without implicit runtime checks, but we have not yet investigated
this. The distributed messages of **Tiny Dr.SES** are likely to be
typed, hopefully using the same type system, so that **Typed Tiny
Dr.SES** will be straightforward.
