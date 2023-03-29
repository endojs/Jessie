/* eslint-disable no-underscore-dangle,func-names,no-use-before-define */
// @ts-check
// A lot of this code is lifted from:
// https://github.com/erights/quasiParserGenerator/tree/master/src/bootbnf.js

/// <reference types="ses"/>
/// <reference path="./peg.d.ts"/>

import '@jessie.js/transform-this-module';

import { makeMap, makeWeakMap } from 'jessie.js';

import indent from './indent.js';

const FAIL = { toString: () => 'FAIL' };
const SKIP = { toString: () => 'SKIP' };

/** @type {PegConstant} */
const LEFT_RECUR = { toString: () => 'LEFT_RECUR' };

/**
 *
 * @param {TemplateStringsArray} template
 * @param {number} pos
 * @returns {[number, number] | number | undefined}
 */
const FIND = (template, pos) => {
  const { raw } = template;
  const numSubs = raw.length - 1;
  let relpos = pos;
  for (let segnum = 0; segnum <= numSubs; segnum += 1) {
    const segment = raw[+segnum];
    const seglen = segment.length;
    if (relpos < seglen) {
      return [segnum, relpos];
    } else if (relpos === seglen && segnum < numSubs) {
      return segnum; // as hole number
    }
    relpos -= seglen + 1; // "+1" for the skipped hole
  }
  return undefined;
};

/** @type {PegEat} */
const EAT = (self, pos, str) => {
  // if (self._options.debug) {
  //    console.warn(`Have ${self.template}`;
  // }
  const found = FIND(self.template, pos);
  if (Array.isArray(found)) {
    const segment = self.template.raw[+found[0]];
    if (typeof str === 'string') {
      if (segment.startsWith(str, found[1])) {
        return [pos + str.length, str];
      }
    } else {
      // Just return the next character.
      return [pos + 1, segment[+found[1]]];
    }
  }
  return [pos, FAIL];
};

/**
 * @param {IPegParser} self
 * @param {PegRuleOrPatt} ruleOrPatt
 * @param {number} pos
 * @param {string} name
 * @returns {any}
 */
const RUN = (self, ruleOrPatt, pos, name) => {
  if (self._options.debug) {
    console.info(`run(f, ${pos}, ${name})`);
  }
  /** @type {Map<PegRuleOrPatt, any>} */
  let posm = self._memo.get(pos);
  if (!posm) {
    posm = makeMap();
    self._memo.set(pos, posm);
  }
  let result = posm.get(ruleOrPatt);
  if (result) {
    if (result === LEFT_RECUR) {
      console.error(`Left recursion on rule: ${name}`);
    }
    self._hits(1);
  } else {
    posm.set(ruleOrPatt, LEFT_RECUR);
    self._misses(1);
    if (typeof ruleOrPatt === 'function') {
      result = ruleOrPatt(self, pos);
    } else if (ruleOrPatt !== undefined) {
      console.error(`Rule missing: ${name}`);
    } else {
      result = EAT(self, pos, ruleOrPatt);
    }
    posm.set(ruleOrPatt, result);
  }
  return result;
};

/**
 * @param {IPegParser} self
 * @returns {[number, Array<string>]}
 */
const lastFailures = self => {
  let maxPos = 0;
  /** @type {Array<string>} */
  let fails = [];
  for (const posArr of self._memo) {
    const posm = posArr[1];
    for (const [ruleOrPatt, result] of posm) {
      if (result !== LEFT_RECUR) {
        const fail =
          typeof ruleOrPatt === 'function'
            ? ruleOrPatt.name.slice(5)
            : JSON.stringify(`${ruleOrPatt}`);
        const [newPos, v] = result;
        if (v === FAIL) {
          if (newPos > maxPos) {
            maxPos = newPos;
            fails = [fail];
          } else if (newPos === maxPos && fails.indexOf(fail) < 0) {
            fails.push(fail);
          }
        }
      }
    }
  }
  return [maxPos, fails];
};

/**
 *
 * @param {IPegParser} self
 * @param {number} _pos
 */
