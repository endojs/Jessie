// @ts-check
import { test } from './prepare-test-env-ava.js';
import { lintJessie } from '../src/lint.js';

/** @param {string} src */
const fatals = src => lintJessie(src).filter(m => m.severity === 2);

test('rejects class', t => {
  const errs = fatals(`class X {}`);
  t.true(errs.length > 0);
  t.regex(errs[0].message, /class/);
});

test('rejects var', t => {
  const errs = fatals(`var x = 1;`);
  t.true(errs.some(m => m.ruleId === 'no-var'));
});

test('rejects new', t => {
  const errs = fatals(`const m = new Map();`);
  t.true(errs.some(m => /'new' is not allowed/.test(m.message)));
});

test('rejects this', t => {
  const errs = fatals(`const f = () => this;`);
  t.true(errs.some(m => /'this' is not allowed/.test(m.message)));
});

test('rejects regex literal', t => {
  const errs = fatals(`const r = /foo/;`);
  t.true(errs.some(m => /regexp literal/.test(m.message)));
});

test('rejects for/in', t => {
  const errs = fatals(`for (const k in obj) { f(k); }`);
  t.true(errs.some(m => /for\/in/.test(m.message)));
});

test('accepts plain Jessie', t => {
  const errs = fatals(`const x = 1; const y = x + 2;`);
  t.deepEqual(errs, []);
});

test('accepts arrow functions and for/of', t => {
  const errs = fatals(
    `const sum = arr => { let s = 0; for (const v of arr) { s = s + v; } return s; };`,
  );
  t.deepEqual(errs, []);
});
