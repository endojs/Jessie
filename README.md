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

The following diagram illustrates the subsetting relationship between
various subsets of EcmaScript. The vertical dimension represents
syntactic subsetting by static means. The horizontal dimension
represents semantic subsetting by either static or dynamic means. The
word cloud in the contour between each language and its subset
represents the features of the containing language omitted by that
next smaller subset. The relative sizes of feature names reflects only
their explanatory significance.

![EcmaScript subsets Venn diagram](docs/ecmascript-subsets-solid.png
 "EcmaScript subsets Venn diagram")

<p align="center"><b>JSON</b> &lt;SA <b>TinySES</b> &lt;SA <b>SES</b>
  &lt;DA <b>ES-strict</b> &lt;SDA <b>EcmaScript</b></p>

Each step needs to be explained. Proceeding from larger to smaller.

**EcmaScript** code may be in either strict mode or sloppy mode, so
the **ES-strict** sublanguage is a static, dynamic, absorbed subset of
full EcmaScript by definition. (Historically, the strict sublanguage
started by approximating a static and dynamic subset of the sloppy
language, excluding `with` and throwing errors where the sloppy
language would instead silently act insane. But this approximation has
too many exceptions to remain useful.) EcmaScript classes and modules
are implicitly strict, so the vestigial sloppy language is best seen
as an EcmaScript 3 compatibility mode.

Unlike full EcmaScript, ES-strict is statically scoped, ES-strict
functions are strongly encapsulated, and implicit access to the global
object is severely restricted. These are necessary steps towards ocap
safety, but are not sufficient by themselves.

