// @ts-check
/// <reference types="ses" />

// TODO: Typing these would be laudable, but harder than it looks.
export const makePromise = harden((executor) => harden(new Promise(executor)));
export const makeMap = harden((entriesOrIterable) => harden(new Map(entriesOrIterable)));
export const makeSet = harden((values) => harden(new Set(values)));
export const makeWeakMap = harden((entries) => harden(new WeakMap(entries)));
export const makeWeakSet = harden((values) => harden(new WeakSet(values)));
