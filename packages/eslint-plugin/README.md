# @jessie.js/eslint-plugin

Jessie-specific plugin

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `@jessie.js/eslint-plugin`:

```
$ npm install @jessie.js/eslint-plugin --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `@jessie.js/eslint-plugin` globally.

## Usage

1. Add `@jessie.js` to the plugins section of your `.eslint.config.js` configuration file,
2. extend your config from `'@jessie.js/recommended'`, and
3. add the `'@jessie.js/use-jessie` processor

As an example:

```js
// eslint.config.js
import { defineConfig } from 'eslint/config';
import jessie from '@jessie.js/eslint-plugin';

export default defineConfig([
  {
    files: ['*.js', '**/*.js'],
    plugins: {
      '@jessie.js': jessie,
    },
    extends: ['@jessie.js/recommended'],
    processor: '@jessie.js/use-jessie',
  },
]);
```
