// Subsets of JavaScript, starting from the grammar as defined at
// http://www.ecma-international.org/ecma-262/9.0/#sec-grammar-summary

// See https://github.com/endojs/Jessie/blob/main/README.md
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

const makeInsulatedJessie = (peg: IPegTag<IParserTag<any>>, jessiePeg: IPegTag<IParserTag<any>>) => {
    const {FAIL, SKIP} = jessiePeg;
    const insulatedTag = jessiePeg`
    # Inherit start production.
    start <- super.start;

    # A.1 Lexical Grammar

    # insulate is reserved by Jessica.
    RESERVED_WORD <- super.RESERVED_WORD / ( "insulate" _WSN );

    # A.5 Scripts and Modules

    useImport <- IMPORT_PFX IDENT                 ${(pfx, id) => ['use', pfx + id]};
    defImport <- IMPORT_PFX IDENT                 ${(pfx, id) => ['def', pfx + id]};

    # A properly hardened expression without side-effects.
    hardenedExpr <-
      "insulate" _WS LEFT_PAREN (pureExpr / useImport) RIGHT_PAREN  ${(fname, _2, expr, _3) =>
                                                        ['call', ['use', fname], [expr]]}
    / super.hardenedExpr;

    # Safe imports don't need to be prefixed.
    safeImportSpecifier <-
      IDENT_NAME AS defVar                 ${(i, _, d) => ['as', i, d[1]]}
    / defVar                               ${(d) => ['as', d[1], d[1]]}
    / "insulate" _WSN                      ${(w) => ['as', w, w]};

    safeModule <-
      STRING ${(s) => { const mod = JSON.parse(s); return isSafeModule(mod) ? mod : FAIL; }};
    `;

    const insulatedExprTag = peg.extends(insulatedTag)`
    # Jump to the expr production.
    start <- _WS expr _EOF              ${e => (..._a: any[]) => e};
    `;

    return [insulatedTag, insulatedExprTag];
};

export default makeInsulatedJessie;
