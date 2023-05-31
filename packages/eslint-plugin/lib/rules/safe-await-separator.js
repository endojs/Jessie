// @ts-check
/* eslint-env node */

/**
 * @author Michael FIG
 * See LICENSE file in root directory for full license.
 */

'use strict';

const { isFunctionLike, makeAwaitAllowedVisitor } = require('../tools.js');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    docs: {
      description: `ensure the first \`await\` in an \`async\` function is non-nested so that it is clear when the synchronous portion of the function is finished`,
      category: 'Possible Errors',
      recommended: true,
      url:
        'https://github.com/endojs/Jessie/blob/main/packages/eslint-plugin/lib/rules/safe-await-separator',
    },
    type: 'problem',
    fixable: null,
    hasSuggestions: true,
    messages: {
      unsafeAwaitSeparator:
        'The first `await` appearing in an async function must not be nested',
      insertAwaitNull: 'Insert `await null;` before the first `await`',
    },
    schema: [],
    supported: true,
  },
  create(context) {
    /**
     * @param {import('eslint').Rule.Node} node
     */
    const makeReport = node => {
      context.report({
        node,
        messageId: 'unsafeAwaitSeparator',
        suggest: [
          {
            messageId: 'insertAwaitNull',
            fix: fixer => {
              let cur = node;
              let parent = cur.parent;
              while (!isFunctionLike(parent.parent)) {
                cur = parent;
                parent = cur.parent;
              }
              return fixer.insertTextBefore(cur, 'await null;');
            },
          },
        ],
      });
    };
    return makeAwaitAllowedVisitor(context, makeReport, true);
  },
};
