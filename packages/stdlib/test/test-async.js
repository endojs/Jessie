// @ts-check
import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava';
import { asyncAllTruthies, asyncWhile } from '../src/async';

test('asyncAllTruthies - for-await-of', async t => {
  const results = [];
  let state = 4;
  const thunk = async () => {
    const cur = await Promise.resolve(state);
    state -= 1;
    return cur;
  };
  for await (const el of asyncAllTruthies(thunk)) {
    results.push(el);
  }
  t.deepEqual(results, [4, 3, 2, 1]);
});

test('asyncAllTruthies - manual iteration', async t => {
  let state = 4;
  const thunk = async () => {
    const cur = await Promise.resolve(state);
    state -= 1;
    return cur;
  };

  const ai = asyncAllTruthies(thunk)[Symbol.asyncIterator]();

  for (let count = 4; count > 0; count -= 1) {
    // eslint-disable-next-line no-await-in-loop
    const r = await ai.next();
    t.is(r.value, count);
    t.is(r.done, false);
  }
  const fin = await ai.next();
  t.is(fin.value, 0);
  t.is(fin.done, true);
});

test('asyncWhile', async t => {
  let state = 4;
  const thunk = async () => {
    const cur = await Promise.resolve(state);
    state -= 1;
    return cur;
  };
  const last = await asyncWhile(thunk);
  t.is(last, 0);
  t.is(state, -1);
});
