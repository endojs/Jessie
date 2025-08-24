// eslint.config.js
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import jessie from '@jessie.js/eslint-plugin';

export default defineConfig([
  prettierConfig,
  {
    files: ['*.js', '**/*.js'],
    plugins: {
      '@jessie.js': jessie,
    },
    extends: ['@jessie.js/internal'],
    processor: '@jessie.js/use-jessie',
  },
]);
