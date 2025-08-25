/* eslint-env node */

'use strict';

module.exports = plugin => {
  const config = {
    rules: {
      '@jessie.js/safe-await-separator': 'warn',
    },
  };
  if (plugin) {
    config.plugins = {
      '@jessie.js': plugin,
    };
  } else {
    config.plugins = ['@jessie.js'];
  }
  if (plugin) {
    return [config];
  }
  return config;
};
