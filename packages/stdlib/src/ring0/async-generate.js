// @ts-check

/**
 * Return an async iterable that produces iterator results via `next`.
 *
 * This works around Jessie's forbiddance of Symbol.
 *
 * @template T,TReturn
 * @param {() => IteratorResult<T, TReturn> |
 *               Promise<IteratorResult<T, TReturn>>
 * } next produce a single-step iterator result
 * @returns {AsyncIterable<T>}
 */
const asyncGenerate = next => {
  return harden({
    [Symbol.asyncIterator]: () => {
      return harden({
        next: async () => harden(next()),
      });
    },
  });
};
harden(asyncGenerate);
export { asyncGenerate };
