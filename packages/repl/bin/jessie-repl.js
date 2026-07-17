#!/usr/bin/env node
// @ts-check
import 'node:repl';
import 'ses';

lockdown({
  domainTaming: 'unsafe',
  errorTaming: 'unsafe',
  consoleTaming: 'unsafe',
  stackFiltering: 'verbose',
});

const { startJessieRepl } = await import('../src/main.js');

startJessieRepl();
