// @ts-check
/* globals globalThis */
/// <reference path="../src/peg.d.ts"/>
import * as util from 'util';

/**
 * @typedef {(val: any, message?: string) => asserts val} Assert
 */

/**
 * @typedef {{
 *   args: any[],
 *   result: PromiseSettledResult<any>
 * }} TestCall
 */

/**
 * @typedef {ReturnType<typeof makeAstBuilders>} TestTools
 */

/**
 * @typedef {IParserTag<any, TestCall & { tools: TestTools }>} TestTag
 */

/**
 * @type {Assert}
 */
const globalAssert = globalThis.assert;

/**
 * Map an array of nodes, also calling thunks for nodes.
 *
 * @param {any[]} args
 */
const arr = args =>
  args.map(a => {
    if (typeof a === 'function') {
      return a();
    }
    return a;
  });

const setPosition = (node, position) => {
  const mappedArgs = arr(node);
  return Object.assign(mappedArgs, {
    _pegPosition: position,
  });
};

/** @param {string[]} tmpl */
const makeAstBuilders = tmpl => {
  let nextHole = 0;

  /**
   * Create an internal AST node.
   *
   * @param {number} pos
   * @param {...unknown} node
   */
  const nest = (pos, ...node) => {
    const nh = nextHole;
    assert(
      nh < tmpl.length,
      `next hole ${nh} is more than template ${tmpl.length}`,
    );
    const ts = tmpl[nh];
    assert(
      pos < ts.length,
      `position ${pos} for templateString ${nh} is past ${ts.length}`,
    );
    return () => {
      const posNode = setPosition(
        node,
        `${JSON.stringify(tmpl[nextHole][pos])} #${nextHole}:${pos}`,
      );
      return posNode;
    };
  };

  /**
   * Make an AST node that represents a hole to be filled in by the parser's
   * template arguments.
   *
   * @param {number} index
   * @param  {...any} node
   */
  const hole = (index, ...node) => {
    assert(
      index === nextHole,
      `index ${index} is not expected next hole ${nextHole}`,
    );
    const thisHole = nextHole;
    const nh = thisHole + 1;
    assert(
      nh < tmpl.length,
      `next hole ${nh} is more than template ${tmpl.length}`,
    );
    return () => {
      const posNode = setPosition(node, `hole #${index}`);
      nextHole = nh;
      return posNode;
    };
  };

  /**
   * The root of an AST.
   *
   * @param {number | (() => any)} posOrThunk
   * @param  {any[]} node
   */
  const ast = (posOrThunk, ...node) => {
    nextHole = 0;
    if (typeof posOrThunk !== 'function') {
      posOrThunk = nest(posOrThunk, ...node);
    }
    return posOrThunk();
  };

  return { ast, arr, nest, hole };
};

/**
 * @param {TestTag} testTag
 * @param {Assert} assert
 */
const makeSerialParseWithTools = (testTag, assert) => {
  /**
   * @type {TestTools}
   */
  let currentTestTools;

  /**
   * @type {TestTools}
   */
  const parseTestTools = {
    arr,
    ast: (...args) => currentTestTools.ast(...args),
    nest: (...args) => currentTestTools.nest(...args),
    hole: (...args) => currentTestTools.hole(...args),
  };

  /**
   * This convenience `parse` updates the behaviour of `parseTestTools` with
   * every call That means you must finish using the test tools to process a
   * single `parse` at a time before running the next `parse`.
   *
   * @param {string} src
   * @param {boolean} [doDump]
   * @param {boolean} [doDebug]
   */
  const parse = (src, doDump = false, doDebug = false) => {
    const tmpl = Object.assign([src], { raw: [src] });
    const dtag = doDebug ? testTag.options({ debug: true }) : testTag;
    const { result, tools } = dtag(tmpl);
    assert(result.status === 'fulfilled', 'parse failed');
    const parsed = result.value;
    currentTestTools = tools;
    if (doDump) {
      // tslint:disable-next-line:no-console
      console.log('Dump:', util.inspect(parsed, { depth: Infinity }));
      doDump = false;
    }
    return parsed;
  };

  return { parse, ...parseTestTools };
};

/**
 * @param {IParserTag<any>} rawTag
 * @param {Assert} [testAssert]
 */
export function makeParserUtils(rawTag, testAssert) {
  /** @type {Assert} */
  const assert = testAssert || globalAssert;

  /**
   * Return a parser tag which returns testing tools.
   *
   * @param {IParserTag<any>} baseTag parser tag to wrap
   * @returns {TestTag}
   */
  const wrapTag = baseTag => {
    const wrappedTag = (tmpl, ...holes) => {
      /** @type {PromiseSettledResult<any>} */
      let result;
      try {
        const value = baseTag(tmpl, ...holes);
        result = { status: 'fulfilled', value };
      } catch (e) {
        result = { status: 'rejected', reason: e };
      }
      return {
        args: [tmpl, ...holes],
        result,
        tools: makeAstBuilders(tmpl),
      };
    };
    return Object.assign(wrappedTag, {
      options: opts => wrapTag(baseTag.options(opts)),
      parserCreator: baseTag.parserCreator,
      // eslint-disable-next-line no-underscore-dangle
      _asExtending: baseTag._asExtending,
    });
  };

  const testTag = wrapTag(rawTag);

  return { testTag, ...makeSerialParseWithTools(testTag, assert) };
}
