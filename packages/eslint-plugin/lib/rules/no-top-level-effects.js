/* global module, require */
/**
 * @author Michael FIG
 * See LICENSE file in root direcotry for full license.
 */

'use strict';

const nono = `not allowed in Jessie`;

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
      description: 'prevent top-level code evaluation',
      category: 'Possible Errors',
      recommended: true,
      url:
        'https://github.com/endojs/Jessie/blob/master/packages/eslint-plugin/lib/rules/no-top-level-effects.js',
    },
    type: 'problem',
    fixable: null,
    schema: [],
    supported: true || CodePathAnalyzer !== null,
  },
  create(context) {
    let depth = 0;
    return {
      ':function': _node => {
        depth += 1;
      },
      ':function:exit': _node => {
        depth -= 1;
      },
      CallExpression: node => {
        if (depth > 0) {
          return;
        }
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'harden'
        ) {
          return;
        }
        context.report({
          node,
          message: `top-level function calls are ${nono}; only 'harden' is allowed`,
        });
      },
      UpdateExpression: node => {
        if (depth > 0) {
          return;
        }
        context.report({
          node,
          message: `top-level mutations are ${nono}; only non-side-effecting ones are allowed`,
        });
      },
      AssignmentExpression: node => {
        if (depth > 0) {
          return;
        }
        context.report({
          node,
          message: `top-level mutating assignments are ${nono}; only bindings are allowed`,
        });
      },
    };
  },
};
