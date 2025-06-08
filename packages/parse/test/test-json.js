/// <reference path="../src/peg.d.ts"/>
import { test } from './prepare-test-env-ava.js';

import { makeJSONTag, makeJSON5Tag } from '../src/main.js';
import { makeParserUtils } from './parser-utils.js';

test('data', t => {
  // Set the debug option to true for detailed error messages.
  const debug = false;

  const tags = {
    json: makeJSONTag,
    json5: makeJSON5Tag,
  };
  // const peg = bootPeg(makePeg, bootPegAst).options({ debug: true });
  for (const [name, maker] of Object.entries(tags)) {
    t.log(`Testing ${name} parser`);
    const testTag = maker().options({ debug });
    const { parse, arr, ast } = makeParserUtils(testTag);
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
  }
});
