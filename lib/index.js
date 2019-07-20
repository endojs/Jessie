// This module should be overridden by Jessie interpreters and SES.
//
// It only exists to provide plain Javascript a mechanism to evaluate
// valid Jessie code.
export { confine, confineExpr } from './confine.js';
export { makePromise, makeMap, makeSet, makeWeakMap, makeWeakSet } from './makers.js';
import harden from '@agoric/harden';
export { harden };
// FIXME: Relied on by jessica, but not yet standardized.
export { default as insulate } from './insulate.js';
