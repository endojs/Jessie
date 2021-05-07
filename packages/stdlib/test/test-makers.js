// @ts-check
import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava';
import { makePromise, makeMap } from '../src/ring0/makers.js';

test('makePromise', async t => {
  const pret = await makePromise(resolve => {
    resolve(123);
  });
  t.is(pret, 123);
});

test('makeMap', async t => {
  const init = [
    ['abc', 123],
    ['def', 456],
  ];
  const map = makeMap(init);

  t.deepEqual([...map.entries()], init);
  t.deepEqual(
    [...map.keys()],
    init.map(([k]) => k),
  );
  t.deepEqual(
    [...map.values()],
    init.map(([_k, v]) => v),
  );

  const bar = {};
  t.is(map.get('abc'), 123);
  t.is(map.get('foo'), undefined);
  t.is(map.has('def'), true);
  t.is(map.has('foo'), false);
  map.set('foo', bar);
  t.is(map.has('foo'), true);
  t.is(map.get('foo'), bar);
  t.is(map.get('def'), 456);
  t.is(map.delete('def'), true);
  t.is(map.delete('def'), false);
  t.is(map.get('def'), undefined);
  t.is(map.has('def'), false);
});
