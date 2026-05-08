// @ts-check
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from './prepare-test-env-ava.js';

const binPath = fileURLToPath(
  new URL('../bin/jessie-repl.js', import.meta.url),
);

/**
 * Run the REPL bin in a child process, feed `stdinPayload`, and capture output.
 *
 * @param {string} stdinPayload
 * @param {{ timeoutMs?: number }} [opts]
 * @returns {Promise<{ code: number | null, stdout: string, stderr: string }>}
 */
const runBin = (stdinPayload, { timeoutMs = 8000 } = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [binPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', d => (stdout += d.toString()));
    child.stderr.on('data', d => (stderr += d.toString()));
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`timed out\nstdout:\n${stdout}\nstderr:\n${stderr}`));
    }, timeoutMs);
    child.on('exit', code => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
    child.stdin.write(stdinPayload);
    child.stdin.end();
  });

// Regression: lockdown used to crash with
//   SES_UNCAUGHT_EXCEPTION: TypeError: Cannot redefine property: domain
// because Node's `node:domain` module had already locked the property when
// SES tried to tame it. The fix preloads `node:repl` and uses
// `domainTaming: 'unsafe'` in the bin entry.
test('bin starts without SES_UNCAUGHT_EXCEPTION', async t => {
  const { stdout, stderr } = await runBin(`1 + 2\n.exit\n`);
  const combined = `${stdout}\n${stderr}`;
  t.notRegex(combined, /SES_UNCAUGHT_EXCEPTION/);
  t.notRegex(combined, /Cannot redefine property: domain/);
  t.regex(stdout, /3/);
});

// Runtime errors used to print a SES-internal stack trace
// (ses/src/strict-scope-terminator.js, make-evaluate.js, etc.). The REPL
// should show only `Name: message`.
// Lint errors used to render via util.inspect (showing brackets and the
// `messages` array) because `messages` was an enumerable own property. The
// REPL should print only the human-readable message.
test('lint error prints only the message, not the structured object', async t => {
  const { stdout, stderr } = await runBin(`class X {}\n.exit\n`);
  const combined = `${stdout}\n${stderr}`;
  t.regex(combined, /'class' is not allowed in Jessie/);
  t.notRegex(combined, /Uncaught/);
  t.notRegex(combined, /Not Jessie:/);
  t.notRegex(combined, /no-restricted-syntax/);
  t.notRegex(combined, /messages:/);
  t.notRegex(combined, /\[JessieLintError:/);
  t.notRegex(combined, /nodeType:/);
  t.notRegex(combined, /1:1/);
});

test('runtime error prints only Name: message, no SES stack frames', async t => {
  const { stdout, stderr } = await runBin(`x = 1\n.exit\n`);
  const combined = `${stdout}\n${stderr}`;
  t.regex(combined, /ReferenceError: x is not defined/);
  t.notRegex(combined, /strict-scope-terminator/);
  t.notRegex(combined, /make-evaluate/);
  t.notRegex(combined, /compartment-evaluate/);
});
