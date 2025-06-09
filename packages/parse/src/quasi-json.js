/* eslint-disable no-bitwise */
// Subsets of JavaScript, starting from the grammar as defined at
// http://www.ecma-international.org/ecma-262/9.0/#sec-grammar-summary

// Defined to be extended into the Jessie grammar.
// See https://github.com/endojs/Jessie/blob/main/README.md
// for documentation of the Jessie grammar.

// See also json.org

/// <reference path="./peg.d.ts"/>

import { fromUtf8 } from './unicode.js';

/**
 * @param {IPegTag<IParserTag<any>>} peg
 */
const makeJSON = peg => {
  const { FAIL, HOLE, SKIP } = peg;
  return peg`
# to be overridden or inherited
start <- _WS assignExpr _EOF          ${ast => (...holes) => ({ ast, holes })};

# to be extended
primaryExpr <- dataStructure;

dataStructure <-
  dataLiteral                             ${d => ['data', d]}
/ array
/ record
/ HOLE                                    ${h => ['exprHole', h]};

# An expression without side-effects.
# to be extended
pureExpr <-
  dataLiteral                             ${d => ['data', d]}
/ pureArray
/ pureRecord
/ HOLE                                    ${h => ['exprHole', h]};

dataLiteral <-
  "null" _WSN ${() => null}
/ "false" _WSN ${() => false}
/ "true" _WSN ${() => true}
/ NUMBER _WSN
/ STRING _WSN;

pureArray <-
  LEFT_BRACKET pureExpr ** _COMMA RIGHT_BRACKET ${(_, es) => ['array', es]};

array <-
  LEFT_BRACKET element ** _COMMA RIGHT_BRACKET ${(_, es) => ['array', es]};

# to be extended
element <- assignExpr;

# The JavaScript and JSON grammars calls records "objects"

pureRecord <-
  LEFT_BRACE purePropDef ** _COMMA RIGHT_BRACE  ${(_, ps) => ['record', ps]};

record <-
  LEFT_BRACE propDef ** _COMMA RIGHT_BRACE  ${(_, ps) => ['record', ps]};

# to be extended
purePropDef <- propName COLON pureExpr     ${(k, _, e) => ['prop', k, e]};

# to be extended
propDef <- propName COLON assignExpr       ${(k, _, e) => ['prop', k, e]};

# to be extended
propName <- STRING                    ${str => {
    if (str === '__proto__') {
      // Don't allow __proto__ behaviour attacks.
      return FAIL;
    }
    return ['data', str];
  }};

# to be overridden
assignExpr <- primaryExpr;

# Lexical syntax

CR <- "\r";
LF <- "\n";
_EOF <- !.;
LEFT_BRACKET <- "[" _WS;
RIGHT_BRACKET <- "]" _WS;
LEFT_BRACE <- "{" _WS;
RIGHT_BRACE <- "}" _WS;
_COMMA <- "," _WS                     ${_ => SKIP};
COLON <- ":" _WS;
MINUS <- "-" _WS;
HOLE <- &${HOLE} _WS;

STRING <- '"' (!'"' character)* '"' _WS ${(_, cs) => cs.join('')};

# Decode UTF-8 characters.
utf8cont <- [\x80-\xbf];
utf8 <-
  [\x00-\x7f]
/ [\xc0-\xdf] utf8cont ${(b0, b1) => String.fromCodePoint(fromUtf8(b0, b1))}
/ [\xe0-\xef] utf8cont utf8cont ${(b0, b1, b2) =>
    String.fromCodePoint(fromUtf8(b0, b1, b2))}
/ [\xf0-\xf7] utf8cont utf8cont utf8cont ${(b0, b1, b2, b3) =>
    String.fromCodePoint(fromUtf8(b0, b1, b2, b3))};

unicodeEscape <-
  '\\u' hex hex hex hex ${(_, h1, h2, h3, h4) => {
    const cp = parseInt(h1 + h2 + h3 + h4, 16);
    return String.fromCodePoint(cp);
  }};

character <-
  ![\\\x00-\x1f] utf8
/ escape
/ unicodeEscape;

escape <- '\\' (
  ["\\/] ${verbatim => verbatim}
/ 'b' ${_ => '\x08'}
/ 'f' ${_ => '\x0c'}
/ 'n' ${_ => '\n'}
/ 'r' ${_ => '\r'}
/ 't' ${_ => '\t'}
) ${(_, c) => c};

hex <- digit / [a-fA-F];

NUMBER <- MINUS? numeric _WSN ${(neg, num) => {
    return neg.length ? -num : num;
  }};

# to be extended
numeric <- decimal _WSN;

decNat <- '0' / !'0' digits;

digit <- [0-9];
digits <- digit+ ${ds => ds.join('')};

frac <- '.' digits ${(dot, ds) => `${dot}${ds}`};
exp <- [Ee] [+\-]? digits ${(e, sign, ds) => `${e}${sign[0] || ''}${ds}`};
decimal <- decNat frac? exp? _WSN ${(nat, frac, exp) =>
    parseFloat(nat + (frac[0] || '') + (exp[0] || ''))};

whitespace <- [\t ];
lineTerminatorSequence <- LF / CR !LF / CR LF;

# _WSN is whitespace or a non-ident character.
_WSN <- !IDENT_PART _WS ${_ => SKIP};
_WS <- (whitespace / lineTerminatorSequence)* ${_ => SKIP};

IDENT_START <- [$a-zA-Z_];
IDENT_PART <- IDENT_START / [0-9];
`;
};

export default makeJSON;
