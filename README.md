# Jessie, simple universal safe mobile code

***This document is an early draft. Comments appreciated! Thanks.***

Today, JavaScript is the pervasive representation for (somewhat) safe
mobile code. For another representation to achieve universality
quickly, it must be a subset of JavaScript, and so runs at least
everywhere JavaScript runs.

Whereas JSON is a simple universal representation for safe mobile
data, Jessie is a simple universal representation for safe mobile data
and behavior.

Jessie is a small safe ocap subset of JavaScript that
   * is pleasant and expressive to program in,
   * can easily run within a JavaScript system,
   * can be safely linked with adversarial SES code,
   * can be easily implemented for standalone use,
   * can be transmitted as lightweight safe mobile code,
   * is amenable to a range of static analysis,
   * omits most of JavaScript's bad parts,
   * non-experts can use to write non-trivial non-exploitable
     smart contracts.


##  Subsetting EcmaScript

Unless stated otherwise, all references to EcmaScript refer to
[EcmaScript 2017](http://www.ecma-international.org/ecma-262/8.0/),
the eighth edition of the standard.

![EcmaScript subsets Venn diagram](docs/jessie.png
 "EcmaScript subsets Venn diagram")

<p align="center"><b>JSON</b> &lt;SA <b>Jessie</b> &lt;DAT
  <b>TinySES</b> &lt;SA <b>SES</b> &lt;DA <b>ES-strict</b> &lt;SDA
  <b>EcmaScript</b></p>

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
language can be run as code in the larger language without
modification. A smaller language
which is not absorbed may often be *transpiled* (<T) into the larger
language by source-to-source transformation.

The diagram above illustrates the subsetting relationship between
various subsets of EcmaScript. The vertical dimension represents
syntactic subsetting by static means. The horizontal dimension
represents semantic subsetting by either static or dynamic means. The
word cloud in the contour between each language and its subset
represents the features of the containing language omitted by that
next smaller subset. The relative sizes of feature names reflects only
their explanatory significance.

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
shim](https://github.com/Agoric/realms-shim) and
[Frozen Realms
shim](https://github.com/tc39/proposal-frozen-realms/tree/HEAD/shim).)
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
the smallest useful subset of SES that is still pleasant to program in
using the objects-as-closures pattern. TinySES omits `this` and
classes. Once initialized, the API surface of a TinySES object must be
tamper-proofed before exposure to clients.  TinySES is not intended to
run legacy code or code that uses inheritance.

**Jessie** is a dynamic subset of TinySES. Jessie and TinySES have the
same grammar and static restrictions. The Jessie grammar is simple
enough to be parsed easily. Jessie imposes static validation rules
that are easy to check locally, to ensure that objects are
tamper-proofed before they escape.  Statically valid Jessie programs
enable sound static analysis of useful safety properties. A SES IDE
can thereby flag which code is withiin the Jessie static restrictions
and provide sound static analysis info for that code.

The only difference between TinySES and Jessie is that correct TinySES
programs may rely on the presence of the [entire SES
runtime](https://github.com/Agoric/SES/blob/HEAD/src/bundle/whitelist.js).
Correct Jessie programs may only rely on a [minimal subset of the SES
runtime](https://github.com/endojs/Jessie/blob/HEAD/src/bundle/whitelist.js)
that standalone Jessie implementations can implement for reasonable
effort. However, correct Jessie programs also cannot rely on the
*absence* of the rest of the SES runtime. Jessie and TinySES programs
may be linked with programs written in SES, and so may rely on SES's ocap
rules to constrain these other programs.

Thus, every correct Jessie program is also a correct TinySES and SES program,
and works unmodified within a SES environment run on a normal JavaScript
implementation. Correct Jessie programs will also run on a standalone
implementation of Jessie (which still needs to obey SES's ocap rules) in which
it is linked only with other Jessie code.

**JSON** is a static, absorbed subset of all the languages above. JSON
achieved universal adoption because
   * it was a subset of JavaScript, which was already pervasive
   * it was easy to implement on any language and any platform

Likewise, Jessie is small enough to be easily implemented as a
compiler or interpreter in a wide range of other languages and
platforms. Its character resembles a simple Scheme with records.


## Jessie as a subset of SES


The [Jessie grammar](https://github.com/agoric-labs/jessica#grammar) is based on the [ECMAScript 2017
Grammar
Summary](http://www.ecma-international.org/ecma-262/8.0/#sec-grammar-summary).
Unlike the Ecma page, lexical productions in the Jessie grammar are
named in all upper case.

Unlike EcmaScript and SES, Jessie has no semicolon insertion, and so
does not need a parser able to handle that. However, Jessie must
impose the `NO_NEWLINE` constraints from EcmaScript, so that every
non-rejected Jessie program is accepted as the same SES
program. `NO_NEWLINE` is a lexical-level placeholder that must
never consume anything. It should fail if the whitespace to skip
over contains a newline. TODO: Currently this placeholder always
succeeds.

Jessie omits the `RegularExpressionLiteral`. Some Jessie
environments may instead include the
[`RegExp.make`](https://github.com/mikesamuel/regexp-make-js) template
string tag. By omitting `RegularExpressionLiteral` and automatic
semicolon insertion, our lexical grammar avoids the context
dependencies that are most difficult for JavaScript lexers.

In Jessie, all reserved words are unconditionally reserved. By
contrast, in EcmaScript and SES, `yield`, `await`, `implements`, etc
are conditionally reserved. Thus we avoid the need for parameterized
lexical-level productions.

Jessie omits both the `in` expression and the for/in loop,
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
grammar to avoid unbounded lookahead. Because Jessie grammar is
defined using a PEG (parsing expression grammar) which supports
unbounded lookahead, we avoid the need for a cover grammar. TODO:
Determine where difficulties arise parsing according to this Jessie
grammar with bounded lookahead. If difficult, we may reintroduce a
cover grammar.

Jessie array literals omit elision (i.e., nothing between
commas).

Jessie treats `async`, `arguments`, and `eval` as reserved keywords.
Strict mode already limits `arguments` and `eval` to the point that
they are effectively keywords in strict code.  Jessie does include
ellipses `...` both as rest and spread, which provides the useful
functionality of `arguments` with less confusion.

Jessie omits mutation through computed property names. Jessie has syntax
for mutating only number-named properties, which include integers,
floating point, `NaN`, `Infinity`, and `-Infinity`. Jessie omits syntactic
support for mutating other property names, except when preparing an object
for delivery (before it is staticly required to be hardened).  However, the
SES environment provides access to the `Reflect`
API, enabling explicit reflective property access. TinySES programs
may rely on `Reflect` to manipulate properties via EcmaScript property
descriptors. Jessie programs may not rely on the presence or absence
of `Reflect` or other elements of the SES runtime. Jessie programs
thus cannot use property descriptors, but must assume that the code it
is linked with may.

Jessie includes arrow functions, `function` functions, concise method
syntax, and accessor (getter / setter) syntax.  Jessie omits
generators, async functions, async iterator functions in all their
syntactic forms: `function` functions, arrow functions, and concise
method syntax. Jessie omits symbols and general computed property
access.

The Jessie `switch` statement grammar requires that all cases be
terminated by a terminating statement, `return`, `break`, `continue`
or `throw`, avoiding a perpetually annoying hazard of C-like
languages.

All control-flow branches, including `switch` cases, must be blocks,
not naked statements, avoiding hazards and giving each branch its own
lexical block scope.

Jessie has no for/in statement, and so does not inherit the
non-determinism regarding property modification during for/in
enumeration. Everything useful about for/in is still available by
`Object.keys`, `Object.values` and `Object.entries`,  (or in TinySES
through reflection) but without this non-determinism issue.


## Additional Dynamic Restrictions of SES


The Realms and Frozen Realms shims are designed to accommodate
initialize-time vetted shim code, to customize the realm's primordials
prior to freezing. A component of SES is just such a shim, which
customizes the primordials to better support defensive
programming. In Frozen Realms by themselves, even when the primordials
are frozen, the instances of
`Set`, `Map`, `WeakSet`, `WeakMap`, and `Promise` have mutable own
properties. This mutability of their API surface does not help them
serve the purpose of these abstractions, but does present opportunity
for one piece of code to confuse another. The SES shim wraps these
constructors to freeze their instances before returning them.

For `Promise` we also need to ensure that new promises made by promise
operations are similarly frozen. We use the `constructor` species mechanism
when we can. Otherwise, we also wrap the relevant `Promise` methods to
return frozen promises.

## Additional Static Restrictions of Jessie


The following static restrictions are specified as if they occur
post-parsing, by analyzing the abstract syntax tree.

### No Direct eval

The ES-strict `eval` can be used for both direct and indirect
eval. SES, TinySES, and Jessie all support indirect eval. The Realms
shim cannot support direct eval. Direct eval can only be supported
once platforms provide native support for Realms. Till then, to avoid
confusion, SES, TinySES, and Jessie implementations omit the syntax of
direct eval. However, this syntax remains part of SES as
specified. TinySES and Jessie omit direct eval by design.

### Must freeze API Surface Before Use.

SES can create objects whose API surface is not tamper-proofed and
expose these to clients. This is easy to do accidentally, and
hazardous when it happens. Even if the object was designed to be
directly mutated by its clients, any client may freeze the object,
preventing other clients from directly mutating it. Further, no purely
static type system for EcmaScript can be both useful and sound in the
face of the pervasive possibility of reflective property mutation.

To enable sound static reasoning, in Jessie all objects made by
literal expressions (object literals, array literals, the many forms
of function literals) must be tamper-proofed with `harden` before they
can be aliased or escape from their static context of origin. Thus,
direct property mutation can only be used to prepare an object for
release. Use of `harden` then marks the object as being ready for use by
its clients, who are thereby unable to mutate its properties. During
an object's initialization phase, due to the lack of aliasing, each
mutation can be reasoned about as-if it replaces the object in place
with a derived object holding the new property.


### Avoid this-capture Hazards


Looking up a function in an array and calling it would naturally be
coded as

```js
array[+i](arg)
```

However, if the called function were written in SES it could use
`this` to capture the array itself. To protect against this, Jessie
statically rejects this call, forcing the programmer to write instead
something like

```js
(1,array[+i])(arg)
```

which is safe. However, the Jessie programmer might still encounter
this hazard if storing a SES function on a named field of a
record, looking it up by name and immediately calling it:

```js
record.field(args)
```

This would still give the SES function access to the record as its
`this` argument. We need sound static type checking to prevent this
case while allowing this syntax in general.


### No Global Objects or Compartments


SES code can access the per-compartment global object using the same
syntax that JavaScript has always used to access the per-realm global
object --- a top-level `this`. Like E, Jessie code has no notion of a
global object, and so is statically prohibited from naming it. Thus,
Jessie does not need SES's notion of "compartment".


### Limited Global Scope


All the SES whitelisted globals are safe to provide to TinySES
code. However, we omit some of these from the definition of Jessie,
like `RegExp` and `Date`, to reduce the effort needed to implement a
standalone Jessie on a non-JavaScript host.


### No Top-level Mutability


In JavaScript, module instances can have top-level mutable
state. Thus, if modules A and B both `import` or `require` module C, A
and B can communicate with each other via C. Thus, each SES
compartment needs its own loader. By contrast, Jessie has no
loader. Instead, Jessie modules have no top-level mutability, and all
exported values must be tamper-proofed. [A Capability-Based Module
System for Authority
Control](http://reports-archive.adm.cs.cmu.edu/anon/home/anon/isr2017/CMU-ISR-17-106R.pdf),
explains why such module instances safe to share between mutually
suspicious objects. Indeed, Jessie modules can be seen as a immutable
extension of a Frozen Realm's immutable primordials.


## Caveats


### SES and Jessie Libraries


SES will bundle some convenience libraries to support ocap programming
patterns, such as a [membrane
library](https://github.com/ajvincent/es-membrane). However, since
these are additions to standard JavaScript, they are not shown on the
subsetting diagram.

Although `Proxy` itself is not available in Jessie, the membrane
library built on `Proxy` and `WeakMap` is. A standalone Jessie
implementation can directly provide a membrane library adequate for
standalone Jessie use without implementing `Proxy`.


### TinySES Admits Mutable Arrays.


For the goals of SES, we cannot freeze arrays before releasing them to
clients. Such freezing would break tremendous amounts of legacy code
unnecessarily. Handing out mutable arrays, and mutating them, violates
no ocap principles. However, TinySES cannot soundly statically type
objects whose properties can be arbitrarily mutated and
overridden. Thus, TinySES can only type arrays that are made directly
by TinySES array literals, or those that TinySES code tamper-proofs
immediately when obtaining a fresh array from builtins like
`Array.prototype.map`. In the following legal TinySES code

```js
harden(harden([x, y, x]).map(f))
```

if TinySES knows that the array produced by `.map` is pristine and
fresh, it could soundly consider it a typed frozen object with no
extraneous or overriding properties. However, keeping track of such
freshness requires more type mechanism than we wish to require for
TinySES.

Without the outer `harden` the code above is still valid TinySES
code. But TinySES would consider the resulting value to be as untyped
as values received from SES code.


### Anticipating future EcmaScript changes

The [`import` expression]() and [`import.meta` expression]()
proposals, by themselves, introduce a security hole in JavaScript. The
[Realm proposal](https://github.com/tc39/proposal-realms)'s traps
provide the mechanism needed to plug these holes. On those platforms
that provide either of the security breaking features but do not provide
native support for Realms, safety can only be shimmed at the price of
a full parse. This is the current situation on some browsers.

Beyond subsetting EcmaScript, the Jessie grammar also includes the
infix tildot `~.` (eventually) operator (like `!` from Dr.SES). We hope infix tildot
`~.` will become part of the standard EcmaScript grammar. But until
then, infix tildot `~.` trivially transpiles into calls to the Dr.SES
extended promise API. See [Distributed Electronic Rights in
JavaScript](http://research.google.com/pubs/pub40673.html).

We will add BigInt to Jessie, even though it will only be in
EcmaScript well after ES2017.

### Exceptions to the subsetting claims

Freezing the primordials does more that just turn non-errors into
errors. It also changes how reflection describes these properties and
objects. Thus, SES and Jessie are technically not subsets of
ES-strict for programs using reflection, since these differences
are detectable by means other than errors.

### Remaining hazards

Arrow functions and concise methods have a [[Call]] behavior and no
[[Construct]] behavior, preventing them from being called as a
constructor, such as with `new`. However, Jessie `function` functions
can be called by SES code with `new`. Without `this` it is hard to see how
this could confuse a `function` function, but I am not yet confident
that this does not produce a hazard for the Jessie code.

### Possible changes to the current Jessie definition

Once EcmaScript supports BigInts, SES and Jessie will as well. Thus
we need to add the bitwise operators back into the Jessie grammar. In
fact, there was no good reason to omit them.

Should we add `do/while` back into the Jessie grammar? There's no
hazard here. We omitted it just for minimalism.

TODO: We must ensure that code containing ``"<!--"`` or ``"-->"`` that
could be parsed as an [html comment according to the EcmaScript
Appendix B
grammar](http://www.ecma-international.org/ecma-262/8.0/#sec-html-like-comments)
is instead statically rejected. Otherwise the same source may parse
differently on different platforms, or even as script vs module code
on the same platform.


### "Typed Jessie" and "Typed Distributed Jessie"

Can Jessie be soundly statically typed with a structural type system?
What about trademarks/nominal-types and auditors? How would this map
to the wasm type system which does tag checking but no deep
parameterized type checking?  If static checking makes sense, should
we add some of TypeScript's or Flow's syntax for optional type
declarations? Let's call such a variant ***Typed Jessie***. Given
declared function types for parameters and return values, can Typed
Jessie infer the rest?  How would these types play with the Cap'n
Proto types? What about subtyping? What about contravariance?

It is plausible that Typed Jessie can be soundly statically typed
without implicit runtime checks, but we have not yet verified
this. The distributed messages of **Distributed Jessie** are likely to
be typed, to be explicit about what API dependencies are exposed as
protocols on the wire. These two purposes should use the same type
system, so that **Typed Distributed Jessie** can be simpler.


### Jessie and mechanized static reasoning

[Defensive JavaScript (DJS)](http://www.defensivejs.com/)
and
[ProScript](https://github.com/Inria-Prosecco/proscript-messaging), as
subsets similar in many way to Jessie, built to support mechanized
formal reasoning by translation to
[ProVerif](http://prosecco.gforge.inria.fr/personal/bblanche/proverif/).
However, the designs are somewhat different, as are the goals of the
formal reasoning. TODO: Investigate whether Jessie could repurpose
this work. Is the intersection of Jessie and DJS a reasonable language
for us? Could Jessie be translated to ProVerif in a similar manner? Is
ProVerif helpful for verifying the security properties we are
interested in verifying?
