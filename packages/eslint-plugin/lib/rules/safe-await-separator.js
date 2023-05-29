/* eslint-env node */
/**
 * @author Michael FIG
 * See LICENSE file in root directory for full license.
 */

'use strict';

const { makeAwaitAllowedVisitor } = require('../tools.js');

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
    messages: {
      unsafeAwaitSeparator:
        'The first `await` appearing in an async function must not be nested',
    },
    schema: [],
    supported: true,
  },
  create(context) {
    const makeReport = node => {
      context.report({
        node,
        messageId: 'unsafeAwaitSeparator',
      });
    };
    return makeAwaitAllowedVisitor(context, makeReport, true);
  },
};
