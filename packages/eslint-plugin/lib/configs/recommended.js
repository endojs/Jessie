/* eslint-env node */

'use strict';

module.exports = {
  plugins: ['@jessie.js'],
  processor: '@jessie.js/use-jessie',
  globals: {
    harden: false,
    assert: false,
  },
};
