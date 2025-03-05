/// <reference path="../src/peg.d.ts"/>
import * as util from 'util';
import tagToStringOnlyTag from '../src/tag-string.js';

let curSrc = '';

/**
 * @param {IParserTag<any>} tag
 */
export function makeParser(tag) {
  /** @type {IParserTag<any>} */
  const stringTag = tagToStringOnlyTag(tag);
  /**
   * @param {string} src
   * @param {boolean} [doDump]
   * @param {boolean} [doDebug]
   */
  return (src, doDump = false, doDebug = false) => {
    curSrc = src;
    const dtag = doDebug ? stringTag.options({ debug: true }) : stringTag;
    const parsed = dtag`${src}`;
    if (doDump) {
      // tslint:disable-next-line:no-console
      console.log('Dump:', util.inspect(parsed, { depth: Infinity }));
      doDump = false;
    }
    return parsed;
  };
}

/**
 *
 * @param {number} pos
 * @param  {...unknown} args
 */
export function ast(pos, ...args) {
  return Object.assign(args, {
    _pegPosition: `${JSON.stringify(curSrc[pos])} #0:${pos}`,
  });
}
