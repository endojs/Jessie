// Prevent write access, and ensure objects don't pass the barrier
// between warm (inside warmTarget or the return values of its descendants)
// and cold (outside warmTarget), unless they are also insulated.
//
// The cold/warm identity maps are created fresh for each actual insulate()
// call, but not for the silent wrapping of returns, throws, this, and
// arguments.  This allows wrapping/unwrapping of values that transition
// the delineated insulation boundary with read-only Proxies rather
// having to harden them on every transition and losing useful but
// harmless mutability.
//
// The proxying provided by insulate() is orthogonal to harden() and
// Object.freeze.  You can still call harden() on your own data and
// pass it into insulated() functions, but not on proxies that have
// originated in an insulated() function, as that data belongs to
// somebody else.
import harden from '@agoric/harden';

// The $h_already set is a list of global identities that should never
// be wrapped.  It is included for bootstrap purposes, but MUST NOT
// be exportd to Jessie.
//
// The `$h_` prefix is a safeguard to prevent valid Jessie code from ever
// referencing this set as an identifier.
export const $h_already = harden(new WeakSet());

let DEBUG_FUNCTION;
// Turn on the debugging.
export const $h_debug = harden((debugfn) => DEBUG_FUNCTION = debugfn);

const insulate = harden((warmTarget) => {
    const defineLocation = Error('from insulated target');
    const warmToColdMap = new WeakMap(), coldToWarmMap = new WeakMap();
    const wrapWithMaps = (obj, inMap, outMap) => {
        if (Object(obj) !== obj) {
            // It's a neutral (primitive) type.
            return obj;
        }
        // We are sending out the object, so find it in the cache.
        const wrapped = outMap.get(obj);
        if (wrapped) {
            return wrapped;
        }
        if ($h_already.has(obj)) {
            // Don't doubly insulate.
            return obj;
        }
        // If we want an object to come in, we reverse the map (our
        // inside is the object's outside).
        const enter = (inbound) => wrapWithMaps(inbound, outMap, inMap);
        // If we want send an object out, we keep the order (our inside
        // is the object's inside).
        const leave = (outThunk) => {
            try {
                return wrapWithMaps(outThunk(), inMap, outMap);
            }
            catch (e) {
                throw wrapWithMaps(e, inMap, outMap);
            }
        };
        const err = (msg) => leave(() => {
            const caller = TypeError(msg);
            if (DEBUG_FUNCTION) {
                DEBUG_FUNCTION(caller, defineLocation);
            }
            throw wrapWithMaps(caller, inMap, outMap);
        });
        const handler = {
            // Traps that make sure our object is read-only.
            defineProperty(_target, prop, _attributes) {
                // FIXME: Set to same value?
                // FIXME: _attributes enumerable/configurable/writable maybe?
                throw err(`Cannot define property ${JSON.stringify(String(prop))} on insulated object`);
            },
            setPrototypeOf(_target, _v) {
                // FIXME: Set to same value?
                throw err(`Cannot set prototype of insulated object`);
            },
            set(_target, prop, _value) {
                // FIXME: Set to same value?
                throw err(`Cannot set property ${JSON.stringify(String(prop))} on insulated object`);
            },

            // Traps that we default:
            // isExtensible(target)
            // getOwnPropertyDescriptor(target, prop)

            // FIXME: Allow freezing of the target.
            preventExtensions(target) {
                if (!Reflect.isExtensible(target)) {
                    // Already prevented extensions, so succeed.
                    return true;
                }
                // This is a mutation.  Not allowed.
                throw err(`Cannot prevent extensions of insulated object`);
            },
            // The traps that have a reasonably simple implementation:
            get(target, prop, receiver) {
                const desc = Reflect.getOwnPropertyDescriptor(target, prop);
                const value = Reflect.get(target, prop, receiver);
                if (desc && !desc.writable && !desc.configurable) {
                    return value;
                }
                return leave(() => value);
            },
            getPrototypeOf(target) {
                return leave(() => Reflect.getPrototypeOf(target));
            },
            ownKeys(target) {
                return leave(() => Reflect.ownKeys(target));
            },
            has(target, key) {
                return leave(() => key in target);
            },
            // The recursively-wrapping traps.
            apply(target, thisArg, argumentsList) {
                // If target is from outside...
                if (Object(thisArg) === thisArg &&
                    outMap.get(target) &&
                    // ...but thisArg is not from outside.
                    !inMap.get(thisArg)) {
                  // Block accidental `this`-capture, but don't break
                  // callers that ignore `this` anyways.
                  thisArg = undefined;
                }
                const wrappedThis = enter(thisArg);
                const wrappedArguments = argumentsList.map(enter);
                return leave(() => Reflect.apply(target, wrappedThis, wrappedArguments));
            },
            construct(target, args) {
                const wrappedArguments = args.map(enter);
                return leave(() => Reflect.construct(target, wrappedArguments));
            },
        };
        // Now we can construct an insulated object, which
        // makes it effectively read-only and transitively
        // maintains the temperatures of the inside and outside.
        const insulated = new Proxy(obj, handler);
        
        // Prevent double-insulation.
        $h_already.add(insulated);

        // We're putting the insulated object outside, so mark it
        // for our future inputs/outputs.
        outMap.set(obj, insulated);
        inMap.set(insulated, obj);
        return insulated;
    };
    return wrapWithMaps(warmTarget, coldToWarmMap, warmToColdMap);
});

// Prevent infinite regress.
$h_already.add(insulate);
export default insulate;
