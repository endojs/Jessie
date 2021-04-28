// @ts-check
import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava';
import { asyncDoWhile, asyncGenerate } from '../src/ring1/async';

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
  for (let count = 0; count < 4; count += 1) {
    // eslint-disable-next-line no-await-in-loop
    const r = await ai.next();
    t.is(r.done, false);
    t.is(r.value, count);
  }
  const fin = await ai.next();
  t.is(fin.done, true);
  t.is(fin.value, 4);
});
