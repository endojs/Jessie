// @ts-check
import { makePromise } from './makers';

/**
 * Resolve promise when await asyncPredThunk() returns falsy.
 * 
 * @template T
 * @param {() => (T | Promise<T>)} asyncPredThunk Return truthy or a
 * Promise<truthy> to keep looping.
 * @returns {Promise<T>}
 */
const asyncWhile = asyncPredThunk => {
  const executor = async (resolve, reject) => {
    try {
      const value = await asyncPredThunk();
      if (value) {
        // Do the loop again.
        executor(resolve, reject);
      } else {
        resolve(value);
      }
    } catch (reason) {
      reject(reason);
    }
  };
  return makePromise(executor);
};
harden(asyncWhile);
export { asyncWhile };

/**
 * Return an async iterable that produces values with asyncValThunk.  Finish
 * with the last value when it is falsy.
 * 
 * @template T
 * @param {() => T | Promise<T>} asyncValThunk thunk to call to create the next
 * value. When falsy, finish the iterator.
 * @returns {AsyncIterable<T>}
 */
const asyncAllTruthies = asyncValThunk => {
  return harden({
    [Symbol.asyncIterator]: () => {
      return harden({
        next: async () => {
          const value = await asyncValThunk();
          return harden({
            done: !value,
            value,
          });
        },
      });
    },
  });
};
harden(asyncAllTruthies);
export { asyncAllTruthies };