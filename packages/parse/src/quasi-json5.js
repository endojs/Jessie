// Subsets of JavaScript, starting from the grammar as defined at
// http://www.ecma-international.org/ecma-262/9.0/#sec-grammar-summary

import { toUtf8 } from './unicode.js';

// Defined to be extended into the Jessie grammar.
// See https://github.com/endojs/Jessie/blob/main/README.md
// for documentation of the Jessie grammar.

// From https://spec.json5.org: "The JSON5 Data Interchange Format is a proposed
// extension to JSON that aims to make it easier for humans to write and maintain
// by hand."

// JSON5 relieves many of the pain points of using JSON as a data format:
//   * unquoted identifier property names.
//   * optional single trailing comma in Object and Array literals.
//   * comments (both single-line and multi-line).
//   * additional whitespace characters.
//   * multi-line strings by escaping line terminator sequences.
//   * strings may contain escaped characters.
//   * includes all floating point values: NaN, Infinity, -Infinity.
//   * numbers may have a leading or trailing decimal point.
//   * numbers may be preceded by a single plus sign.
//   * hexadecimal numbers.

// JSON5 is defined to be extended into the Justin grammar, which is defined to
// be extended into the Jessie grammar (which is likewise defined to be extended
// into the JavaScript grammar).  See
// https://github.com/endojs/Jessie/blob/main/README.md for documentation of the
// Jessie grammar.

/// <reference path="./peg.d.ts"/>

/**
 * @param {IPegTag<IParserTag<any>>} peg
 */
