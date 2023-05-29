/* eslint-env node */

'use strict';

// Convenience utility using Mocha globals.
const { RuleTester } = require('eslint');

const ruleTester = new RuleTester({
  parserOptions: { sourceType: 'module', ecmaVersion: 2021 },
});
const rule = require('../lib/rules/no-nested-await.js');
const {
  validNoNestedAwait,
  subtlyValid,
  clearlyInvalid,
} = require('./corpus.js');

const unexpectedNestedAwait = 'unexpectedNestedAwait';

ruleTester.run('no-nested-await', rule, {
  valid: validNoNestedAwait,
  // `no-nested-await` is not smart enough to ignore subtle code that is
  // actually valid.  We test that it fails these cases.
  invalid: [...clearlyInvalid, ...subtlyValid].map(example => ({
    ...example,
    errors: example.errors.map(error => ({
      ...error,
      messageId: unexpectedNestedAwait,
    })),
  })),
});
