/* global module require */

'use strict';

const USE_JESSIE_BEFORE_FIRST_STATEMENT_REGEXP = /^\s*\/\/\s*@jessie-check\s*$/m;
const USE_JESSIE_FIRST_STATEMENT_REGEXP = /^('use\s+jessie'|"use\s+jessie"|import\s+('@jessie.js\/transform-this-module'|"jessie.js\/transform-this-module"))/;

const { jessieRules } = require('../use-jessie-rules');

function serializeRuleObject(obj) {
  if (Object(obj) !== obj) {
    if (typeof obj === 'string') {
      if (obj.indexOf("'") < 0) {
        // Prefer single-quotes.
        return `'${obj}'`;
      }
    }
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    // Regular array.
    let out = '[';
    let sep = '';
    for (const v of obj) {
      out += `${sep}${serializeRuleObject(v)}`;
      sep = ',';
    }
    return `${out}]`;
  }

  // "record".
  let out = '{';
  let sep = '';
  Object.entries(obj).forEach(([k, v]) => {
    // We assume the key is a legitimate eslint keyword.
    out += `${sep}${k}:${serializeRuleObject(v)}`;
    sep = ',';
  });
  return `${out}}`;
}

function serializeEslintRules(rules) {
  let out = '/* eslint';
  let sep = ' ';
  Object.entries(rules).forEach(([k, v]) => {
    // We assume the key is a legitimate eslint keyword.
    out += `${sep}${k}:${serializeRuleObject(v)}`;
    sep = ',';
  });
  return `${out} */`;
}

// Generate a single line of eslint rules.
const jessieRulesOneLine = serializeEslintRules(jessieRules);

function indexOfFirstStatement(text) {
  let i = 0;
  let slashStarComment = false;

  while (i < text.length) {
    let s = text.substr(i);
    if (slashStarComment) {
      const endComment = s.match(/^.*?\*\//s);
      if (endComment) {
        slashStarComment = false;
        i += endComment[0].length;
      } else {
        return -1;
      }
    } else {
      const ws = s.match(/^\s+/);
      if (ws) {
        i += ws[0].length;
        s = text.substr(i);
      }

      const multilineComment = s.match(/^\/\*/);
      if (multilineComment) {
        slashStarComment = true;
        i += multilineComment[0].length;
      } else {
        const lineComment = s.match(/^\/\/.*/);
        if (lineComment) {
          i += lineComment[0].length;
        } else {
          // No comments, no whitespace.
          return i;
        }
      }
    }
  }
  return -1;
}

function isJessie(text) {
  const pos = indexOfFirstStatement(text);
  if (text.substr(0, pos).match(USE_JESSIE_BEFORE_FIRST_STATEMENT_REGEXP)) {
    return true;
  }
  if (pos >= 0) {
    if (USE_JESSIE_FIRST_STATEMENT_REGEXP.test(text.substr(pos))) {
      return true;
    }
  }
  return false;
}

const prependedText = text => {
  if (!isJessie(text)) {
    return '';
  }
  let prepend = jessieRulesOneLine;
  if (text.startsWith('#!')) {
    prepend += '//';
  }
  if (!prepend.endsWith(' ')) {
    prepend += ' ';
  }
  return prepend;
};

const filenameToPrepend = new Map();
module.exports = {
  preprocess(text, filename) {
    const prepend = prependedText(text);
    if (prepend) {
      filenameToPrepend.set(filename, prepend);
      return [`${prepend}${text}`];
    }
    filenameToPrepend.delete(filename);
    return [text];
  },
  postprocess(messages, filename) {
    if (!filenameToPrepend.has(filename)) {
      return [].concat(...messages);
    }
    const prepend = filenameToPrepend.get(filename);
    const rewritten = messages.flatMap(errors =>
      errors.map(err => {
        if ('fix' in err) {
          // Remove the prepension we inserted.
          const range = err.fix.range.map(offset =>
            Math.max(offset - prepend.length, 0),
          );
          return { ...err, fix: { ...err.fix, range } };
        }
        return err;
      }),
    );
    // console.error('have rewritten', require('util').inspect(rewritten, undefined, Infinity))
    return rewritten;
  },
  supportsAutofix: true,
};
