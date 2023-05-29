/* eslint-env node */

'use strict';

module.exports = {
  plugins: ['@jessie.js'],
  processor: '@jessie.js/use-jessie',
  rules: {
    '@jessie.js/safe-await-separator': 'warn',
  },
};
