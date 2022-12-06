// Subsets of JavaScript, starting from the grammar as defined at
// http://www.ecma-international.org/ecma-262/9.0/#sec-grammar-summary

// See https://github.com/endojs/Jessie/blob/HEAD/README.md
// for documentation of the Jessie grammar defined here.

/// <reference path="peg.d.ts"/>

// Safe Modules are ones that can be imported without
// insulating their symbols.
const isSafeModule = (moduleName: string) => {
  switch (moduleName) {
    case '@agoric/jessie': {
      return true;
    }
    default: {
      return false;
    }
  }
};

type TerminatedBody = [any[][], any[]];
const terminatedBlock = (manyBodies: TerminatedBody[]) => {
  const stmts = manyBodies.reduce<any[][]>((prior, body) => {
    const [bs, t] = body;
    bs.forEach(b => prior.push(b));
    prior.push(t);
    return prior;
  }, []);
  return ['block', stmts];
};

const makeJessie = (peg: IPegTag<IParserTag<any>>, justinPeg: IPegTag<IParserTag<any>>) => {
    const {FAIL, SKIP} = justinPeg;
    const jessieTag = justinPeg`
    # Override rather than inherit start production.
    # Only module syntax is permitted.
    start <- _WS moduleBody _EOF               ${b => (..._a: any[]) => ['module', b]};

    # A.1 Lexical Grammar

    # For proposed eventual send expressions
    # Tildot followed by non-digit.
    LATER <- "~." ~[0-9] _WS;

    # insulate is reserved by Jessica.
    RESERVED_WORD <- super.RESERVED_WORD / ( "insulate" _WSN );

    # A.2 Expressions

    # Jessie primaryExpr does not include "this", ClassExpression,
    # GeneratorExpression, AsyncFunctionExpression,
    # AsyncGenerarorExpression, or RegularExpressionLiteral.
    primaryExpr <-
      super.primaryExpr
    / functionExpr;

    propDef <-
      methodDef
    / super.propDef;

    purePropDef <-
      methodDef
    / super.purePropDef;

    # Recognize pre-increment/decrement.
    prePre <-
      (PLUSPLUS / MINUSMINUS)                          ${op => `pre:${op}`}
    / super.prePre;

    # Extend to recognize proposed eventual get syntax,
    # as well as computed indices and postfix increment/decrement.
    memberPostOp <-
      super.memberPostOp
    / LEFT_BRACKET assignExpr RIGHT_BRACKET        ${(_, e, _2) => ['index', e]}
    / LATER LEFT_BRACKET assignExpr RIGHT_BRACKET  ${(_, _2, e, _3) => ['indexLater', e]}
    / LATER IDENT_NAME                             ${(_, id) => ['getLater', id]};

    # Extend to recognize proposed eventual send syntax.
    # We distinguish b~.foo(x) from calling b~.foo by a post-parsing pass
    callPostOp <-
      super.callPostOp
    / LATER args                                           ${(_, args) => ['callLater', args]};

    postOp <- (PLUSPLUS / MINUSMINUS) _WS;

    # to be extended
    assignExpr <-
      arrowFunc
    / functionExpr
    / lValue postOp                                        ${(lv, op) => [op, lv]}
    / lValue (EQUALS / assignOp) assignExpr                ${(lv, op, rv) => [op, lv, rv]}
    / super.assignExpr
    / primaryExpr;

    # An expression without side-effects.
    pureExpr <-
      arrowFunc
    / super.pureExpr;

    # In Jessie, an lValue is only a variable, a computed index-named
    # property (an array element), or a statically string-named
    # property.
    # We allow assignment to statically string-named fields, since it
    # is useful during initialization and prevented thereafter by
    # mandatory tamper-proofing.

    # to be overridden or extended
    lValue <-
      primaryExpr LEFT_BRACKET indexExpr RIGHT_BRACKET     ${(pe, _, e, _2) => ['index', pe, e]}
    / primaryExpr LATER LEFT_BRACKET indexExpr RIGHT_BRACKET ${(pe, _, _2, e, _3) => ['indexLater', pe, e]}
    / primaryExpr DOT IDENT_NAME                           ${(pe, _, id) => ['get', pe, id]}
    / primaryExpr LATER IDENT_NAME                         ${(pe, _, id) => ['getLater', pe, id]}
    / useVar;

    assignOp <-
      ("*=" / "/=" / "%=" / "+=" / "-="
    / "<<=" / ">>=" / ">>>="
    / "&=" / "^=" / "|="
    / "**=") _WS;


    # A.3 Statements

    # to be extended.
    # The exprStatement production must go last, so PEG's prioritized
    # choice will interpret {} as a block rather than an expression.
    statement <-
      block
    / IF LEFT_PAREN expr RIGHT_PAREN arm ELSE elseArm      ${(_, _2, c, _3, t, _4, e) => ['if', c, t, e]}
    / IF LEFT_PAREN expr RIGHT_PAREN arm                   ${(_, _2, c, _3, t) => ['if', c, t]}
    / breakableStatement
    / terminator
    / IDENT COLON statement                                ${(label, _, stat) => ['label', label, stat]}
    / TRY block catcher finalizer                          ${(_, b, c, f) => ['try', b, c, f]}
    / TRY block catcher                                    ${(_, b, c) => ['try', b, c]}
    / TRY block finalizer                                  ${(_, b, f) => ['try', b, undefined, f]}
    / DEBUGGER SEMI                                        ${(_, _2) => ['debugger']}
    / exprStatement;

    # to be overridden.  In Jessie, only blocks are accepted as arms
    # of flow-of-control statements.
    arm <- block;

    # Allows for
    # if (...) {} else if (...) {} else if (...) {};
    elseArm <-
      arm
    / IF LEFT_PAREN expr RIGHT_PAREN arm ELSE elseArm      ${(_, _2, c, _3, t, _4, e) => ['if', c, t, e]}
    / IF LEFT_PAREN expr RIGHT_PAREN arm                   ${(_, _2, c, _3, t) => ['if', c, t]};

    breakableStatement <-
      FOR LEFT_PAREN declOp forOfBinding OF expr RIGHT_PAREN arm
            ${(_, _2, o, d, _3, e, _4, b) => ['forOf', o, d, e, b]}
    / FOR LEFT_PAREN declaration expr? SEMI expr? RIGHT_PAREN arm ${(_, _2, d, c, _3, i, _4, b) => ['for', d, c, i, b]}
    / WHILE LEFT_PAREN expr RIGHT_PAREN arm                       ${(_, _2, c, _3, b) => ['while', c, b]}
    / SWITCH LEFT_PAREN expr RIGHT_PAREN LEFT_BRACE clause* RIGHT_BRACE
            ${(_, _2, e, _3, _4, bs, _5) => ['switch', e, bs]};

    # Each case clause must end in a terminating statement.
    terminator <-
      "continue" _NO_NEWLINE IDENT SEMI                ${(_, label, _3) => ['continue', label]}
    / "continue" _WS SEMI                              ${(_, _2) => ['continue']}
    / "break" _NO_NEWLINE IDENT SEMI                   ${(_, label, _2) => ['break', label]}
    / "break" _WS SEMI                                 ${(_, _2) => ['break']}
    / "return" _NO_NEWLINE expr SEMI                   ${(_, e, _2) => ['return', e]}
    / "return" _WS SEMI                                ${(_, _2) => ['return']}
    / "throw" _NO_NEWLINE expr SEMI                    ${(_, e, _3) => ['throw', e]};

    block <- LEFT_BRACE body RIGHT_BRACE              ${(_, b, _2) => ['block', b]};
    body <- statementItem*;

    # declaration must come first, so that PEG will prioritize
    # function declarations over exprStatement.
    statementItem <-
      declaration
    / statement;

    # No "class" declaration.
    # No generator, async, or async iterator function.
    declaration <-
      declOp binding ** _COMMA SEMI                    ${(op, decls, _) => [op, decls]}
    / functionDecl;

    declOp <- ("const" / "let") _WSN;

    forOfBinding <- bindingPattern / defVar;
    binding <-
      bindingPattern EQUALS assignExpr                ${(p, _, e) => ['bind', p, e]}
    / defVar EQUALS assignExpr                        ${(p, _, e) => ['bind', p, e]}
    / defVar;

    bindingPattern <-
      LEFT_BRACKET elementParam ** _COMMA RIGHT_BRACKET     ${(_, ps, _2) => ['matchArray', ps]}
    / LEFT_BRACE propParam ** _COMMA RIGHT_BRACE            ${(_, ps, _2) => ['matchRecord', ps]};

    pattern <-
      bindingPattern
    / defVar
    / undefined                                       ${n => ['matchUndefined']}
    / dataLiteral                                     ${n => ['matchData', JSON.parse(n)]}
    / HOLE                                            ${h => ['patternHole', h]};

    # to be overridden
    elementParam <- param;

    param <-
      ELLIPSIS pattern                                ${(_, p) => ['rest', p]}
    / defVar EQUALS assignExpr                        ${(v, _, e) => ['optional', v, e]}
    / pattern;

    propParam <-
      ELLIPSIS pattern                                ${(_, p) => ['restObj', p]}
    / propName COLON pattern                          ${(k, _, p) => ['matchProp', k, p]}
    / defVar EQUALS assignExpr                        ${(id, _, e) => ['optionalProp', id[1], id, e]}
    / defVar                                          ${id => ['matchProp', id[1], id]};

    # Use PEG prioritized choice.
    # TODO emit diagnostic for failure cases.
    exprStatement <-
      ~cantStartExprStatement expr SEMI               ${(e, _2) => e};

    cantStartExprStatement <-
      ("{" / "function" / "async" _NO_NEWLINE "function"
    / "class" / "let" / "[") _WSN;

    # to be overridden
    terminatedBody <- ((~terminator statementItem)* terminator)+   ${(tb) => terminatedBlock(tb)};
    clause <-
      caseLabel+ LEFT_BRACE terminatedBody RIGHT_BRACE ${(cs, _, b, _2) => ['clause', cs, b]};
    caseLabel <-
      CASE expr COLON                                 ${(_, e) => ['case', e]}
    / DEFAULT _WS COLON                                ${(_, _2) => ['default']};

    catcher <- CATCH LEFT_PAREN pattern RIGHT_PAREN block ${(_, _2, p, _3, b) => ['catch', p, b]};
    finalizer <- FINALLY block                        ${(_, b) => ['finally', b]};


    # A.4 Functions and Classes

    functionDecl <-
      FUNCTION defVar LEFT_PAREN param ** _COMMA RIGHT_PAREN block
                                                      ${(_, n, _2, p, _3, b) => ['functionDecl', n, p, b]};

    functionExpr <-
      FUNCTION defVar? LEFT_PAREN param ** _COMMA RIGHT_PAREN block
                                                      ${(_, n, _2, p, _3, b) => ['functionExpr', n[0], p, b]};

    # The assignExpr form must come after the block form, to make proper use
    # of PEG prioritized choice.
    arrowFunc <-
      arrowParams _NO_NEWLINE ARROW block              ${(ps, _2, b) => ['arrow', ps, b]}
    / arrowParams _NO_NEWLINE ARROW assignExpr         ${(ps, _2, e) => ['lambda', ps, e]};

    arrowParams <-
      IDENT                                           ${id => [['def', id]]}
    / LEFT_PAREN param ** _COMMA RIGHT_PAREN           ${(_, ps, _2) => ps};

    # to be extended
    methodDef <-
      method
    / GET propName LEFT_PAREN RIGHT_PAREN block            ${(_, n, _2, _3, b) => ['getter', n, [], b]}
    / SET propName LEFT_PAREN param RIGHT_PAREN block      ${(_, n, _2, p, _3, b) => ['setter', n, [p], b]};

    method <-
      propName LEFT_PAREN param ** _COMMA RIGHT_PAREN block ${(n, _, p, _2, b) => ['method', n, p, b]};


    # A.5 Scripts and Modules

    moduleBody <- moduleItem*;
    moduleItem <-
      SEMI                                               ${_ => SKIP}
    / importDecl
    / exportDecl
    / moduleDeclaration;

    useImport <- IDENT                 ${id => ['use', id]};
    defImport <- IDENT                 ${id => ['def', id]};

    moduleDeclaration <-
      "const" _WSN moduleBinding ** _COMMA SEMI       ${(op, decls) => [op, decls]};

    # A properly hardened expression without side-effects.
    hardenedExpr <-
      dataLiteral                                     ${d => ['data', JSON.parse(d)]}
    / undefined
    / "harden" _WS LEFT_PAREN (pureExpr / useImport) RIGHT_PAREN  ${(fname, _2, expr, _3) =>
        ['call', ['use', fname], [expr]]}
    / useVar;

    # Jessie modules only allow hardened module-level bindings.
    moduleBinding <-
      bindingPattern EQUALS hardenedExpr       ${(p, _, e) => ['bind', p, e]}
    / defVar EQUALS hardenedExpr               ${(p, _, e) => ['bind', p, e]}
    / defVar;

    importClause <-
      STAR AS defImport                         ${(_, _2, d) => ['importBind', [['as', '*', d[1]]]]}
    / namedImports                              ${(n) => ['importBind', n]}
    / defImport _COMMA STAR AS defImport        ${(d, _, _2, d2) => ['importBind', [['as', 'default', d[1]],
                                                  ['as', '*', d2[1]]]]}
    / defImport _COMMA namedImports             ${(d, n) => ['importBind', [['as', 'default', d[1]], ...n]]}
    / defImport                                 ${(d) => ['importBind', [['as', 'default', d[1]]]]};

    safeImportClause <-
      safeNamedImports                          ${(n) => ['importBind', n]};

    importSpecifier <-
      IDENT_NAME AS defImport                   ${(i, _, d) => ['as', i, d[1]]}
    / defImport                                 ${(d) => ['as', d[1], d[1]]};

    # Safe imports don't need to be prefixed.
    safeImportSpecifier <-
      IDENT_NAME AS defVar                 ${(i, _, d) => ['as', i, d[1]]}
    / defVar                               ${(d) => ['as', d[1], d[1]]};

    namedImports <-
      LEFT_BRACE importSpecifier ** _COMMA _COMMA? RIGHT_BRACE ${(_, s, _2) => s};

    safeNamedImports <-
      LEFT_BRACE safeImportSpecifier ** _COMMA _COMMA? RIGHT_BRACE ${(_, s, _2) => s};

    safeModule <-
      STRING ${(s) => JSON.parse(s)};

    importDecl <-
      IMPORT importClause FROM STRING SEMI  ${(_, v, _2, s, _3) => ['import', v, JSON.parse(s)]}
    / IMPORT safeImportClause FROM safeModule SEMI   ${(_, v, _2, s, _3) => ['import', v, s]};

    exportDecl <-
      EXPORT DEFAULT exportableExpr SEMI        ${(_, _2, e, _3) => ['exportDefault', e]}
    / EXPORT moduleDeclaration                  ${(_, d) => ['export', ...d]};

    # to be extended
    exportableExpr <- hardenedExpr;

    # Lexical syntax
    ARROW <- "=>" _WS;
    AS <- "as" _WSN;
    DEBUGGER <- "debugger" _WSN;
    PLUSPLUS <- "++" _WSN;
    MINUSMINUS <- "--" _WSN;
    CASE <- "case" _WSN;
    IF <- "if" _WSN;
    ELSE <- "else" _WSN;
    FOR <- "for" _WSN;
    OF <- "of" _WSN;
    WHILE <- "while" _WSN;
    BREAK <- "break" _WSN;
    CONTINUE <- "continue" _WSN;
    SWITCH <- "switch" _WSN;
    TRY <- "try" _WSN;
    CATCH <- "catch" _WSN;
    FINALLY <- "finally" _WSN;
    GET <- "get" _WSN;
    SET <- "set" _WSN;
    IMPORT <- "import" _WSN;
    EXPORT <- "export" _WSN;
    FROM <- "from" _WSN;
    FUNCTION <- "function" _WSN;
    DEFAULT <- "default" _WSN;
    EQUALS <- "=" _WS;
    SEMI <- ";" _WS;
    STAR <- "*" _WS;
    `;

    const jessieExprTag = peg.extends(jessieTag)`
    # Jump to the expr production.
    start <- _WS expr _EOF              ${e => (..._a: any[]) => e};
    `;

    return [jessieTag, jessieExprTag];
};

export default makeJessie;
