/// <reference path="peg.d.ts"/>

const transformSingleQuote = (s: string) => {
  let i = 0, qs = '';
  while (i < s.length) {
    const c = s.slice(i, i + 1);
    if (c === '\\') {
      // Skip one char.
      qs += s.slice(i, i + 2);
      i += 2;
    } else if (c === '"') {
      // Quote it.
      qs += '\\"';
      i ++;
    } else {
      // Add it directly.
      qs += c;
      i ++;
    }
  }
  return `"${qs}"`;
};

const deopt = (opt: [] | [any[]]) => {
  return (opt.length === 0 ? opt : opt[0])
};


const makeChainmail = (peg: IPegTag<IParserTag<any>>) => {
    const {FAIL, HOLE, SKIP} = peg;
    return peg`
# start production
start <- _WS typeDecl**(_SEMI*) _EOF  ${v => (..._a: any[]) => v};

typeDecl <- enumDecl / structDecl / interfaceDecl / constDecl;

type <- (primType / "List" _WS / "AnyPointer" _WS / IDENT) typeParameterization?
  ${(id, parms) => (parms.length === 0 ? id : ['ptype', id, ...parms])};

LPAREN <- "(" _WS;
RPAREN <- ")" _WS;
_COMMA <- "," _WS     ${_ => SKIP};

typeParameterization <- LPAREN type**_COMMA RPAREN ${(_, parms, _2) => parms};

primType <- "Void" _WS / "Bool" _WS / intType / floatType / "Text" _WS / "Data" _WS;

# Only "BigInt" is relevant to CapTP.
# Only "BigInt" is not in Cap'n Proto itself, nor maps to anything
# obvious in WASM.
intType <- ("Int8" / "Int16" / "Int32" / "Int64"
/           "UInt8" / "UInt16" / "UInt32" / "UInt64"
/           "BigInt") _WS;

# Only "Float64" is relevant to CapTP
floatType <- ("Float32" / "Float64" / "Float128") _WS;

ENUM <- "enum" _WS;
LBRACE <- "{" _WS;
RBRACE <- "}" _WS;
_SEMI <- ";" _WS ${_ => SKIP};
enumDecl <- ENUM type LBRACE (IDENT _SEMI)* RBRACE
  ${(_, etype, _2, ids, _3) => ['enum', etype, ids]};

STRUCT <- "struct" _WS;
structDecl <- STRUCT type LBRACE memberDecl* RBRACE
  ${(_, stype, _2, members, _3) =>
    ['struct', stype[1], stype[2], members]};

memberDecl <- paramDecl _SEMI / typeDecl;

INTERFACE <- "interface" _WS;
interfaceDecl <- INTERFACE type extends? LBRACE methodDecl* RBRACE
  ${(_, itype, ext, _2, methods, _3) =>
    ['interface', itype, deopt(ext), methods]};

EXTENDS <- "extends" _WS;
extends <- EXTENDS LPAREN type**_COMMA RPAREN
  ${(_, _2, types, _3) => types};

RARROW <- "->" _WS;
paramDecls <- LPAREN paramDecl**_COMMA RPAREN
  ${(_, decls, _2) => decls};
resultDecls <- RARROW LPAREN resultDecl**_COMMA RPAREN
  ${(_, _2, decls, _3) => decls};
methodDecl <- IDENT methodTypeParams? paramDecls resultDecls? _SEMI
  ${(id, tparams, pdecls, rdecls, _) => ['method', id, deopt(tparams), pdecls, deopt(rdecls)]};

LBRACKET <- "[" _WS;
RBRACKET <- "]" _WS;
methodTypeParams <- LBRACKET type**_COMMA RBRACKET
  ${(_, types, _2) => types};

COLON <- ":" _WS;
EQUALS <- "=" _WS;
default <- EQUALS expr ${(_, expr) => expr};
paramDecl <- IDENT COLON type default?
  ${(id, _, type, dflt) => ['param', id, type, ...dflt]};

resultDecl <- IDENT COLON type ${(id, _, type) => ['named', type, id]}
  / type ${(type) => type};

CONST <- "const" _WS;
constDecl <- CONST IDENT COLON type EQUALS expr _SEMI
  ${(_, id, _2, type, _3, expr, _4) => ['const', id, type, expr]};

string <- STRING ${(s) => ['data', JSON.parse(s)]};
number <- NUMBER ${(n) => ['data', JSON.parse(n)]};
expr <- string / number;

_EOF <- ~.;

STRING <- < '"' (~'"' character)* '"' > _WS
  / "'" < (~"'" character)* > "'" _WS  ${s => transformSingleQuote(s)};

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

MINUS <- "-" _WS;
int <- [1-9] digit+
/ digit
/ MINUS digit
/ MINUS [1-9] digit+;

digit <- [0-9];

frac <- '.' digit+;
exp <- [Ee] [+\-]? digit+;

IDENT <-
< [$A-Za-z_] [$A-Za-z0-9_]* > _WSN;

# _WSN is whitespace or a non-ident character.
_WSN <- ~[$A-Za-z_] _WS    ${_ => SKIP};

# Define Javascript-style comments.
_WS <- [\t\n\r ]* (EOL_COMMENT / MULTILINE_COMMENT)?   ${_ => SKIP};
EOL_COMMENT <- "//" (~[\n\r] .)* _WS;
MULTILINE_COMMENT <- "/*" (~"*/" .)* "*/" _WS;

`;

};

export default makeChainmail;
