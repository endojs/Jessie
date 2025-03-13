// @ts-check
/// <reference path="../src/peg.d.ts"/>
import { test } from './prepare-test-env-ava.js';

import { justin } from '../src/main.js';
import { makeParserUtils } from './parser-utils.js';

test('data', t => {
  const { parse, arr, ast } = makeParserUtils(justin, (val, message) =>
    t.assert(val, message),
  );
  t.deepEqual(parse(`12345`), ast(0, 'data', 12345));
  t.deepEqual(parse(`{}`), ast(0, 'record', []));
  t.deepEqual(parse(`[]`), ast(0, 'array', []));
  t.deepEqual(
    parse(`{"abc": 123}`),
    ast(
      0,
      'record',
      arr([ast(1, 'prop', ast(1, 'data', 'abc'), ast(8, 'data', 123))]),
    ),
  );
  t.deepEqual(
    parse('["abc", 123]'),
    ast(0, 'array', arr([ast(1, 'data', 'abc'), ast(8, 'data', 123)])),
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

test('holes', t => {
  const parseBLD = units => {
    const { testTag: testJustin } = makeParserUtils(justin, (val, message) =>
      t.assert(val, message),
    );
    const {
      result,
      tools: { ast, nest, hole },
    } = testJustin`make(BLD, ${units}, 'additional arg')`;
    assert(result.status === 'fulfilled', 'parse failed');
    const parsed = result.value;

    t.deepEqual(
      parsed.ast,
      ast(
        nest(
          0,
          'call',
          nest(0, 'use', 'make'),
          nest(
            4,
            nest(5, 'use', 'BLD'),
            hole(0, 'exprHole', 0),
            nest(2, 'data', 'additional arg'),
          ),
        ),
      ),
    );

    t.assert(Array.isArray(parsed.holes));
    const expected = [units];
    t.is(parsed.holes.length, expected.length);
    expected.map((v, i) => t.is(parsed.holes[i], v, `hole ${i} is ${v}`));

    return parsed;
  };

  const p1 = parseBLD(BigInt(123));
  const p2 = parseBLD(BigInt(123));
  t.deepEqual(p1, p2);
  t.is(p1.ast, p2.ast);

  const p3 = parseBLD(456);
  t.notDeepEqual(p2, p3);
  t.is(p1.ast, p3.ast);
});

test('binops', t => {
  const { parse, ast } = makeParserUtils(justin, (val, message) =>
    t.assert(val, message),
  );
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
