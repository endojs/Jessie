/* eslint-env node */

'use strict';

const validNoNestedAwait = [
  {
    code: `const expr = async () => boo();`,
  },
  {
    code: `const arrow = async (boo) => {
      await boo();
    }`,
  },
  {
    code: `async function forAwaitOf() {
      let b;
      for await (b of baz()) {
        await qux();
      }
    }`,
  },
  {
    code: `async function forAwaitOfBy2() {
      for await (const b of baz()) {
        await qux();
        for await (const c of crux()) {
          await quux();
        }
        await quuz();
      }
    }`,
  },
  {
    code: `const outer = async () => {
      const inner = async () => {
        await foo();
      };
      return inner;
    }`,
  },
  {
    code: `async function awaitBlock3() {
      {
        {
          {
            await foo();
          }
          await bar();
        }
        await baz();
      }
      await qux();
    }`,
  },
];

// These cases are clearly valid with the safe-await-separator.
const validSafeAwaitSeparator = [
  ...validNoNestedAwait,
  {
    code: `async function awaitConst() {
      await null;
      if (baz()) {
        await 3;
      }
    }`,
  },
  {
    code: `async function awaitFunc() {
      await bar();
      if (baz()) {
        await qux();
      }
    }`,
  },
  {
    code: `async function awaitTry() {
      await bar();
      try {
        await zot();
      } catch {
        boo();
      }
    }`,
  },
  {
    code: `async function awaitNestedTryCatch() {
      await null;
      try {
        await zot();
      } catch {
        fn();
      }
    }`,
  },
  {
    code: `async function awaitNestedTryFinally() {
      await null;
      try {
        await zot();
      } finally {
        fn();
      }
    }`,
  },
  {
    code: `async function awaitNestedTryCatchFinally() {
      await null;
      try {
        zot();
      } catch {
        await boo();
      } finally {
        fn();
      }
    }`,
  },
];

// These cases are clearly unbalanced, which causes a statement to be
// ambiguously within the synchronous prelude.
const clearlyInvalid = [
  {
    code: `async function awaitUnbalancedThen() {
      if (baz()) {
        await qux();
      }
      fn();
    }`,
    errors: [
      {
        line: 3,
        suggestions: [
          {
            messageId: 'insertAwaitNull',
            output: `async function awaitUnbalancedThen() {
      await null;if (baz()) {
        await qux();
      }
      fn();
    }`,
          },
        ],
      },
    ],
  },
  {
    code: `async function awaitUnbalancedElse() {
      if (baz()) {
        // empty
      } else {
        await zingo();
      }
      fn();
    }`,
    errors: [
      {
        line: 5,
        suggestions: [
          {
            messageId: 'insertAwaitNull',
            output: `async function awaitUnbalancedElse() {
      await null;if (baz()) {
        // empty
      } else {
        await zingo();
      }
      fn();
    }`,
          },
        ],
      },
    ],
  },
  {
    code: `async function awaitNestedFor() {
      for (const b of baz()) {
        await qux();
      }
      fn();
    }`,
    errors: [
      {
        line: 3,
        suggestions: [
          {
            messageId: 'insertAwaitNull',
            output: `async function awaitNestedFor() {
      await null;for (const b of baz()) {
        await qux();
      }
      fn();
    }`,
          },
        ],
      },
    ],
  },
  {
    code: `async function awaitNestedForAwaitOf() {
      if (bingo()) {
        for await (const b of baz()) {
          await qux();
        }
      }
      fn();
    }`,
    errors: [
      {
        line: 3,
        suggestions: [
          {
            messageId: 'insertAwaitNull',
            output: `async function awaitNestedForAwaitOf() {
      await null;if (bingo()) {
        for await (const b of baz()) {
          await qux();
        }
      }
      fn();
    }`,
          },
        ],
      },
      { line: 4, messageId: 'unexpectedNestedAwait' },
    ],
  },
  {
    code: `async function awaitNestedTryCatch() {
      try {
        await zot();
      } catch {
        fn();
      }
    }`,
    errors: [
      {
        line: 3,
        suggestions: [
          {
            messageId: 'insertAwaitNull',
            output: `async function awaitNestedTryCatch() {
      await null;try {
        await zot();
      } catch {
        fn();
      }
    }`,
          },
        ],
      },
    ],
  },
  {
    code: `async function awaitNestedTryFinally() {
      try {
        await zot();
      } finally {
        fn();
      }
    }`,
    errors: [
      {
        line: 3,
        suggestions: [
          {
            messageId: 'insertAwaitNull',
            output: `async function awaitNestedTryFinally() {
      await null;try {
        await zot();
      } finally {
        fn();
      }
    }`,
          },
        ],
      },
    ],
  },
  {
    code: `async function awaitNestedTryCatchFinally() {
      try {
        zot();
      } catch {
        await boo();
      } finally {
        fn();
      }
    }`,
    errors: [
      {
        line: 5,
        suggestions: [
          {
            messageId: 'insertAwaitNull',
            output: `async function awaitNestedTryCatchFinally() {
      await null;try {
        zot();
      } catch {
        await boo();
      } finally {
        fn();
      }
    }`,
          },
        ],
      },
    ],
  },
];

