/// <reference path="../node_modules/@types/jest/index.d.ts"/>
/// <reference path="../../../lib/peg.d.ts"/>
import bootPeg from '../../../lib/boot-peg.js';
import bootPegAst from '../../../lib/boot-pegast.js';
import makePeg from '../../../lib/quasi-peg.js';

import makeJSON from '../../../lib/quasi-json.js';
import makeJustin from '../../../lib/quasi-justin.js';
import {ast, makeParser} from './parser-utils';

function defaultJustinParser() {
  const pegTag = bootPeg(makePeg, bootPegAst);
  const jsonTag = makeJSON(pegTag);
  const justinTag = makeJustin(pegTag.extends(jsonTag));
  return makeParser(justinTag);
}

test('data', () => {
  const parse = defaultJustinParser();
  expect(parse(`12345`)).toEqual(ast(0, 'data', 12345));
  expect(parse(`{}`)).toEqual(ast(0, 'record', []));
  expect(parse(`[]`)).toEqual(ast(0, 'array', []));
  expect(parse(`{"abc": 123}`)).toEqual(ast(0, 'record',
    [ast(1, 'prop', ast(1, 'data', 'abc'), ast(8, 'data', 123))]));
  expect(parse('["abc", 123]')).toEqual(ast(0, 'array', [ast(1, 'data', 'abc'), ast(8, 'data', 123)]));
  expect(parse(`  /* nothing */ 123`)).toEqual(ast(16, 'data', 123));
  expect(parse(`// foo
  // bar
  // baz
  123`)).toEqual(ast(27, 'data', 123));
  expect(parse('"\\f\\r\\n\\t\\b"')).toEqual(ast(0, 'data', '\f\r\n\t\b'));
});

test('binops', () => {
  const parse = defaultJustinParser();
  expect(parse(`2 === 2`)).toEqual(ast(0, '===', ast(0, 'data', 2), ast(6, 'data', 2)));
  expect(parse(`2 < argv`)).toEqual(ast(0, '<', ast(0, 'data', 2), ast(4, 'use', 'argv')));
  expect(parse(`argv < 2`)).toEqual(ast(0, '<', ast(0, 'use', 'argv'), ast(7, 'data', 2)));
});
