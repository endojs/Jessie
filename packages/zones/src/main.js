import harden from '@lib-jessie/harden';
import buildTable from '@lib-jessie/harden/src/buildTable.js';

/**
 * CAVEAT!
 * As with the rest of lib-jessie, the protect and suspect zone helpers are
 * only effective when run under SES.
 */

/**
 * The design of the `protect(x)` and `suspect(x)` functions is based on
 * `wrap(x)`, which installs a proxy wrapper around `x` and
 * associates it with a Zone (if x was not already wrapped).  If used
 * in a `suspect` call, the Zone will not be isSuspected(zone), and the wrapped object
 * is not hardened.  For `protect` calls, the Zone will be !isSuspected(zone),
 * and the object will also be hardened.
 * 
 * If an object is entering this Zone (unwrap(x)), proxies are unwrapped if
 * their Zone matches, otherwise any proxies are retained.  This helps preserve object
 * identity for simple cases where objects are created and consumed by a `protect`ed
 * function.
 * 
 * Zones are used both to control wrapping and unwrapping, and to detect when a
 * proxy from a protected Zone has been captured as a `this`-value for a method
 * belonging to a foreign (suspected or not) Zone.  The default behaviour is
 * to throw when this happens.
 */

/**
 * @typedef {Object} Zone An identity designating a protection zone
 */

/**
 * @type {Zone} The Zone for trust roots.
 */
const NEUTRAL_ZONE = harden({ toString() { return 'NEUTRAL_ZONE'; }});

let lastCreatedZone = 0;

/**
 * Contagiously harden a value and mark it as being from a fresh Zone.
 *
 * @template T
 * @param {T} x any value
 * @returns {T} a hardened and protected value in a fresh Zone, who contagiously begets objects of the same kind
 */
export const protect = harden(x => {
  lastCreatedZone += 1;
  const myZone = `PROTECTED_ZONE[${lastCreatedZone}]`;
  const protectedZone = harden({ toString() { return myZone; }});
  return wrapWithZone(x, protectedZone);
});

/**
 * @type {WeakSet<Zone>}
 */
let suspectedZones;

const isSuspectedZone = harden(zone => suspectedZones.has(zone));

/**
 * Contagiously mark a value as being from a suspected Zone.
 *
 * @template T
 * @param {T} x any value
 * @returns {T} a value in the SUSPECTED_ZONE
 */
export const suspect = harden(x => {
  if (!suspectedZones) {
    // Create the set here, after XS's lockdown is past.
    suspectedZones = new WeakSet;
  }
  lastCreatedZone += 1;
  const myZone = `SUSPECTED_ZONE[${lastCreatedZone}]`;
  const suspectedZone = harden({ toString() { return myZone; }});
  suspectedZones.add(suspectedZone);
  return wrapWithZone(x, suspectedZone);
});

/**
 * @type {WeakMap<object,any>}
 */
let objToProxy;

/**
 * @type {WeakMap<object,Zone>}
 */
let proxyToZone;

/**
 * @type {WeakMap<object,object>}
 */
let proxyToObj;

let inited = false;

/**
 * We initialize here to accomodate XS, which doesn't currently like
 * creating WeakMaps at the module level.
 */
function initializeModule() {
  objToProxy = new WeakMap;
  proxyToZone = new WeakMap;
  proxyToObj = new WeakMap;

  /**
   * As a special exception to this protection mechanism, reachable values
   * on the SES whitelist are considered to be already in the NEUTRAL_ZONE.
   */
  const g = Function('return this')();
  for (const root of buildTable(g).values()) {
    objToProxy.set(root, root);
    proxyToZone.set(root, NEUTRAL_ZONE);
  }
}

/**
 * A Proxy handler that always throws.
 */
const alwaysThrowHandler = new Proxy({}, {
  get(_target, p, _receiver) {
    throw TypeError(`Unexpected proxy trap ${p}`);
  },
});

/**
 * Return the argument.
 * @template T
 * @param {T} x2
 * @returns {T}
 */
const identity = x2 => x2;

/**
 * @type {[typeof identity, typeof identity]}
 */
let parentHooks = [identity, identity];