const ERROR = (self, _pos) => {
  const [last, fails] = lastFailures(self);
  const found = FIND(self.template, last);
  const tokStr = Array.isArray(found)
    ? `at ${last} ${makeTokStr(self, found)}`
    : `unexpected EOF after ${makeTokStr(self, FIND(self.template, last - 1))}`;

  const failStr =
    fails.length === 0 ? `stuck` : `looking for ${fails.join(', ')}`;
  const { sources } = self.template;
  console.info(`\
-------template--------
${self.template.raw.reduce((prior, r, i) => {
  if (sources) {
    const s = sources[+i];
    prior += `    ${s.uri}:${s.line}: `;
  }
  prior += `${JSON.stringify(r).slice(0, 50)}\n`;
  return prior;
}, '')}
-------
${failStr}`);
  console.error(`Syntax error ${tokStr}`);
};

/**
 * @param {IPegParser} self
 * @param {[number, number] | number} found
 */
const makeTokStr = (self, found) => {
  if (Array.isArray(found)) {
    const segment = self.template[+found[0]];
    return `${JSON.stringify(segment[+found[1]])} #${found[0]}:${found[1]}`;
  }
  if (typeof found === 'number') {
    return `hole #${found}`;
  }
  return undefined;
};

/**
 * @param {IPegParser} self
 */
const DONE = self => {
  if (self._options.debug) {
    for (const [pos, posm] of self._memo) {
      const fails = [];
      for (const [ruleOrPatt, result] of posm) {
        const name =
          typeof ruleOrPatt === 'function'
            ? ruleOrPatt.name
            : JSON.stringify(ruleOrPatt);
        if (result === LEFT_RECUR) {
          console.info(`${name}(${pos}) => left recursion detector`);
        } else {
          const [newPos, v] = result;
          if (v === FAIL) {
            fails.push(name);
          } else {
            console.debug(`${name}(${pos}) => [${newPos}, ${v}]`);
          }
        }
      }
      if (fails.length >= 1) {
        console.debug(`@${pos} => FAIL [${fails}]`);
      }
    }
    console.info(`hits: ${self._hits(0)}, misses: ${self._misses(0)}`);
  }
};

/** @type {PegPredicate} */
const ACCEPT = (_self, pos) => {
  // Not really needed: useful for incremental compilation.
  return [pos, []];
};

/** @type {PegPredicate} */
const HOLE = (self, pos) => {
  const found = FIND(self.template, pos);
  if (typeof found === 'number') {
    return [pos + 1, found];
  }
  return [pos, FAIL];
};

const lHexDigits = '0123456789abcdef';
const uHexDigits = 'ABCDEF';

/**
 *
 * @param {string} c
 * @returns {number}
 */
const hexDigit = c => {
  let i = lHexDigits.indexOf(c);
  if (i < 0) {
    i = uHexDigits.indexOf(c) + 10;
  }
  if (i < 0) {
    console.error(`Invalid hexadecimal number ${{ c }}`);
  }
  return i;
};

/**
 *
 * @param {string} cs
 * @returns {[string, number]}
 */
const unescape = cs => {
  if (cs[0] !== '\\') {
    return [cs[0], 1];
  }

  // It's an escape.
  let q = cs[1];
  switch (q) {
    case 'b': {
      q = '\b';
      break;
    }
    case 'f': {
      q = '\f';
      break;
    }
    case 'n': {
      q = '\n';
      break;
    }
    case 'r': {
      q = '\r';
      break;
    }
    case 't': {
      q = '\t';
      break;
    }
    case 'x': {
      const ord = hexDigit(cs[2]) * 16 + hexDigit(cs[3]);
      q = String.fromCharCode(ord);
      return [q, 4];
    }
    default: {
      break;
    }
  }
  return [q, 2];
};

/**
 * @template {IPegTag<any>} T
 * @param {MakePeg} makePeg
 * @param {Array<PegDef>} bootPegAst
 * @returns {IPegTag<T>}
 */
