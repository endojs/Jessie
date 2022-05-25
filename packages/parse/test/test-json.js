/// <reference path="../src/peg.d.ts"/>
import { test } from './prepare-test-env-ava.js';
import bootPeg from '../src/boot-peg.js';
import bootPegAst from '../src/boot-pegast.js';
import makePeg from '../src/quasi-peg.js';

import makeJSON from '../src/quasi-json.js';
import { ast, makeParser } from './parser-utils.js';

function defaultJsonParser() {
  const pegTag = bootPeg(makePeg, bootPegAst);
  const jsonTag = makeJSON(pegTag);
  return makeParser(jsonTag);
}

test('data', t => {
  const parse = defaultJsonParser();
  t.deepEqual(parse('{}'), ast(0, 'record', []));
  t.deepEqual(parse('[]'), ast(0, 'array', []));
  t.deepEqual(parse('123'), ast(0, 'data', 123));
  t.deepEqual(
    parse('{"abc": 123}'),
    ast(0, 'record', [
      ast(1, 'prop', ast(1, 'data', 'abc'), ast(8, 'data', 123)),
    ]),
  );
  t.deepEqual(
    parse('["abc", 123]'),
    ast(0, 'array', [ast(1, 'data', 'abc'), ast(8, 'data', 123)]),
  );
  t.deepEqual(parse('"\\f\\r\\n\\t\\b"'), ast(0, 'data', '\f\r\n\t\b'));
});
