// @ts-check
import { Parser } from 'acorn';

/** @typedef {import('acorn').Program} Program */
/** @typedef {import('acorn').Node} Node */

/** Thrown by {@link parseProgram} when the input ends mid-statement. */
export class IncompleteInput extends Error {}

/**
 * Parse a snippet as a top-level Jessie/Script program.
 *
 * @param {string} src
 * @returns {Program}
 * @throws {IncompleteInput} if the parse error is at end-of-input
 *   (a hint to the REPL that the user should keep typing).
 */
export const parseProgram = src => {
  try {
    return Parser.parse(src, {
      ecmaVersion: 'latest',
      sourceType: 'script',
      allowAwaitOutsideFunction: true,
      allowReturnOutsideFunction: false,
    });
  } catch (err) {
    const e = /** @type {SyntaxError & { pos?: number, raisedAt?: number }} */ (
      err
    );
    const atEnd = e.pos === src.length || e.raisedAt === src.length;
    if (atEnd || /Unexpected end of input/.test(e.message)) {
      throw new IncompleteInput(e.message);
    }
    throw err;
  }
};

/**
 * Rewrite top-level `const`/`let`/`function id` declarations into
 * assignments on `globalThis`, so that bindings created in one
 * `compartment.evaluate(...)` call survive into later calls.
 *
 * Only `Identifier` patterns are hoisted; destructuring patterns are
 * left as-is (they evaluate but do not persist). When the final
 * top-level statement is a declaration, a trailing `;undefined;` is
 * appended so the program's completion value matches Node REPL's
 * "declaration → undefined" behavior.
 *
 * @param {string} src - the original (already parsed) source text.
 * @param {Program} ast - the AST returned by {@link parseProgram}.
 * @returns {string}
 */
export const hoistTopLevelDecls = (src, ast) => {
  let out = '';
  let cursor = 0;
  const last = ast.body[ast.body.length - 1];
  for (const node of ast.body) {
    out += src.slice(cursor, node.start);

    if (node.type === 'VariableDeclaration') {
      const parts = [];
      for (const d of node.declarations) {
        if (d.id.type === 'Identifier') {
          const init = d.init
            ? `(${src.slice(d.init.start, d.init.end)})`
            : 'undefined';
          parts.push(`globalThis[${JSON.stringify(d.id.name)}] = ${init}`);
        } else {
          parts.push(src.slice(d.start, d.end));
        }
      }
      // eslint-disable-next-line prefer-template -- append clearer
      out += parts.join('; ') + ';';
    } else if (node.type === 'FunctionDeclaration' && node.id) {
      const fn = src.slice(node.start, node.end);
      out += `globalThis[${JSON.stringify(node.id.name)}] = (${fn});`;
    } else {
      out += src.slice(node.start, node.end);
    }
    cursor = node.end;
  }
  out += src.slice(cursor);

  const declLike =
    last &&
    (last.type === 'VariableDeclaration' ||
      last.type === 'FunctionDeclaration');
  if (declLike) out += ';undefined;';
  return out;
};