const wrapWithZone = harden((x, zone) => {
  if (Object(x) !== x || x === null) {
    // Primitive value.
    return x;
  }

  if (!inited) {
    initializeModule();
    inited = true;
  }

  const alreadyWrapped = objToProxy.get(x);
  if (alreadyWrapped) {
    return alreadyWrapped;
  }

  /**
   * @type {typeof identity}
   */
  let unwrap;

  /**
   * @type {typeof identity}
   */
  let wrap;

  if (isSuspectedZone(zone)) {
    // A suspected zone doesn't contribute to the wrappers.
    wrap = identity;
    unwrap = identity;
  } else {
    // Not a suspected zone, so wrap and unwrap.
    wrap = x2 => wrapWithZone(x2, zone);
    unwrap = x2 => {
      if (proxyToZone.get(x2) === zone) {
        return proxyToObj.get(x2);
      }
      return x2;
    };
  }
  
  const subCall = (fn, ...args) => {
    // Our parent can wrap our unhandled arguments,
    // then we can unwrap the ones meant for us.
    const ourParentHooks = parentHooks;
    const [parentWrap, parentUnwrap] = ourParentHooks;
    const wrappedArgs = parentWrap(args).map(unwrap);

    // Now mutate parentHooks.
    parentHooks = [wrap, unwrap];
    try {
      // We wrap our return, or thrown values,
      // and unwrap for our parent.
      return parentUnwrap(wrap(fn(...wrappedArgs)));
    } catch (e) {
      // or thrown values.
      throw parentUnwrap(wrap(e));
    } finally {
      // We restore our parent's hooks for our siblings.
      parentHooks = ourParentHooks;
    }
  };

  const wrapDescriptor = desc => {
    const wrapDesc = {};
    // console.log('wrapDescriptor', desc);
    for (const [key, val] of Object.entries(desc)) {
      Object.defineProperty(wrapDesc, key, { value: wrap(val) });
    }
    // console.log('done wrapDescriptor');
    return wrapDesc;
  };

  const snapshotProperties = (src, dst) => {
    // Take an isomorphic snapshot of our properties and prototype.
    for (const [p, desc] of Object.entries(Object.getOwnPropertyDescriptors(src))) {
      Reflect.defineProperty(dst, p, wrapDescriptor(desc));
    }
  };


  // Now we need to wrap the object in a contagious proxy to prevent
  // its unmarked descendents from escaping the designated zone.
  /**
   * @type {ProxyHandler}
   */
  const handler = {
    // Invocations unwrap our arguments, avoid this-capture, and wrap our returns.
    apply(_target, thisArg, argArray) {
      return subCall((subThisArg, ...subArgArray) => {
        const thisZone = proxyToZone.get(subThisArg);
        if (thisZone &&
          thisZone !== zone && // If it's the same zone, we aren't exposed,
          thisZone !== NEUTRAL_ZONE && // neutral zone also does not expose,
          !isSuspectedZone(thisZone) // nor do suspected this'es.
        ) {
          // If you got here, you were (probably accidentally) exposing a
          // private `this` value to potentially untrusted code.
          //
          // In an attacker's module:
          //   function mallory() { console.log('Surprise!  I captured:', this); }
          //
          // In your Jessie code:
          //   const fn = protect(() => {
          //     const myObj = { secret: 'sensitive', untrustedCallback: mallory };
          //     myObj.untrustedCallback();
          //   });
          subThisArg = wrap(TypeError('Jessie: protect(x) thwarted a cross-zone this-capture'));
        }
        return Reflect.apply(x, subThisArg, subArgArray);
      }, thisArg, ...argArray);
    },
    construct(_target, argArray, newTarget) {
      return subCall((subNewTarget, ...subArgArray) =>
        Reflect.construct(x, subArgArray, subNewTarget),
        newTarget, ...argArray);
    },
    get(_target, p, receiver) {
      return wrap(Reflect.get(x, p, receiver));
    },
    getOwnPropertyDescriptor(target, p) {
      const mapped = Reflect.getOwnPropertyDescriptor(target, p);
      if (!mapped || !Reflect.isExtensible(target)) {
        return mapped;
      }

      // We rewrite the underlying descriptor.
      return wrapDescriptor(mapped);
    },
    enumerate(_target) {
      return Reflect.enumerate(x);
    },
    has(_target, p) {
      return Reflect.has(x, p);
    },
    ownKeys(_target) {
      return Reflect.ownKeys(x);
    },
    isExtensible(target) {
      if (Reflect.isExtensible(target) && !Reflect.isExtensible(x)) {
        snapshotProperties(x, target);
        Reflect.preventExtensions(target);
      }
      return Reflect.isExtensible(target);
    },
    defineProperty(_target, p, attributes) {
      const myTry = Reflect.defineProperty(target, p, attributes);
      if (!myTry) {
        return myTry;
      }
      return Reflect.defineProperty(x, p, attributes);
    },
    deleteProperty(_target, p) {
      return Reflect.deleteProperty(x, p);
    },
    preventExtensions(target) {
      if (Reflect.isExtensible(x)) {
        Reflect.preventExtensions(x);
        snapshotProperties(x, target);
      }
      return Reflect.preventExtensions(target);
    },
    set(_target, p, value) {
      return Reflect.set(x, p, value);
    },
    getPrototypeOf(_target) {
      return Reflect.getPrototypeOf(x);
    },
    setPrototypeOf(_target, v) {
      return Reflect.setPrototypeOf(x, v);
    },
  };

  let target;
  if (typeof x === 'function') {
    if ('prototype' in x || isConstructor(x)) {
      target = function (...args) { };
      // console.log('function keyword', 'prototype' in target);
    } else {
      target = (...args) => {};
      // console.log('arrow function', 'prototype' in target);
    }
  } else {
    target = {};
  }
  Reflect.setPrototypeOf(target, wrap(Reflect.getPrototypeOf(x)));

  // Belt-and-suspenders: throw if we got a method we don't explicitly handle.
  Object.setPrototypeOf(handler, alwaysThrowHandler);
  const wrapper = new Proxy(target, handler);

  // We're ready to add to our maps.
  objToProxy.set(x, wrapper);
  objToProxy.set(wrapper, wrapper);
  proxyToZone.set(wrapper, zone);
  proxyToObj.set(wrapper, x);

  // console.log('wrapping for ' + zone + ' ' + callerZone, Error('here'));

  if (!isSuspectedZone(zone)) {
    // Needs hardening before the user accesses it.
    harden(wrapper);
  } else if (!Reflect.isExtensible(x)) {
    Reflect.preventExtensions(wrapper);
  }
  return wrapper;
});


// How to test for a constructor: https://stackoverflow.com/a/48036194
const isConstructorHandler = {
  construct() {
    // Hack to return an object without allocating a fresh one.
    return isConstructorHandler;
  },
};
const isConstructor = x => {
  try {
    const TestProxy = new ProxyConstructor(x, isConstructorHandler);
    return !!new TestProxy();
  } catch (e) {
    return false;
  }
};
