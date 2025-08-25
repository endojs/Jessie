/* eslint-env node */

'use strict';

// Convenience utility using Mocha globals.
const { RuleTester } = require('eslint');

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { sourceType: 'module', ecmaVersion: 'latest' },
  },
});
const rule = require('../lib/rules/safe-await-separator.js');
const {
  validSafeAwaitSeparator,
  subtlyValid,
  clearlyInvalid,
} = require('./corpus.js');

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
        suggestions: [{ messageId: 'insertAwaitNull', output: `zazzatat;` }],
        ...error,
        messageId: 'unsafeAwaitSeparator',
      })),
  })),
});
