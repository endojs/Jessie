/* eslint-env node */

'use strict';

module.exports = {
  extends: [
    'plugin:prettier/recommended',
    'plugin:@endo/strict',
    'plugin:@jessie.js/recommended',
  ],
  ignorePatterns: [
    '**/output/**',
    '**/bundles/**',
    '**/coverage/**',
    '**/dist/**',
  ],
};
