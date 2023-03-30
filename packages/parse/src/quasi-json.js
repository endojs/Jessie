// Subsets of JavaScript, starting from the grammar as defined at
// http://www.ecma-international.org/ecma-262/9.0/#sec-grammar-summary

// Defined to be extended into the Jessie grammar.
// See https://github.com/endojs/Jessie/blob/main/README.md
// for documentation of the Jessie grammar.

// See also json.org

/// <reference path="./peg.d.ts"/>

/**
 * @param {IPegTag<IParserTag<any>>} peg
 */
const makeJSON = peg => {
  const { FAIL, HOLE, SKIP } = peg;
  return peg`
# to be overridden or inherited
start <- _WS assignExpr _EOF                ${v => () => v};

# to be extended
primaryExpr <- dataStructure;

dataStructure <-
  dataLiteral                             ${n => ['data', JSON.parse(n)]}
/ array
/ record
/ HOLE                                    ${h => ['exprHole', h]};

# An expression without side-effects.
# to be extended
pureExpr <-
  dataLiteral                             ${n => ['data', JSON.parse(n)]}
/ pureArray
/ pureRecord
/ HOLE                                    ${h => ['exprHole', h]};

dataLiteral <- (("null" / "false" / "true") _WSN / NUMBER / STRING) _WS;

pureArray <-
  LEFT_BRACKET pureExpr ** _COMMA _COMMA? RIGHT_BRACKET ${(_, es, _2) => [
    'array',
    es,
  ]};

array <-
  LEFT_BRACKET element ** _COMMA _COMMA? RIGHT_BRACKET ${(_, es, _2) => [
    'array',
    es,
  ]};

# to be extended
element <- assignExpr;

# The JavaScript and JSON grammars calls records "objects"

pureRecord <-
  LEFT_BRACE purePropDef ** _COMMA _COMMA? RIGHT_BRACE  ${(_, ps, _2) => [
    'record',
    ps,
  ]};

record <-
  LEFT_BRACE propDef ** _COMMA _COMMA? RIGHT_BRACE  ${(_, ps, _2) => [
    'record',
    ps,
  ]};

# to be extended
purePropDef <- propName COLON pureExpr     ${(k, _, e) => ['prop', k, e]};

# to be extended
propDef <- propName COLON assignExpr       ${(k, _, e) => ['prop', k, e]};

# to be extended
propName <- STRING                     ${str => {
    const js = JSON.parse(str);
    if (js === '__proto__') {
      // Don't allow __proto__ behaviour attacks.
      return FAIL;
    }
    return ['data', js];
  }};

# to be overridden
assignExpr <- primaryExpr;

# Lexical syntax

_EOF <- ~.;
LEFT_BRACKET <- "[" _WS;
RIGHT_BRACKET <- "]" _WS;
LEFT_BRACE <- "{" _WS;
RIGHT_BRACE <- "}" _WS;
_COMMA <- "," _WS                     ${_ => SKIP};
COLON <- ":" _WS;
MINUS <- "-" _WS;
HOLE <- &${HOLE} _WS;

STRING <- < '"' (~'"' character)* '"' > _WS;

utf8 <-
  [\xc2-\xdf] utf8cont
/ [\xe0-\xef] utf8cont utf8cont
/ [\xf0-\xf4] utf8cont utf8cont utf8cont;

utf8cont <- [\x80-\xbf];

character <-
  escape
/ '\\u' hex hex hex hex
/ ~'\\' ([\x20-\x7f] / utf8);

escape <- '\\' ['"\\bfnrt];
hex <- digit / [a-fA-F];

NUMBER <- < int frac? exp? > _WSN;

int <- [1-9] digit+
/ digit
/ MINUS digit
/ MINUS [1-9] digit+;

digit <- [0-9];

frac <- '.' digit+;
exp <- [Ee] [+\-]? digit+;

# _WSN is whitespace or a non-ident character.
_WSN <- ~[$A-Za-z_] _WS    ${_ => SKIP};
_WS <- [\t\n\r ]*          ${_ => SKIP};
`;
};

export default makeJSON;
