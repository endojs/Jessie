/* global exports */

'use strict';

const nono = `not allowed in Jessie`;

exports.jessieRules = {
  curly: ['error', 'all'],
  eqeqeq: ['error', 'always'],
  'no-bitwise': ['error'],
  'no-fallthrough': ['error', { commentPattern: `fallthrough is ${nono}` }],
  'no-restricted-globals': ['error', 'RegExp', 'Date'],
  'no-restricted-syntax': [
    'error',
    {
      selector: `BinaryExpression[operator='in']`,
      message: `'in' is ${nono}`,
    },
    {
      selector: `UpdateExpression[operator='++'][prefix=false]`,
      message: `postfix '++' is ${nono}`,
    },
    {
      selector: `UpdateExpression[operator='--'][prefix=false]`,
      message: `postfix '--' is ${nono}`,
    },
    {
      selector: `BinaryExpression[operator='instanceof']`,
      message: `'instanceof' is ${nono}`,
    },
    {
      selector: `NewExpression`,
      message: `'new' is ${nono}`,
    },
    {
      selector: `FunctionDeclaration[generator=true]`,
      message: `generators are ${nono}`,
    },
    {
      selector: `FunctionDeclaration[async=true]`,
      message: `async functions are ${nono}`,
    },
    {
      selector: `FunctionExpression[async=true]`,
      message: `async functions are ${nono}`,
    },
    {
      selector: `ArrowFunctionExpression[async=true]`,
      message: `async functions are ${nono}`,
    },
    {
      selector: `DoWhileStatement`,
      message: `do/while statements are ${nono}`,
    },
    {
      selector: `ThisExpression`,
      message: `'this' is ${nono}`,
    },
    {
      selector: `UnaryExpression[operator='delete']`,
      message: `'delete' is ${nono}`,
    },
    {
      selector: `ForInStatement`,
      message: `for/in statements are ${nono}; use for/of Object.keys(val).`,
    },
    {
      selector: `MemberExpression[computed=true][property.type!='Literal'][property.type!='UnaryExpression']`,
      message: `computed property names are ${nono} (except with leading '+')`,
    },
    {
      selector: `MemberExpression[computed=true][property.type='UnaryExpression'][property.operator!='+']`,
      message: `computed property names are ${nono} (except with leading '+')`,
    },
    {
      selector: `Super`,
      message: `'super' is ${nono}`,
    },
    {
      selector: `MetaProperty`,
      message: `'import.meta' is ${nono}`,
    },
    {
      selector: `ClassExpression`,
      message: `'ClassExpression' is ${nono}`,
    },
    {
      selector: `CallExpression[callee.name='eval']`,
      message: `'eval' is ${nono}`,
    },
    {
      selector: `Literal[regex]`,
      message: `regexp literal syntax is ${nono}`,
    },
  ],
  'no-var': ['error'],
  'guard-for-in': 'off',
  semi: ['error', 'always'],
};