const bootPeg = (makePeg, bootPegAst) => {
  /**
   * @param {PegExpr} sexp
   */
  function compile(sexp) {
    let numSubs = 0; // # of holes implied by sexp, so far

    // generated names
    // act_${i}      action parameter
    // rule_${name}  method from peg rule
    // seq_${i}      sequence failure label
    // or_${i}       choice success label
    // pos_${i}      backtrack token index
    // s_${i}        accumulated list of values
    // v_${i}        set to s_${i} on fall thru path

    let alphaCount = 0;
    const vars = ['let value = FAIL'];
    /**
     * @param {string} prefix
     */
    function nextVar(prefix) {
      const result = `${prefix}_${alphaCount}`;
      alphaCount += 1;
      vars.push(result);
      return result;
    }
    function takeVarsSrc() {
      const result = `${vars.join(', ')};`;
      vars.length = 1;
      return result;
    }
    /**
     * @param {string} prefix
     */
    function nextLabel(prefix) {
      const result = `${prefix}_${alphaCount}`;
      alphaCount += 1;
      return result;
    }

    /**
     * @type {{[index: string]: (...args: any[]) => string}}
     */
    const vtable = {
      /** @param {Array<PegDef>} rules */
      peg(...rules) {
        // The following line also initializes numSubs
        const rulesSrc = rules.map(peval).join('\n');

        const paramSrcs = [];
        for (let i = 0; i < numSubs; i += 1) {
          paramSrcs.push(`act_${i}`);
        }
        // rules[0] is the ast of the first rule, which has the form
        // ["def", ruleName, body], so rules[0][1] is the name of
        // the start rule. We prepend "rule_" to get the name of the
        // JS method that implements the start rule. We invoke it
        // with (0) so that it will parse starting at position 0. It
        // returns a pair of the final position (after the last
        // non-EOF token parsed), and the semantic value. On failure
        // to parse, the semantic value will be FAIL.
        const name = rules[0][1];
        return indent`
(function(${paramSrcs.join(', ')}) {
  let myHits = 0, myMisses = 0;
  return baseMemo => (template, options) => {
    const BaseParser = baseMemo({});
    return {...BaseParser,
      template,
      _memo: makeMap(),
      _hits: (i) => myHits += i,
      _misses: (i) => myMisses += i,
      _options: options,
      start: (self) => {
        const pair = RUN(self, self.rule_${name}, 0, ${JSON.stringify(name)});
        if (pair[1] === FAIL) {
          ERROR(self, pair[0]);
        }
        return pair[1];
      },
      done: DONE,
      ${rulesSrc}
  }};
})
`;
      },
      /**
       * @param {string} name
       * @param {PegExpr} body
       */
      def(name, body) {
        const bodySrc = peval(body);
        return indent`
rule_${name}: (self, pos) => {
  ${takeVarsSrc()}
  ${bodySrc}
  return [pos, value];
},`;
      },
      empty() {
        return `value = SKIP;`;
      },
      fail() {
        return `value = FAIL;`;
      },
      /** @param {Array<PegExpr>} choices */
      or(...choices) {
        const labelSrc = nextLabel('or');
        const choicesSrc = choices
          .map(peval)
          .map(
            cSrc => indent`
${cSrc}
if (value !== FAIL) break ${labelSrc};`,
          )
          .join('\n');

        return indent`
${labelSrc}: {
  ${choicesSrc}
}`;
      },
      /** @param {Array<PegExpr>} terms */
      seq(...terms) {
        const posSrc = nextVar('pos');
        const labelSrc = nextLabel('seq');
        const sSrc = nextVar('s');
        const vSrc = nextVar('v');
        const termsSrc = terms
          .map(peval)
          .map(
            termSrc => indent`
${termSrc}
if (value === FAIL) break ${labelSrc};
if (value !== SKIP) ${sSrc}.push(value);`,
          )
          .join('\n');

        return indent`
${sSrc} = [];
${vSrc} = FAIL;
${posSrc} = pos;
${labelSrc}: {
  let beginPos, yytext;
  ${termsSrc}
  if (yytext !== undefined) {
      ${vSrc} = [yytext];
  }
  else {
    ${vSrc} = ${sSrc};
  }
}
if ((value = ${vSrc}) === FAIL) pos = ${posSrc};`;
      },
      /** @param {number} hole */
      pred(hole) {
        numSubs = Math.max(numSubs, hole + 1);
        return `[pos, value] = act_${hole}(self, pos);`;
      },
      /** @param {Array<PegExpr>} terms */
      val0(...terms) {
        // FIXME: Find a better way to specify where < foo > can
        // provide a default semantic action, and to warn
        // when it is in the wrong context.
        const termsSrc = vtable.seq(...terms);
        return indent`
${termsSrc}
if (value !== FAIL && value.length === 1) value = value[0];`;
      },
      /**
       * @param {number} hole
       * @param  {Array<PegExpr>} terms
       */
      act(hole, ...terms) {
        const posSrc = nextVar('pos');
        numSubs = Math.max(numSubs, hole + 1);
        const termsSrc = vtable.seq(...terms);
        return indent`
${posSrc} = pos;
${termsSrc}
if (value !== FAIL) {
    value = act_${hole}(...value);
    if (Array.isArray(value)) {
        value = [...value];
        value._pegPosition = makeTokStr(self, FIND(self.template, ${posSrc}));
    }
}`;
      },
      /**
       * @param {PegExpr} patt
       * @param {PegExpr} sep
       */
      '**': function(patt, sep) {
        // for backtracking
        const posSrc = nextVar('pos');
        // a non-advancing success only repeats once.
        const startSrc = nextVar('pos');
        const sSrc = nextVar('s');
        const pattSrc = peval(patt);
        const sepSrc = peval(sep);
        const sepValSrc = nextVar('sepVal');
        // after first iteration, backtrack to before the separator
        return indent`
${sSrc} = [];
${posSrc} = pos;
${sepValSrc} = SKIP;
while (true) {
  ${startSrc} = pos;
  ${pattSrc}
  if (value === FAIL) {
    pos = ${posSrc};
    break;
  }
  if (${sepValSrc} !== SKIP) ${sSrc}.push(${sepValSrc});
  if (value !== SKIP) ${sSrc}.push(value);
  ${posSrc} = pos;
  ${sepSrc}
  if (value === FAIL) break;
  ${sepValSrc} = value;
  if (pos === ${startSrc}) break;
}
value = ${sSrc};`;
      },
      /**
       * @param {PegExpr} patt
       * @param {PegExpr} sep
       */
      '++': function(patt, sep) {
        const starSrc = vtable['**'](patt, sep);
        return indent`
${starSrc}
if (value.length === 0) value = FAIL;`;
      },
      /** @param {PegExpr} patt */
      '?': function(patt) {
        return vtable['**'](patt, ['fail']);
      },
      /** @param {PegExpr} patt */
      '*': function(patt) {
        return vtable['**'](patt, ['empty']);
      },
      /** @param {PegExpr} patt */
      '+': function(patt) {
        return vtable['++'](patt, ['empty']);
      },
      /** @param {string} ident */
      super(ident) {
        return `[pos, value] = RUN(self, BaseParser.rule_${ident}, pos, ${JSON.stringify(
          `super.${ident}`,
        )});`;
      },
      // PEG extensions.
      begin() {
        // Mark the current pos.
        return `beginPos = pos; value = [];`;
      },
      end() {
        // Use the specified beginPos to extract a string
        return indent`
if (beginPos !== undefined) {
    yytext = '';
    while (beginPos < pos) {
        [beginPos, value] = EAT(self, beginPos);
        if (value === FAIL) {
            break;
        }
        yytext += value;
    }
    beginPos = undefined;
    value = [];
}`;
      },
      /** @param {string} cs */
      cls(cs) {
        // Character class.
        let classStr = '';
        let i = 0;
        const invert = (cs[+i] === '^');
        if (invert) {
          i += 1;
        }
        while (i < cs.length) {
          const [c, j] = unescape(cs.slice(i));
          i += j;
          if (cs[+i] === '-') {
            // It's a range.
            i += 1;
            const [c2, j2] = unescape(cs.slice(i));
            i += j2;
            const min = c.charCodeAt(0);
            const max = c2.charCodeAt(0);
            for (let k = min; k <= max; k += 1) {
              classStr += String.fromCharCode(k);
            }
          } else {
            classStr += c;
          }
        }
        const op = invert ? '>=' : '<';
        const srcCs = JSON.stringify(classStr);
        return indent`
[pos, value] = EAT(self, pos);
if (value !== FAIL) {
    value = ${srcCs}.indexOf(value) ${op} 0 ? FAIL : value;
}
`;
      },
      dot() {
        return indent`
[pos, value] = EAT(self, pos);
`;
      },
      /** @param {string} cs */
      lit(cs) {
        let str = '';
        let i = 0;
        while (i < cs.length) {
          const [c, j] = unescape(cs.slice(i));
          i += j;
          str += c;
        }
        return indent`
[pos, value] = EAT(self, pos, ${JSON.stringify(str)});
`;
      },
      /** @param {PegExpr} patt */
      peek(patt) {
        // for backtracking
        const posSrc = nextVar('pos');
        const pattSrc = peval(patt);
        // if the pattern matches, restore, else FAIL
        // always rewind.
        return indent`
${posSrc} = pos;
${pattSrc}
if (value !== FAIL) {
    value = SKIP;
}
pos = ${posSrc};`;
      },
      /** @param {PegExpr} patt */
      peekNot(patt) {
        // for backtracking
        const posSrc = nextVar('pos');
        const pattSrc = peval(patt);
        // if the pattern matches, FAIL, else success,
        // always rewind.
        return indent`
${posSrc} = pos;
${pattSrc}
value = (value === FAIL) ? SKIP : FAIL;
pos = ${posSrc};`;
      },
    };

    // Allow our vtable to be looked up by name.
    const vtableMap = makeMap(Object.entries(vtable));

    /**
     * @param {PegExpr} expr
     * @returns {string}
     */
    function peval(expr) {
      if (typeof expr === 'string') {
        // We only match idents... literal strings are protected
        // by ['lit', s].
        const nameStr = JSON.stringify(expr);
        return `[pos, value] = RUN(self, self.rule_${expr}, pos, ${nameStr});`;
      }
      const op = vtableMap.get(expr[0]);
      if (!op) {
        console.error(`Cannot find ${expr[0]} in vtable`);
      }
      return op(...expr.slice(1));
    }

    return peval(sexp);
  }

  /**
   * @param {(template: TemplateStringsArray, debug: boolean) => IPegTag<T>} quasiCurry
   * @param {IParserTag['parserCreator']} parserCreator
   * @param {Partial<ParserOptions>} options
   */
  function quasiMemo(quasiCurry, parserCreator, options) {
    const wm = makeWeakMap();
    /**
     *
     * @param {TemplateStringsArray} template
     * @param  {Array<any>} subs
     */
    const templateTag = (template, ...subs) => {
      let quasiRest = wm.get(template);
      if (!quasiRest) {
        quasiRest = quasiCurry(template, options.debug);
        wm.set(template, quasiRest);
      }
      if (typeof quasiRest !== 'function') {
        console.error(`${typeof quasiRest}: ${quasiRest}`);
      }
      return quasiRest(...subs);
    };
    templateTag.parserCreator = parserCreator;
    return templateTag;
  }

  /**
   * @param {PegParserCreator} parserCreator
   * @param {Partial<ParserOptions>} options
   */
  function quasifyParser(parserCreator, options) {
    /**
     * @param {TemplateStringsArray} template
     */
    function baseCurry(template) {
      const parser = parserCreator(template, options);
      if (parser === undefined) {
        console.error(`Cannot curry baseParserCreator`);
      }
      let pair = null;
      try {
        pair = parser.start(parser);
      } finally {
        parser.done(parser); // hook for logging debug output
      }
      return pair;
    }
    return quasiMemo(baseCurry, parserCreator, options);
  }

  const defaultBaseGrammar = quasifyParser(_template => undefined, {});

  /**
   * @param {Array<PegDef>} baseRules
   * @returns {(...baseActions: Array<any>) => IPegTag<T>}
   */
  function metaCompile(baseRules) {
    const baseAST = ['peg', ...baseRules];
    const parserTraitMakerSrc = compile(baseAST);
    // console.trace(`SOURCES: ${parserTraitMakerSrc}\n`;
    // eslint-disable-next-line no-restricted-syntax
    const compartment = new Compartment(
      {
        DONE,
        EAT,
        ERROR,
        FAIL,
        FIND,
        RUN,
        SKIP,
        makeMap,
        makeTokStr,
      },
      {},
    );
    /**
     * @typedef {(base: PegParserCreator) => PegParserCreator} ParserTrait
     */
    /** @type {(...actions: any[]) => ParserTrait} */
    const makeParserTrait = compartment.evaluate(parserTraitMakerSrc);

    /**
     * @param {Array<any>} baseActions
     * @returns {IPegTag<T>}
     */
    function parserTag(...baseActions) {
      const parserTrait = makeParserTrait(...baseActions);
      /** @type {<W, V = any>(baseQuasiParser: IParserTag<V>, opts: Partial<ParserOptions>) => IPegTag<W>} */
      let _asExtending;
      /** @type {IPegTag<T>} */
      let quasiParser;
      /**
       * @template [V=any]
       * @param {IParserTag<V>} baseQuasiParser
       */
      const ext = baseQuasiParser => {
        /**
         * @template X
         * @param {ParserOptions} options
         * @returns {IPegTag<IParserTag<X>>}
         */
        const makeExtensionTag = (options = {}) => {
          /**
           * @param {TemplateStringsArray} template
           * @param {PegHole[]} substs
           */
          const tag = (template, ...substs) => {
            const boundParser = quasiParser(template, ...substs);
            const parserBase = boundParser._asExtending(
              baseQuasiParser,
              options,
            );
            return parserBase;
          };

          const extendedTag = Object.assign(tag, {
            ACCEPT,
            EAT,
            FAIL,
            HOLE,
            SKIP,
            _asExtending,
            extends: ext,
            /** @param {ParserOptions} opts */
            options(opts) {
              return makeExtensionTag({
                ...options,
                ...opts,
              });
            },
            parserCreator: quasiParser.parserCreator,
          });

          return extendedTag;
        };
        return makeExtensionTag();
      };
      /**
       * @template W,[V=any]
       * @param {IParserTag<V>} baseQuasiParser
       * @param {Partial<ParserOptions>} options
       * @returns {IPegTag<W>}
       */
      const boundAsExtending = (baseQuasiParser, options) => {
        const parserCreator = parserTrait(baseQuasiParser.parserCreator);
        const parser = quasifyParser(parserCreator, options);
        return Object.assign(parser, {
          ACCEPT,
          EAT,
          FAIL,
          HOLE,
          SKIP,
          _asExtending,
          extends: ext,
          /** @param {Partial<ParserOptions>} opts */
          options(opts) {
            return _asExtending(baseQuasiParser, { ...options, ...opts });
          },
        });
      };
      _asExtending = boundAsExtending;
      /** @type {typeof defaultBaseGrammar & Pick<IParserTag, '_asExtending' | 'options'>} */
      const boundBaseGrammar = Object.assign(defaultBaseGrammar, {
        _asExtending,
        /**
         * @param {Partial<ParserOptions>} opts
         * @returns {IPegTag<any>}
         */
        options(opts) {
          return _asExtending(boundBaseGrammar, opts);
        },
      });
      quasiParser = _asExtending(boundBaseGrammar, {});
      return quasiParser;
    }
    return parserTag;
  }

  // Bootstrap the compiler with the precompiled pegAst.
  /**
   * @param {TemplateStringsArray} _template
   * @param {Array<any>} actions
   */
  const actionExtractorTag = (_template, ...actions) => actions;
  actionExtractorTag.ACCEPT = ACCEPT;
  actionExtractorTag.HOLE = HOLE;
  actionExtractorTag.SKIP = SKIP;

  // Extract the actions, binding them to the metaCompile function.
  const bootPegActions = makePeg(actionExtractorTag, metaCompile);

  // Create the parser tag from the AST and the actions.
  const compiledAst = metaCompile(bootPegAst);
  const bootPegTag = compiledAst(...bootPegActions);

  // Use the parser tag to create another parser tag that returns the AST.
  const astExtractorTag = makePeg(bootPegTag, defs => (..._) => defs);
  const reparsedPegAst = makePeg(astExtractorTag, undefined);

  // Compare our bootPegTag output to bootPegAst, to help ensure it is
  // correct.  This doesn't defend against a malicious bootPeg,
  // but it does prevent silly mistakes.
  const a = JSON.stringify(bootPegAst, undefined, '  ');
  const b = JSON.stringify(reparsedPegAst, undefined, '  ');
  if (a !== b) {
    console.info(
      `// boot-pegast.js.ts - AUTOMATICALLY GENERATED by boot-peg.js\nexport default ${b};`,
    );
    assert.fail(`reparsedPegAst does not match src/boot-pegast.js`);
  }

  // Use the metaCompiler to generate another parser.
  const finalPegTag = makePeg(bootPegTag, metaCompile);
  return finalPegTag;
};

export default bootPeg;