**SES**, or *Secure EcmaScript*, is a dynamic, absorbed subset of
ES-strict. To achieve this subsetting, SES builds on [Frozen
Realms](https://github.com/tc39/proposal-frozen-realms/) which builds
on [Realms](https://github.com/tc39/proposal-realms/). (Shims at
[Realms
shim](https://github.com/tc39/proposal-realms/tree/master/shim) and
[Frozen Realms
shim](https://github.com/tc39/proposal-frozen-realms/tree/master/shim).)
SES statically accepts all programs accepted by ES-strict and can run
on ES-strict without internal modification.

Via Realms, SES removes ambient authority from the global scope, so
attempts to dereference a variable named, for example, `document` that
might succeed in ES-strict on a given host might instead throw a
`ReferenceError` within a SES environment run on that host. Via Frozen
Realms, SES freezes the primordials, so mutations that would succeed
in ES-strict might instead throw a `TypeError` in SES.

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
is in TinySES and provide sound static analysis info for that code.

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

TinySES omits the `RegularExpressionLiteral`. Some TinySES
environments may instead include the
[`RegExp.make`](https://github.com/mikesamuel/regexp-make-js) template
string tag. By omitting `RegularExpressionLiteral` and automatic
semicolon insertion, our lexical grammar avoids the context
dependencies that are most difficult for JavaScript lexers.

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

TinySES omits computed property names. TinySES has syntax for mutating
only number-named properties, which include integers, floating point,
`NaN`, `Infinity`, and `-Infinity`. TinySES omits syntactic support
for mutating other property names. TinySES has syntax for computed
lookup and mutation of number-named properties, but not other property
names. However, some TinySES environments may provide access to the
`Reflect` API, enabling explicit reflective property access.

TinySES includes arrow functions, `function` functions, concise method
syntax, and accessor (getter / setter) syntax.  TinySES omits
generators, async functions, async iterator functions in all their
syntactic forms: `function` functions, arrow functions, and concise
method syntax. TinySES omits symbols and general computed property
access.

The TinySES `switch` statement grammar requires that all cases be
terminated by a terminating statement, `return`, `break`, `continue`
or `throw`, avoiding a perpetually annoying hazard of C-like
languages.

All control-flow branches, including `switch` cases, must be blocks,
not naked statements, avoiding hazards and giving each branch its own
lexical block scope.

TinySES has no for/in statement, and so does not inherit the
non-determinism regarding property modification during for/in
enumeration. Everything useful about for/in is still available by
reflection but without this non-determinism issue.


## Additional Static Restrictions of TinySES


The following static restrictions are specified as if they occur
post-parsing, by analyzing the abstract syntax tree.

The ES-strict `eval` can be used for both direct and indirect
eval. SES and TinySES both support indirect eval. The Realms and
Frozen Realms shims cannot support direct eval. Direct eval can only
be supported once platforms provide native support for Realms. Till
then, to avoid confusion, SES and TinySES implementations will omit
the syntax of direct eval. However, this syntax remains part of SES as
specified. TinySES omits direct eval by design.

SES can create objects whose API surface is not tamper-proofed and
expose these to clients. This is easy to do accidentally, and
hazardous when it happens. Even if the object was designed to be
directly mutated by its clients, any client may freeze the object,
preventing other clients from directly mutating it. Further, no purely
static type system for EcmaScript can be both useful and sound in the
face of the pervasive possibility of reflective property mutation.

To enable sound static reasoning, in TinySES all objects made by
literal expressions (object literals, array literals, the many forms
of function literals) must be tamper-proofed with `def` before they
can be aliased or escape from their static context of origin. Thus,
direct property mutation can only be used to prepare an object for
release. Use of `def` then marks the object as being ready for use by
its clients, who are thereby unable to mutate its properties. During
an object's initialization phase, due to the lack of aliasing, each
mutation can be reasoned about as-if it replaces the object in place
with a derived object holding the new property.

Looking up a function in an array and calling it would naturally be
coded as

```js
array[+i](arg)
```

However, if the called function were written in SES it could use
`this` to capture the array itself. To protect against this, TinySES
statically rejects this call, forcing the programmer to write instead
something like

```js
(1,array[+i])(arg)
```

which is safe. However, the TinySES programmer might still encounter
this hazard if storing a SES function on a named field of a
record, looking it up by name and immediately calling it:

```js
record.field(args)
```

This would still give the SES function access to the record as its
`this` argument. We need sound static type checking to prevent this
case while allowing this syntax in general.


## Caveats

### Anticipating future EcmaScript changes

The [`import` expression]() and [`import.meta` expression]()
proposals, by themselves, introduce a security hole in JavaScript. The
[Realm proposal](https://github.com/tc39/proposal-realms)'s traps
provide the mechanism needed to plug these holes. On those platforms
provide either of the security breaking features but not providing
native support for Realms, Realms, Frozen Realms, and SES can only be
shimmed at the price of a full parse. This is the current situation on
some browsers.


Beyond subsetting EcmaScript, the TinySES grammar also includes the
infix bang `!` (eventually) operator from Dr.SES. We hope infix bang
`!` will become part of the standard EcmaScript grammar. But until
then, infix bang `!` trivially transpiles into calls to the Dr.SES
extended promise API. See [Distributed Electronic Rights in
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
can be called by SES code with `new`. Without `this` it is hard to see how
this could confuse a `function` function, but I am not yet confident
that this does not produce a hazard for the TinySES code.

### Possible changes to the current TinySES definition

Once EcmaScript supports BigInts, SES and TinySES will as well. Thus
we need to add the bitwise operators back into the TinySES grammar. In
fact, these was no good reason to omit them.

Should we add do/while back into the TinySES grammar? There's no
hazard here. We omitted it just for minimalism.

TODO: We must ensure that code containing ``"<!--"`` or ``"-->"`` that
could be parsed as an [html comment according to the EcmaScript
Appendix B
grammar](http://www.ecma-international.org/ecma-262/8.0/#sec-html-like-comments)
is instead statically rejected. Otherwise the same source may parse
differently on different platforms, or even as script vs module code
on the same platform.


## "Typed TinySES" and "Typed Tiny Dr.SES"


Can TinySES be soundly statically typed with a structural type system?
What about trademarks/nominal-types and auditors? How would this map
to the wasm type system which does tag checking but no deep
parameterized type checking?  If static checking makes sense, should
we add some of TypeScript's or Flow's syntax for optional type
declarations? Let's call such a variant ***Typed TinySES***. Given
declared function types for parameters and return values, can Typed
TinySES infer the rest?  How would these types play with the Cap'n
Proto types? What about subtyping? What about contravariance?

It is plausible that Typed TinySES can be soundly statically typed
without implicit runtime checks, but we have not yet verified
this. The distributed messages of **Tiny Dr.SES** are likely to be
typed, to be explicit about what API dependencies are exposed as
protocols on the wire. These two purposes should use the same type
system, so that **Typed Tiny Dr.SES** can be simpler.
