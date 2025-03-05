import { bootPeg, bootPegAst, makePeg, makeJSON, makeJustin } from './all.js';

export { bootPeg };

// The currently-supported parse tags.

/**
 * Parser template tag that creates new parser template tags from PEGs.
 */
export const peg = bootPeg(makePeg, bootPegAst);

/**
 * JSON parser template tag.
 */
export const json = makeJSON(peg);

/**
 * Justin parser template tag.
 */
export const justin = makeJustin(peg.extends(json));