const makeJSON5 = peg => {
  const { EAT, FAIL, SKIP } = peg;
  const LS = toUtf8(0x2028);
  const PS = toUtf8(0x2029);
  const ZWJ = toUtf8(0x200d);
  const ZWNJ = toUtf8(0x200c);

  /** @type {RegExp | null} */
  let unicodeLetterRegExp;
  try {
    unicodeLetterRegExp = new RegExp(
      String.raw`\p{Lu}|\p{Ll}|\p{Lt}|\p{Lm}|\p{Lo}|\p{Nl}`,
      'u',
    );
  } catch (e) {
    unicodeLetterRegExp = null;
  }

  /** @type {RegExp | null} */
  let unicodeCombiningMarkRegExp;
  try {
    unicodeCombiningMarkRegExp = new RegExp(String.raw`\p{Mn}|\p{Mc}`, 'u');
  } catch (e) {
    unicodeCombiningMarkRegExp = null;
  }

  /** @type {RegExp | null} */
  let unicodeDigitRegExp;
  try {
    unicodeDigitRegExp = new RegExp(String.raw`\p{Nd}`, 'u');
  } catch (e) {
    unicodeDigitRegExp = null;
  }

  /** @type {RegExp | null} */
  let unicodeConnectorPunctuationRegExp;
  try {
    unicodeConnectorPunctuationRegExp = new RegExp(String.raw`\p{Pc}`, 'u');
  } catch (e) {
    unicodeConnectorPunctuationRegExp = null;
  }

  return peg`
    # to be overridden or inherited
    start <- _WS assignExpr _EOF ${ast => (...holes) => ({ ast, holes })};

    # A.1 Lexical Grammar

    LS <- &${(self, pos) => EAT(self, pos, LS)}; # Line separator
    PS <- &${(self, pos) => EAT(self, pos, PS)}; # Paragraph separator
    ZWJ <- &${(self, pos) => EAT(self, pos, ZWJ)}; # Zero-width joiner
    ZWNJ <- &${(self, pos) => EAT(self, pos, ZWNJ)}; # Zero-width non-joiner

    # Allow plus with number strings.
    NUMBER <- '+' numeric _WSN ${(_, num) => num}
    / super.NUMBER;

    numeric <-
      super.numeric
    / heximal
    / 'Infinity' _WSN ${_ => Infinity}
    / 'NaN' _WSN ${_ => NaN};

    # Allow leading/trailing decimal points.
    decimal <-
      super.decimal
    / decNat '.' _WSN ${dec => parseFloat(`${dec}.0`)}
    / frac exp? _WSN ${(frac, exp) => parseFloat(`0${frac}${exp[0] || ''}`)};

    hexDigits <- hex+ ${ds => ds.join('')};
    hexNat <- '0x' hexDigits ${(ox, hs) => ox + hs};
    heximal <-
      hexNat _WSN ${hex => parseInt(hex, 16)};

    character <-
      lineContinuation ${_ => SKIP}
    / super.character;

    lineContinuation <- '\\' lineTerminatorSequence ${_ => SKIP};
    lineTerminatorSequence <- super.lineTerminatorSequence / LS / PS;

    # Define Javascript-style comments.
    _WS <- super._WS (EOL_COMMENT / MULTILINE_COMMENT)?   ${_ => SKIP};
    EOL_COMMENT <- "//" (!lineTerminatorSequence .)* _WS;
    MULTILINE_COMMENT <- "/*" (!"*/" .)* "*/" _WS;

    # Add single-quoted strings.
    STRING <-
      super.STRING
    / "'" (!"'" character)* "'" _WS  ${(_, cs) => cs.join('')};

    escape <-
      "\\'" ${_ => "'"}
    / '\\0' ${_ => '\x00'}
    / super.escape
    / '\\v' ${_ => '\x0b'};

    # A.2 Expressions

    # Optional trailing commas.

    pureArray <-
      super.pureArray
    / LEFT_BRACKET pureExpr ** _COMMA _COMMA? RIGHT_BRACKET ${(_, es) => [
      'array',
      es,
    ]};

    array <-
      super.array
    / LEFT_BRACKET element ** _COMMA _COMMA? RIGHT_BRACKET  ${(_, es) => [
      'array',
      es,
    ]};

    pureRecord <-
      LEFT_BRACE purePropDef ** _COMMA _COMMA? RIGHT_BRACE ${(_, ps) => [
        'record',
        ps,
      ]};
  
    record <-
      LEFT_BRACE propDef ** _COMMA _COMMA? RIGHT_BRACE      ${(_, ps) => [
        'record',
        ps,
      ]};

    # No computed property name
    propName <-
      super.propName
    / IDENT_NAME ${id => ['data', id]}
    / NUMBER;

    IDENT_NAME <- !("__proto__" _WSN) (RESERVED_WORD _WSN / IDENT);

    IDENT <-
      !RESERVED_WORD
      IDENT_START IDENT_PART* _WSN ${(start, parts) => start + parts.join('')};

    # Any character in the Unicode category "Decimal number (Nd)"
    unicodeDigit <-
      digit
    / utf8 ${u =>
      unicodeDigitRegExp && unicodeDigitRegExp.test(u) ? u : FAIL};

    # Any character in the Unicode categories "Uppercase letter (Lu)",
    # "Lowercase letter (Ll)", "Titlecase letter (Lt)", "Modifier letter (Lm)",
    # "Other letter (Lo)", or "Letter number (Nl)"
    unicodeLetter <-
      [A-Za-z]
    / utf8 ${u =>
      unicodeLetterRegExp && unicodeLetterRegExp.test(u) ? u : FAIL};

    # Any character in the Unicode categories “Non-spacing mark (Mn)” or “Combining spacing mark (Mc)”
    unicodeCombiningMark <- utf8 ${u =>
      unicodeCombiningMarkRegExp && unicodeCombiningMarkRegExp.test(u)
        ? u
        : FAIL};

    # Any character in the Unicode category "Connector punctuation (Pc)"
    unicodeConnectorPunctuation <- utf8 ${u =>
      unicodeConnectorPunctuationRegExp &&
      unicodeConnectorPunctuationRegExp.test(u)
        ? u
        : FAIL};

    IDENT_START <- super.IDENT_START / unicodeLetter / unicodeEscape;
    IDENT_PART <-
      super.IDENT_PART
    / unicodeCombiningMark
    / unicodeDigit
    / unicodeConnectorPunctuation
    / ZWNJ
    / ZWJ;

    # Omit "async", "arguments", "eval", "get", and "set" from IDENT
    # in Justin even though ES2017 considers them in IDENT.
    RESERVED_WORD <-
      (KEYWORD / RESERVED_KEYWORD / FUTURE_RESERVED_WORD
    / "null" / "false" / "true"
    / "async" / "arguments" / "eval" / "get" / "set") _WSN;

    KEYWORD <-
      ("break"
    / "case" / "catch" / "const" / "continue"
    / "debugger" / "default"
    / "else" / "export"
    / "finally" / "for" / "function"
    / "if" / "import"
    / "return"
    / "switch"
    / "throw" / "try" / "typeof"
    / "void"
    / "while") _WSN;

    # Unused by JSON5 but enumerated here, in order to omit them
    # from the IDENT token.
    RESERVED_KEYWORD <-
     ("await" /
    / "class"
    / "delete" / "do"
    / "extends"
    / "instanceof" / "in"
    / "new"
    / "super"
    / "this"
    / "var"
    / "with"
    / "yield") _WSN;

    FUTURE_RESERVED_WORD <-
      ("enum"
    / "implements" / "package" / "protected"
    / "interface" / "private" / "public") _WSN;
  `;
};

export default makeJSON5;
