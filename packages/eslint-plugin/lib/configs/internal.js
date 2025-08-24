/* eslint-env node */

'use strict';

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname, // optional; default: process.cwd()
  resolvePluginsRelativeTo: __dirname, // optional
});

module.exports = plugin => {
  const ignores = [
    '**/output/**',
    '**/bundles/**',
    '**/coverage/**',
    '**/dist/**',
  ];

  const xtends = ['plugin:@endo/strict', 'plugin:@jessie.js/recommended'];

  const rules = {
    'no-underscore-dangle': 'off',
    'no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          'eslint.config.*',
          '**/test/**',
          '**/*.test.js',
          '**/*.spec.js',
          '**/tests/**',
          '**/__tests__/**',
        ],
        optionalDependencies: false,
        peerDependencies: ['**/test/**'],
      },
    ],
  };

  if (plugin) {
    return [
      ...compat.extends(...xtends),
      {
        // matches all files because it doesn't specify the `files` or `ignores` key
        rules,
        languageOptions: {
          ecmaVersion: 'latest',
        },
      },
      {
        ignores,
      },
    ];
  }

  return {
    extends: xtends,
    rules,
    ignorePatterns: ignores,
  };
};
