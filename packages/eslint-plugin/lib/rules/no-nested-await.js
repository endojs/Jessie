/* global module, require */
/**
 * @author Michael FIG
 * See LICENSE file in root direcotry for full license.
 */

'use strict';

/**
 * Imports a specific module.
 *
 * @param {...string} moduleNames - module names to import.
 * @returns {object|null} The imported object, or null.
 */
function safeRequire(...moduleNames) {
  for (const moduleName of moduleNames) {
    try {
      // eslint-disable-next-line import/no-dynamic-require,global-require
      return require(moduleName);
    } catch (_err) {
      // Ignore.
    }
  }
  return null;
}

const CodePathAnalyzer = safeRequire(
  'eslint/lib/linter/code-path-analysis/code-path-analyzer',
  'eslint/lib/code-path-analysis/code-path-analyzer',
);

module.exports = {
  meta: {
    docs: {
      description:
        'prevent usage of `await` unless it is a function block statement or destructuring assignment',
      category: 'Possible Errors',
      recommended: true,
      url:
        'https://github.com/endojs/Jessie/blob/master/packages/eslint-plugin/lib/rules/no-nested-await.js',
    },
    type: 'problem',
    fixable: null,
    schema: [],
    supported: true || CodePathAnalyzer !== null,
  },
  create(context) {
    return {
      AwaitExpression: node => {
        // As a hint to future readers, I used the following ASTExplorer
        // workspace to look up the relevant AST shapes (note that node.parent
        // is not displayed in the ASTExplorer, but is available in the ESLint
        // visitor):
        // https://astexplorer.net/#/gist/4508eec25a8d5be1e0248c4cc06b9634/f6b22f2e8e3abd82a911ca6286a304ef0a3018c4
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
        if (parent.type === 'BlockStatement') {
          // Find the parent block's node.
          parent = parent.parent;
        }

        if (
          ([
            'ArrowFunctionExpression',
            'FunctionExpression',
            'FunctionDeclaration',
          ].includes(parent.type) &&
            parent.async === true) ||
          (parent.type === 'ForOfStatement' && parent.await === true)
        ) {
          // Its parent is an async function or for-await-of body.
          return;
        }

        context.report({
          node,
          message: 'Unexpected `await` expression (not top of function body)',
        });
      },
    };
  },
};
