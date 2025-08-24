// eslint.config.js
import { defineConfig } from 'eslint/config';
import jessie from '@jessie.js/eslint-plugin';

export default defineConfig([
  {
    files: ['*.js', '**/*.js'],
    plugins: {
      '@jessie.js': jessie,
    },
    extends: ['@jessie.js/internal'],
    processor: '@jessie.js/use-jessie',
  },
]);
