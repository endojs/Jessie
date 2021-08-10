/* global exports */

'use strict';

const nono = `not allowed in Jessie`;

exports.jessieRules = {
  '@jessie.js/no-tricky-await': ['error'],
  curly: ['error', 'all'],
  eqeqeq: ['error', 'always'],
  'no-bitwise': ['error'],
  'no-fallthrough': ['error', { commentPattern: `fallthrough is ${nono}` }],
  // The denylist is probably too permissive.  We should have an allowlist.
  'no-restricted-globals': ['error', 'RegExp', 'Date', 'Symbol'],
  'no-restricted-syntax': [
    'error',
    {
      selector: `BinaryExpression[operator='in']`,
      message: `'in' is ${nono}`,
    },
    {
      selector: `BinaryExpression[operator='instanceof']`,
      message: `'instanceof' is ${nono}; use duck typing`,
    },
    {
      selector: `NewExpression`,
      message: `'new' is ${nono}; use a 'maker' function`,
    },
    {
      selector: `FunctionDeclaration[generator=true]`,
      message: `generators are ${nono}`,
    },
    {
      selector: `FunctionExpression[generator=true]`,
      message: `generators are ${nono}`,
    },
    {
      selector: `DoWhileStatement`,
      message: `do/while statements are ${nono}`,
    },
    {
      selector: `ThisExpression`,
      message: `'this' is ${nono}; use a closed-over lexical variable instead`,
    },
    {
      selector: `UnaryExpression[operator='delete']`,
      message: `'delete' is ${nono}; destructure objects and reassemble them without mutation`,
    },
    {
      selector: `ForInStatement`,
      message: `for/in statements are ${nono}; use for/of Object.keys(val)`,
    },
    {
      selector: `MemberExpression[computed=true][property.type!='Literal'][property.type!='UnaryExpression']`,
      message: `arbitrary computed property names are ${nono}; use leading '+'`,
    },
    {
      selector: `MemberExpression[computed=true][property.type='UnaryExpression'][property.operator!='+']`,
      message: `arbitrary computed property names are ${nono}; use leading '+'`,
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
      message: `'class' is ${nono}; define a 'maker' function`,
    },
    {
      selector: `ClassDeclaration`,
      message: `'class' is ${nono}; define a 'maker' function`,
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
