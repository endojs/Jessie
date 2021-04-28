# @jessie.js/eslint-plugin

Agoric-specific plugin

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


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "@jessie.js/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here
