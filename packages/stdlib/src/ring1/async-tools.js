// @ts-check
import { makePromise } from '../ring0/main';

/**
 * Resolve promise with value when body returns falsy.
 *
 * This works around Jessie's forbiddance of `await` not at the function-level.
 *
 * @template T
 * @param {() => T | Promise<T>} body perform side-effects, and return truthy if
 * we should run again
 * @returns {Promise<void>}
 */
const asyncDoWhile = body => {
  const loop = async (resolve, reject) => {
    const doContinue = await body();
    if (!doContinue) {
      // Resolve the outermost promise.
      resolve(undefined);
      return;
    }

    // Do the loop again.  We are careful not to await so that we don't create a
    // promise chain.
    loop(resolve, reject).catch(reject);
  };

  return makePromise((resolve, reject) => loop(resolve, reject).catch(reject));
};
harden(asyncDoWhile);
export { asyncDoWhile };
