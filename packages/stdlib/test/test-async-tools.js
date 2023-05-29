// @ts-check
import '@endo/init/debug.js';
import test from 'ava';
import { asyncDoWhile } from '../src/ring1/async-tools.js';
import { asyncGenerate } from '../src/ring0/async-generate.js';

test('asyncDoWhile', async t => {
  let nextValue = 0;
  const unused = await asyncDoWhile(async () => {
    const value = await Promise.resolve(nextValue);
    nextValue += 1;
    return value < 4;
  });
  t.is(unused, undefined);
  t.is(nextValue, 5);
});

test('asyncGenerate - for-await-of', async t => {
  const results = [];
  let nextValue = 0;
  const gen = asyncGenerate(async () => {
    const value = await Promise.resolve(nextValue);
    nextValue += 1;
    return { done: value >= 4, value };
  });
  for await (const el of gen) {
    results.push(el);
  }
  t.deepEqual(results, [0, 1, 2, 3]);
});

test('asyncGenerate - manual iteration', async t => {
  let nextValue = 0;
  const gen = asyncGenerate(async () => {
    const value = await Promise.resolve(nextValue);
    nextValue += 1;
    return { done: value >= 4, value };
  });

  const ai = gen[Symbol.asyncIterator]();
  const r0 = await ai.next();
  t.is(r0.done, false);
  t.is(r0.value, 0);
  const r1 = await ai.next();
  t.is(r1.done, false);
  t.is(r1.value, 1);
  const r2 = await ai.next();
  t.is(r2.done, false);
  t.is(r2.value, 2);
  const r3 = await ai.next();
  t.is(r3.done, false);
  t.is(r3.value, 3);
  const fin = await ai.next();
  t.is(fin.done, true);
  t.is(fin.value, 4);
});
