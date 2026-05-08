// @ts-check
import 'node:repl';
import 'ses';

lockdown({
  domainTaming: 'unsafe',
  errorTaming: 'unsafe',
  consoleTaming: 'unsafe',
  stackFiltering: 'verbose',
});

export { default as test } from 'ava';
