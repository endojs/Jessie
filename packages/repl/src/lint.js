// @ts-check
import { Linter } from 'eslint';
import jessiePlugin from '@jessie.js/eslint-plugin';
import { jessieRules } from '@jessie.js/eslint-plugin/lib/use-jessie-rules.js';

const linter = new Linter();

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    plugins: { '@jessie.js': jessiePlugin },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      parserOptions: { ecmaFeatures: {} },
    },
    rules: jessieRules,
  },
];

/**
 * Lint a snippet against the Jessie subset rules.
 *
 * @param {string} src
 * @returns {import('eslint').Linter.LintMessage[]}
 */
export const lintJessie = src =>
  linter.verify(src, config, { filename: 'repl-input.js' });
