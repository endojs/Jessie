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

Add `@jessie.js` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "@jessie.js"
    ]
}
```


Then configure the Jessie parser under the processor section.

```json
{
    "processor": "@jessie.js/use-jessie"
}
```
