// @ts-check
import { test } from './prepare-test-env-ava.js';
import {
  makeJessieEvaluator,
  JessieLintError,
} from '../src/main.js';

test('evaluates an expression', t => {
  const { evaluate } = makeJessieEvaluator();
  t.is(evaluate(`1 + 2`), 3);
});

test('const binding persists across evaluations', t => {
  const { evaluate } = makeJessieEvaluator();
  evaluate(`const x = 41;`);
  t.is(evaluate(`x + 1`), 42);
});

test('let binding is reassignable across evaluations', t => {
  const { evaluate } = makeJessieEvaluator();
  evaluate(`let n = 1;`);
  evaluate(`n = n + 10;`);
  t.is(evaluate(`n`), 11);
});

test('function declaration persists', t => {
  const { evaluate } = makeJessieEvaluator();
  evaluate(`function double(n) { return n * 2; }`);
  t.is(evaluate(`double(21)`), 42);
});

test('declaration-only input evaluates to undefined', t => {
  const { evaluate } = makeJessieEvaluator();
  t.is(evaluate(`const ignored = 99;`), undefined);
});

test('lint error surfaces as JessieLintError', t => {
  const { evaluate } = makeJessieEvaluator();
  t.throws(() => evaluate(`class X {}`), { instanceOf: JessieLintError });
});

test('endowments are visible', t => {
  const { evaluate } = makeJessieEvaluator({ endowments: { greeting: 'hi' } });
  t.is(evaluate(`greeting`), 'hi');
});
