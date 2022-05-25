// @ts-check
/// <reference path="../src/peg.d.ts"/>
import { test } from './prepare-test-env-ava.js';
import bootPeg from '../src/boot-peg.js';
import bootPegAst from '../src/boot-pegast.js';
import makePeg from '../src/quasi-peg.js';

import makeJSON from '../src/quasi-json.js';
import makeJustin from '../src/quasi-justin.js';
import { ast, makeParser } from './parser-utils.js';

function defaultJustinParser() {
  const pegTag = bootPeg(makePeg, bootPegAst);
  const jsonTag = makeJSON(pegTag);
  const justinTag = makeJustin(pegTag.extends(jsonTag));
  return makeParser(justinTag);
}

test('data', t => {
  const parse = defaultJustinParser();
  t.deepEqual(parse(`12345`), ast(0, 'data', 12345));
  t.deepEqual(parse(`{}`), ast(0, 'record', []));
  t.deepEqual(parse(`[]`), ast(0, 'array', []));
  t.deepEqual(
    parse(`{"abc": 123}`),
    ast(0, 'record', [
      ast(1, 'prop', ast(1, 'data', 'abc'), ast(8, 'data', 123)),
    ]),
  );
  t.deepEqual(
    parse('["abc", 123]'),
    ast(0, 'array', [ast(1, 'data', 'abc'), ast(8, 'data', 123)]),
  );
  t.deepEqual(parse(`  /* nothing */ 123`), ast(16, 'data', 123));
  t.deepEqual(
    parse(`// foo
  // bar
  // baz
  123`),
    ast(27, 'data', 123),
  );
  t.deepEqual(parse('"\\f\\r\\n\\t\\b"'), ast(0, 'data', '\f\r\n\t\b'));
});

test('binops', t => {
  const parse = defaultJustinParser();
  t.deepEqual(
    parse(`2 === 2`),
    ast(0, '===', ast(0, 'data', 2), ast(6, 'data', 2)),
  );
  t.deepEqual(
    parse(`2 < argv`),
    ast(0, '<', ast(0, 'data', 2), ast(4, 'use', 'argv')),
  );
  t.deepEqual(
    parse(`argv < 2`),
    ast(0, '<', ast(0, 'use', 'argv'), ast(7, 'data', 2)),
  );
});
