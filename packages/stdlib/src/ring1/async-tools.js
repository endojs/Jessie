// @ts-check
// @jessie-check
import { makePromise } from '../ring0/main.js';

/**
 * Resolve returned promise with undefined when `body` returns falsy.
 *
 * This works around Jessie's forbiddance of `await` not at the function-level.
 *
 * @template T
 * @param {() => T | Promise<T>} body perform side-effects, and return truthy if
 * we should run again
 * @returns {Promise<void>}
 */
export const asyncDoWhile = body => {
  return makePromise((resolve, reject) => {
    const loop = async () => {
      const doContinue = await body();
      if (!doContinue) {
        // Resolve the outermost promise.
        resolve(undefined);
        return;
      }

      // Do the loop again.  We are careful not to await so that we don't create a
      // promise chain.
      loop().catch(reject);
    };

    loop().catch(reject);
  });
};
harden(asyncDoWhile);
