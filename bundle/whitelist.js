// Copyright (C) 2011 Google Inc.
// Copyright (C) 2018 Agoric
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Exports {@code ses.whitelist}, a recursively defined
 * JSON record enumerating all the naming paths in the ES5.1 spec,
 * those de-facto extensions that we judge to be safe, and SES and
 * Dr. SES extensions provided by the SES runtime.
 *
 * <p>Assumes only ES3. Compatible with ES5, ES5-strict, or
 * anticipated ES6.
 *
 * //provides ses.whitelist
 * @author Mark S. Miller,
 * @overrides ses, whitelistModule
 */

/**
 * <p>Each JSON record enumerates the disposition of the properties on
 * some corresponding primordial object, with the root record
 * representing the global object. For each such record, the values
 * associated with its property names can be
 * <ul>
 * <li>Another record, in which case this property is simply
 *     whitelisted and that next record represents the disposition of
 *     the object which is its value. For example, {@code "Object"}
 *     leads to another record explaining what properties {@code
 *     "Object"} may have and how each such property, if present,
 *     and its value should be tamed.
 * <li>true, in which case this property is simply whitelisted. The
 *     value associated with that property is still traversed and
 *     tamed, but only according to the taming of the objects that
 *     object inherits from. For example, {@code "Object.freeze"} leads
 *     to true, meaning that the {@code "freeze"} property of {@code
 *     Object} should be whitelisted and the value of the property (a
 *     function) should be further tamed only according to the
 *     markings of the other objects it inherits from, like {@code
 *     "Function.prototype"} and {@code "Object.prototype").
 *     If the property is an accessor property, it is not
 *     whitelisted (as invoking an accessor might not be meaningful,
 *     yet the accessor might return a value needing taming).
 * <li>"maybeAccessor", in which case this accessor property is simply
 *     whitelisted and its getter and/or setter are tamed according to
 *     inheritance. If the property is not an accessor property, its
 *     value is tamed according to inheritance.
 * <li>"*", in which case this property on this object is whitelisted,
 *     as is this property as inherited by all objects that inherit
 *     from this object. The values associated with all such properties
 *     are still traversed and tamed, but only according to the taming
 *     of the objects that object inherits from. For example, {@code
 *     "Object.prototype.constructor"} leads to "*", meaning that we
 *     whitelist the {@code "constructor"} property on {@code
 *     Object.prototype} and on every object that inherits from {@code
 *     Object.prototype} that does not have a conflicting mark. Each
 *     of these is tamed as if with true, so that the value of the
 *     property is further tamed according to what other objects it
 *     inherits from.
 * <li>false, which suppresses permission inherited via "*".
 * </ul>
 *
 * <p>TODO: We want to do for constructor: something weaker than '*',
 * but rather more like what we do for [[Prototype]] links, which is
 * that it is whitelisted only if it points at an object which is
 * otherwise reachable by a whitelisted path.
 *
 * <p>The members of the whitelist are either
 * <ul>
 * <li>(uncommented) defined by the ES5.1 normative standard text,
 * <li>(questionable) provides a source of non-determinism, in
 *     violation of pure object-capability rules, but allowed anyway
 *     since we've given up on restricting JavaScript to a
 *     deterministic subset.
 * <li>(ES5 Appendix B) common elements of de facto JavaScript
 *     described by the non-normative Appendix B.
 * <li>(Harmless whatwg) extensions documented at
 *     <a href="http://wiki.whatwg.org/wiki/Web_ECMAScript"
 *     >http://wiki.whatwg.org/wiki/Web_ECMAScript</a> that seem to be
 *     harmless. Note that the RegExp constructor extensions on that
 *     page are <b>not harmless</b> and so must not be whitelisted.
 * <li>(ES-Harmony proposal) accepted as "proposal" status for
 *     EcmaScript-Harmony.
 * </ul>
 *
 * <p>With the above encoding, there are some sensible whitelists we
 * cannot express, such as marking a property both with "*" and a JSON
 * record. This is an expedient decision based only on not having
 * encountered such a need. Should we need this extra expressiveness,
 * we'll need to refactor to enable a different encoding.
 *
 * <p>We factor out {@code true} into the variable {@code t} just to
 * get a bit better compression from simple minifiers.
 */
export function buildWhitelist() {
  "use strict";

  var t = true;
  var j = true;  // included in the Jessie runtimef

  const whitelist = {
    cajaVM: {                        // Caja support
      Nat: j,
      def: j,

      confine: j,
    },

    // In order according to
    // http://www.ecma-international.org/ecma-262/ with chapter
    // numbers where applicable

    // 18 The Global Object

    Infinity: j,
    NaN: j,
    undefined: j,

    // 19 Fundamental Objects

    Object: {  // 19.1
      freeze: j,
      is: j,                         // ES-Harmony
      preventExtensions: j,
      seal: j,
    },

    Function: {  // 19.2
    },

    Boolean: {  // 19.3
    },

    // 20 Numbers and Dates

    Number: {  // 20.1
      isFinite: j,                   // ES-Harmony
      isNaN: j,                      // ES-Harmony
      isSafeInteger: j,              // ES-Harmony
      MAX_SAFE_INTEGER: j,           // ES-Harmony
      MIN_SAFE_INTEGER: j,           // ES-Harmony
    },

    Math: {  // 20.2
      E: j,
      PI: j,

      abs: j,
      ceil: j,
      floor: j,
      max: j,
      min: j,
      round: j,
      trunc: j                       // ES-Harmony
    },

    // 21 Text Processing

    String: {  // 21.2
      fromCharCode: j,
      raw: j,                        // ES-Harmony
      prototype: {
        endsWith: j,                 // ES-Harmony
        indexOf: j,
        lastIndexOf: j,
        slice: j,
        startsWith: j,               // ES-Harmony
    },

    // 22 Indexed Collections

    Array: {  // 22.1
      from: j,
      of: j,                         // ES-Harmony?
      prototype: {
        filter: j,
        forEach: j,
        indexOf: j,
        lastIndexOf: j,
        map: j,
        pop: j,
        push: j,
        reduce: j,
        reduceRight: j,
        slice: j,
      }
    },

    // 23 Keyed Collections          all ES-Harmony

    Map: {  // 23.1
      prototype: {
        clear: j,
        delete: j,
        entries: j,
        forEach: j,
        get: j,
        has: j,
        keys: j,
        set: j,
        values: j
      }
    },

    Set: {  // 23.2
      prototype: {
        add: j,
        clear: j,
        delete: j,
        entries: j,
        forEach: j,
        has: j,
        keys: j,
        values: j
      }
    },

    WeakMap: {  // 23.3
      prototype: {
        // Note: coordinate this list with maintenance of repairES5.js
        delete: j,
        get: j,
        has: j,
        set: j
      }
    },

    WeakSet: {  // 23.4
      prototype: {
        add: j,
        delete: j,
        has: j
      }
    },

    // 24.4 TODO: Omitting Atomics for now

    JSON: {  // 24.5
      parse: j,
      stringify: j
    },

    Promise: {  // 25.4
      all: j,
      race: j,
      reject: j,
      resolve: j,
      prototype: {
        then: j,
      }
    }
  };

  return whitelist;
}
