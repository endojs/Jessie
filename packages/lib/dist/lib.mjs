// @ts-check
/// <reference types="ses" />

// TODO: Typing these would be laudable, but harder than it looks.
const makePromise = harden((executor) => harden(new Promise(executor)));
const makeMap = harden((entriesOrIterable) => harden(new Map(entriesOrIterable)));
const makeSet = harden((values) => harden(new Set(values)));
const makeWeakMap = harden((entries) => harden(new WeakMap(entries)));
const makeWeakSet = harden((values) => harden(new WeakSet(values)));

export { makeMap, makePromise, makeSet, makeWeakMap, makeWeakSet };
