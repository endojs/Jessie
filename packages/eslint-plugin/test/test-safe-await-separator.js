/* eslint-env node */

'use strict';

// Convenience utility using Mocha globals.
const { RuleTester } = require('eslint');

const ruleTester = new RuleTester({
  parserOptions: { sourceType: 'module', ecmaVersion: 2021 },
});
const rule = require('../lib/rules/safe-await-separator.js');
const {
  validSafeAwaitSeparator,
  subtlyValid,
  clearlyInvalid,
} = require('./corpus.js');

const unsafeAwaitSeparator = 'unsafeAwaitSeparator';

ruleTester.run('safe-await-separator', rule, {
  valid: validSafeAwaitSeparator,
  // `safe-await-separator` is not smart enough to ignore subtle code that is
  // actually valid.  We test that it fails these cases.
  invalid: [...clearlyInvalid, ...subtlyValid].map(example => ({
    ...example,
    errors: example.errors
      .filter(
        error =>
          !error.messageId || error.messageId !== 'unexpectedNestedAwait',
      )
      .map(error => ({
        ...error,
        messageId: unsafeAwaitSeparator,
      })),
  })),
});
