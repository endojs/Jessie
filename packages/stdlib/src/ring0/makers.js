// @ts-check
// These work around Jessie's forbiddance of `new`.
/// <reference types="ses" />

/** @type {<T>(executor: (resolve: (value: T) => void, reject: (reason?: any) =>
 * void) => void) => Promise<T>} */
export const makePromise = executor => harden(new Promise(executor));
harden(makePromise);

/** @typedef {<K, V>(entries?: readonly (readonly [K, V])[]) => Map<K, V>} MapFromEntries */
/** @typedef {<K, V>(iterable: Iterable<readonly [K, V]>) => Map<K, V>} MapFromIterable */

/** @type {MapFromEntries & MapFromIterable} */
export const makeMap = entriesOrIterable => harden(new Map(entriesOrIterable));
harden(makeMap);

/** @typedef {<T>(values?: readonly T[]) => Set<T>} SetFromValues */
/** @typedef {<T>(iterable: Iterable<T>) => Set<T>} SetFromIterable */
/** @type {SetFromValues & SetFromIterable} */
export const makeSet = values => harden(new Set(values));
harden(makeSet);

/** @typedef {<K extends {}, V = any>(entries?: readonly [K, V][] | null) => WeakMap<K, V>} WeakMapFromEntries */
/** @typedef {<K extends {}, V>(iterable: Iterable<[K, V]>) => WeakMap<K, V>} WeakMapFromIterable */
/** @type {WeakMapFromEntries & WeakMapFromIterable} */
export const makeWeakMap = entries => harden(new WeakMap(entries));
harden(makeWeakMap);

/** @typedef {<T extends {}>(values?: readonly T[]) => WeakSet<T>} WeakSetFromValues */
/** @typedef {<T extends {}>(iterable: Iterable<T>) => WeakSet<T>} WeakSetFromIterable */
/** @type {WeakSetFromValues & WeakSetFromIterable} */
export const makeWeakSet = values => harden(new WeakSet(values));
harden(makeWeakSet);
