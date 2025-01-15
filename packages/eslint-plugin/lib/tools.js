// @ts-check
/* eslint-env node */

'use strict';

/** @typedef {import('eslint').Rule.Node} Node */

const harden = Object.freeze;

/** @type {Node['type'][]} */
const functionLikeNodeTypes = [
  'ArrowFunctionExpression',
  'FunctionExpression',

  'FunctionDeclaration',
  'MethodDefinition',

  'Program',
  'StaticBlock',
];
harden(functionLikeNodeTypes);

/**
 * @param {Node} node
 */
const isFunctionLike = node => functionLikeNodeTypes.includes(node.type);
harden(isFunctionLike);

/**
 * @param {Node} node
 * @param {WeakSet<Node>} already
 * @returns {boolean}
 */
const isAwaitAllowedInNode = (node, already = new WeakSet()) => {
  // Climb the AST until finding the nearest enclosing function or
  // function-like node.
  let result = true;
  for (; node && !isFunctionLike(node); node = node.parent) {
    if (already.has(node)) {
      return true;
    }
    already.add(node);

    if (node.type === 'BlockStatement') {
      // do nothing
    } else if (node.type === 'ForOfStatement' && node.await) {
      // do nothing
    } else {
      // Encountering anything other than an enclosing block is grounds for
      // rejection.
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
harden(isAwaitAllowedInNode);

/**
 * @param {import('eslint').Rule.RuleContext} _context
 * @param {(node: Node) => void} makeReport
 * @param {boolean} [addToCache]
 */
const makeAwaitAllowedVisitor = (
  _context,
  makeReport,
  addToCache = undefined,
) => {
  const already = addToCache ? new WeakSet() : undefined;
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
     * @param {Node} node
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

      if (!isAwaitAllowedInNode(parent, already)) {
        makeReport(node);
      }
    },
    /**
     * A `for-await-of` loop is treated as a simple `await` statement.
     *
     * @param {Node} node
     */
    'ForOfStatement[await=true]': node => {
      if (!isAwaitAllowedInNode(node.parent, already)) {
        makeReport(node);
      }
    },
  };
};
harden(makeAwaitAllowedVisitor);

module.exports = harden({
  isFunctionLike,
  isAwaitAllowedInNode,
  makeAwaitAllowedVisitor,
});
