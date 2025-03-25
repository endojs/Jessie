/// <reference path="../src/peg.d.ts"/>
import { test } from './prepare-test-env-ava.js';

import { json } from '../src/main.js';
import { makeParserUtils } from './parser-utils.js';

test('data', t => {
  const { parse, arr, ast } = makeParserUtils(json);
  t.deepEqual(parse('{}'), ast(0, 'record', []));
  t.deepEqual(parse('[]'), ast(0, 'array', []));
  t.deepEqual(parse('123'), ast(0, 'data', 123));
  t.deepEqual(
    parse('{"abc": 123}'),
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
  t.deepEqual(parse('"\\f\\r\\n\\t\\b"'), ast(0, 'data', '\f\r\n\t\b'));
});