// These cases are not obviously balanced, but they do not have statements that
// are ambiguously within the synchronous prelude.  They will cause the
// simplistic `safe-await-separator` rule to report an error, but some more
// precise future rule may accept them without error.
const subtlyValid = [
  {
    code: `async function awaitFunctionArgumentBeforeCall() {
      fn(await bar());
    }`,
    errors: [
      {
        line: 2,
        suggestions: [
          {
            messageId: 'insertAwaitNull',
            output: `async function awaitFunctionArgumentBeforeCall() {
      await null;fn(await bar());
    }`,
          },
        ],
      },
    ],
  },
  {
    code: `async function awaitBalancedIf() {
      if (baz()) {
        await qux();
      } else {
        await quux();
      }
      zot();
    }`,
    errors: [
      {
        line: 3,
        suggestions: [
          {
            messageId: 'insertAwaitNull',
            output: `async function awaitBalancedIf() {
      await null;if (baz()) {
        await qux();
      } else {
        await quux();
      }
      zot();
    }`,
          },
        ],
      },
      { line: 5, messageId: 'unexpectedNestedAwait' },
    ],
  },
  {
    code: `async function awaitUnbalancedThenAtTail() {
      if (baz()) {
        await qux();
      }
    }`,
    errors: [
      {
        line: 3,
        suggestions: [
          {
            messageId: 'insertAwaitNull',
            output: `async function awaitUnbalancedThenAtTail() {
      await null;if (baz()) {
        await qux();
      }
    }`,
          },
        ],
      },
    ],
  },
  {
    code: `async function awaitUnbalancedElseAtTail() {
      if (baz()) {
        // empty
      } else {
        await zingo();
      }
    }`,
    errors: [
      {
        line: 5,
        suggestions: [
          {
            messageId: 'insertAwaitNull',
            output: `async function awaitUnbalancedElseAtTail() {
      await null;if (baz()) {
        // empty
      } else {
        await zingo();
      }
    }`,
          },
        ],
      },
    ],
  },
  {
    code: `async function awaitNestedForAtTail() {
      for (const b of baz()) {
        await qux();
      }
    }`,
    errors: [
      {
        line: 3,
        suggestions: [
          {
            messageId: 'insertAwaitNull',
            output: `async function awaitNestedForAtTail() {
      await null;for (const b of baz()) {
        await qux();
      }
    }`,
          },
        ],
      },
    ],
  },
  {
    code: `async function awaitNestedForAwaitOfAtTail() {
      if (bingo()) {
        for await (const b of baz()) {
          await qux();
        }
      }
    }`,
    errors: [
      {
        line: 3,
        suggestions: [
          {
            messageId: 'insertAwaitNull',
            output: `async function awaitNestedForAwaitOfAtTail() {
      await null;if (bingo()) {
        for await (const b of baz()) {
          await qux();
        }
      }
    }`,
          },
        ],
      },
      { line: 4, messageId: 'unexpectedNestedAwait' },
    ],
  },
];

module.exports = {
  validNoNestedAwait,
  validSafeAwaitSeparator,
  clearlyInvalid,
  subtlyValid,
};
