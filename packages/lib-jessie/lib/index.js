// This module should be overridden by Jessie interpreters and SES.
//
// It only exists to provide plain Javascript a mechanism to evaluate
// valid Jessie code.
export { confine, confineExpr } from './confine.js';
export { makePromise, makeMap, makeSet, makeWeakMap, makeWeakSet } from './makers.js';
export { default as harden } from '@lib-jessie/harden';
export { protect, suspect } from '@lib-jessie/zones';

// FIXME: Need to remove insulate entirely!
export const insulate = o => o;
