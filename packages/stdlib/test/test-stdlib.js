import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava';
import { makePromise } from '..';

test('stdlib', async t => {
  const pret = await makePromise(resolve => {
    resolve(123);
  });
  t.is(pret, 123);
});
