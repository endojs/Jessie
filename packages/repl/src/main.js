// @ts-check
import repl from 'node:repl';
import { lintJessie } from './lint.js';
import { parseProgram, hoistTopLevelDecls, IncompleteInput } from './rewrite.js';

const RED = '\x1b[31m';
const RESET = '\x1b[39m';
/**
 * @param {string} s
 * @param {NodeJS.WritableStream & { isTTY?: boolean }} stream
 */
const inRed = (s, stream) =>
  stream.isTTY && !process.env.NO_COLOR ? `${RED}${s}${RESET}` : s;

/** @typedef {import('eslint').Linter.LintMessage} LintMessage */

/**
 * @typedef {object} JessieEvaluator
 * @property {(src: string) => unknown} evaluate Evaluate a Jessie snippet,
 *   throwing {@link JessieLintError} on subset violations or {@link IncompleteInput}
 *   if the input ends mid-statement.
 * @property {Compartment} compartment The underlying SES compartment whose
 *   `globalThis` holds the persistent bindings.
 */

/**
 * @typedef {object} JessieEvaluatorOptions
 * @property {Record<string, unknown>} [endowments] Properties added to the
 *   compartment's `globalThis` before evaluation begins.
 */

/**
 * @typedef {object} StartReplOptions
 * @property {NodeJS.ReadableStream} [input]
 * @property {NodeJS.WritableStream} [output]
 * @property {Record<string, unknown>} [endowments]
 */

/** Thrown by {@link JessieEvaluator.evaluate} when input violates the Jessie subset. */
export class JessieLintError extends Error {
  /** @param {LintMessage[]} messages */
  constructor(messages) {
    super(messages.map(m => m.message).join('\n'));
    /** @type {LintMessage[]} */
    this.messages = messages;
    // Non-enumerable so Node's REPL writer uses `err.stack` instead of
    // dumping the structured property via util.inspect.
    Object.defineProperty(this, 'messages', { enumerable: false });
  }
}

/**
 * Build a Jessie evaluator backed by a fresh SES `Compartment`.
 *
 * @param {JessieEvaluatorOptions} [options]
 * @returns {JessieEvaluator}
 */
export const makeJessieEvaluator = ({ endowments = {} } = {}) => {
  const compartment = new Compartment({
    globals: { ...endowments },
    __options__: true,
  });

  /** @type {(src: string) => unknown} */
  const evaluate = src => {
    let trimmed = src.replace(/^\s+|\s+$/g, '');
    if (!trimmed) return undefined;

    // REPL convenience: Jessie's `semi: always` rule forbids ASI in source
    // files, but typing `1 + 2` at a prompt should work. Append `;` unless
    // the input already terminates with one or closes a block.
    if (!/[;}]$/.test(trimmed)) trimmed += ';';

    const ast = parseProgram(trimmed);

    const messages = lintJessie(trimmed);
    const fatal = messages.filter(m => m.severity === 2);
    if (fatal.length > 0) throw new JessieLintError(fatal);

    const rewritten = hoistTopLevelDecls(trimmed, ast);
    return compartment.evaluate(rewritten);
  };

  return { evaluate, compartment };
};

/**
 * Start an interactive Jessie REPL on the given streams.
 *
 * Caller is responsible for invoking `lockdown()` (with
 * `domainTaming: 'unsafe'`) before this is called; see the bin entry.
 *
 * @param {StartReplOptions} [options]
 * @returns {repl.REPLServer}
 */
export const startJessieRepl = ({
  input = process.stdin,
  output = process.stdout,
  endowments = {},
} = {}) => {
  const { evaluate } = makeJessieEvaluator({ endowments });

  /** @type {(cmd: string, ctx: unknown, file: string, cb: (err: Error | null, result?: unknown) => void) => void} */
  const evalLine = (cmd, _ctx, _file, cb) => {
    try {
      const value = evaluate(cmd);
      cb(null, value);
    } catch (err) {
      const e = /** @type {Error} */ (err);
      if (e instanceof IncompleteInput) {
        cb(new repl.Recoverable(e));
        return;
      }
      if (e instanceof JessieLintError) {
        // Lint failures aren't really exceptions; render them as plain
        // syntax-error output so the REPL doesn't prepend `Uncaught`.
        output.write(`${inRed(e.message, output)}\n`);
        cb(null);
        return;
      }
      // Node's REPL prints `err.stack` verbatim. SES stacks point inside
      // ses/src/* internals which is just noise to a Jessie user.
      e.stack = inRed(`${e.name}: ${e.message}`, output);
      cb(e);
    }
  };

  return repl.start({
    prompt: 'jessie> ',
    input,
    output,
    eval: evalLine,
    useColors: true,
    ignoreUndefined: true,
  });
};
