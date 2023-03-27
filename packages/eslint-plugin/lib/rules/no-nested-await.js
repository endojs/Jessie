/* eslint-env node */
/**
 * @author Michael FIG
 * See LICENSE file in root directory for full license.
 */

'use strict';

const isFunctionLike = node =>
  [
    'ArrowFunctionExpression',
    'FunctionExpression',

    'FunctionDeclaration',
    'MethodDefinition',

    'Program',
    'StaticBlock',
  ].includes(node.type);

module.exports = {
  meta: {
    docs: {
      description: `ensure the first \`await\` in an \`async\` function is non-nested so that it is clear when the synchronous portion of the function is finished`,
      category: 'Possible Errors',
      recommended: true,
      url:
        'https://github.com/endojs/Jessie/blob/main/packages/eslint-plugin/lib/rules/no-nested-await.js',
    },
    type: 'problem',
    fixable: null,
    messages: {
      unexpectedNestedAwait:
        'The first `await` appearing in an async function must not be nested',
    },
    schema: [],
    supported: true,
  },
  create(context) {
    const foundFirstAwait = new WeakSet();

    const isAwaitAllowedInNode = node => {
      // Climb the AST until finding the nearest enclosing function or
      // function-like node.
      let result = true;
      for (; node && !isFunctionLike(node); node = node.parent) {
        if (foundFirstAwait.has(node)) {
          return true;
        }
        foundFirstAwait.add(node);

        // Encountering anything other than an enclosing block is grounds for
        // rejection.
        if (node.type !== 'BlockStatement') {
          result = false;
        }
      }

      if (!node) {
        // Should never reach here because Program is a FunctionLike for
        // top-level await.
        throw new Error(`unexpected non-Program AST!`);
      }
      return result;
    };

    return {
      /**
       * An `await` expression is treated as non-nested if it is:
       * - a non-nested expression statement,
       * - the right-hand side of a non-nested declarator, or
       * - the right-hand side of an assignment expression.
       *
       * As a hint to future readers, the following ASTExplorer workspace
       * reveals some of the relevant AST shapes (note that node.parent is not
       * displayed in the ASTExplorer, but is available in the ESLint visitor):
       *
       * @see https://astexplorer.net/#/gist/4508eec25a8d5be1e0248c4cc06b9634/f6b22f2e8e3abd82a911ca6286a304ef0a3018c4
       *
       * This will need different handling for do expressions if they are ever
       * added to the language.
       * @see https://github.com/tc39/proposal-do-expressions
       *
       * @param {*} node
       */
      AwaitExpression: node => {
        let parent = node.parent;
        if (parent.type === 'VariableDeclarator' && parent.init === node) {
          // It's a declarator, so look up to the declaration statement's parent.
          parent = parent.parent.parent;
        } else if (
          parent.type === 'AssignmentExpression' &&
          parent.right === node &&
          parent.operator === '='
        ) {
          // It's an assignment, so look up to the assigment's parent.
          parent = parent.parent;
        }
        if (parent.type === 'ExpressionStatement') {
          // Try to find the parent block.
          parent = parent.parent;
        }

        if (!isAwaitAllowedInNode(parent)) {
          context.report({
            node,
            messageId: 'unexpectedNestedAwait',
          });
        }
      },
      /**
       * A `for-await-of` loop is treated as a simple `await` statement.
       *
       * @param {*} node
       */
      'ForOfStatement[await=true]': node => {
        if (!isAwaitAllowedInNode(node.parent)) {
          context.report({
            node,
            messageId: 'unexpectedNestedAwait',
          });
        }
      },
    };
  },
};
