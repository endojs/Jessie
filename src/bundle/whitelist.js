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
 * Based on https://github.com/Agoric/SES/blob/master/src/bundle/whitelist.js
 *
 * @author Mark S. Miller,
 */
export function buildWhitelist() {
  "use strict";

  var j = true;  // included in the Jessie runtime
  
  // These are necessary for most Javascript environments.
  const anonIntrinsics = {
    ThrowTypeError: {},
    IteratorPrototype: {
      next: '*',
      constructor: false,
    },
    ArrayIteratorPrototype: {},
    StringIteratorPrototype: {},
    MapIteratorPrototype: {},
    SetIteratorPrototype: {},

    GeneratorFunction: {},
    AsyncGeneratorFunction: {},
  };

  const namedIntrinsics = {
    // In order according to
    // http://www.ecma-international.org/ecma-262/ with chapter
    // numbers where applicable

    // 18 The Global Object

    Infinity: j,
    NaN: j,
    undefined: j,

    eval: j, // realms-shim depends on having indirect eval in the globals

    // 19 Fundamental Objects

    Object: {  // 19.1
      freeze: j,
      is: j,                         // ES-Harmony
      preventExtensions: j,
      seal: j,
      entries: j,
      keys: j,
      values: j,
      prototype: {
        toString: '*',
      },
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
        charCodeAt: j,
        endsWith: j,                 // ES-Harmony
        indexOf: j,
        lastIndexOf: j,
        slice: j,
        split: j,
        startsWith: j,               // ES-Harmony

        length: '*',
      }
    },

    // 22 Indexed Collections

    Array: {  // 22.1
      from: j,
      isArray: j,
      of: j,                         // ES-Harmony?
      prototype: {
        filter: j,
        forEach: j,
        indexOf: j,
        join: j,
        lastIndexOf: j,
        map: j,
        pop: j,
        push: j,
        reduce: j,
        reduceRight: j,
        slice: j,

        // 22.1.4 instances
        length: '*',
      },
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
        catch: j,
        then: j,
      }
    },
  };

  return {namedIntrinsics, anonIntrinsics};
}
