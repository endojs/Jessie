import {
  bootPeg,
  bootPegAst,
  makePeg,
  makeJSON,
  makeJSON5,
  makeJustin,
} from './all.js';

/**
 * @import { PegDef } from './peg.js';
 */

export { bootPeg };

// The currently-supported parse tags.

/**
 * Parser template tag that creates new parser template tags from PEGs.
 *
 * @param {object} [powers]
 * @param {PegDef[]} [powers.bootAst]
 */
export const makePegTag = ({ bootAst = bootPegAst } = {}) =>
  bootPeg(makePeg, bootAst);

/**
 * JSON parser template tag.
 *
 * @param {object} [powers]
 * @param {IPegTag<IPegTag<any>>} [powers.pegTag]
 */
export const makeJSONTag = ({ pegTag = makePegTag() } = {}) => makeJSON(pegTag);

/**
 * JSON5 parser template tag.
 *
 * @param {object} [powers]
 * @param {IPegTag<IPegTag<any>>} [powers.pegTag]
 * @param {IParserTag<any, { holes: any[], ast: any }>} [powers.jsonTag]
 */
export const makeJSON5Tag = ({
  pegTag = makePegTag(),
  jsonTag = makeJSONTag(),
} = {}) => makeJSON5(pegTag.extends(jsonTag));

/**
 * Justin parser template tag.
 *
 * @param {object} [powers]
 * @param {IPegTag<IPegTag<any>>} [powers.pegTag]
 * @param {IParserTag<any, { holes: any[], ast: any }>} [powers.json5Tag]
 */
export const makeJustinTag = ({
  pegTag = makePegTag(),
  json5Tag = makeJSON5Tag(),
} = {}) => makeJustin(pegTag.extends(json5Tag));
