// An extension of the Jessie grammar to facilitate rewriting
// imports/exports as AMD.

/// <reference path="peg.d.ts"/>

const makeJessieModule = (jessiePeg: IPegTag<IParserTag<any>>) => {
    return jessiePeg`
    # Override rather than inherit start production.
    # Only module syntax is permitted.
    start <- _WS moduleBody _EOF               ${b => (..._a: any[]) => ['moduleX', b]};

    # A.5 Scripts and Modules

    insulatedExpr <- < super.insulatedExpr >;

    moduleBody <- moduleItem*;
    moduleItem <-
      < SEMI >
    / importDecl    # Same AST as in Jessie.
    / exportDecl    # Similar AST, but insulatedExpr is source string.
    / < moduleDeclaration >;  # Source string.

    exportDecl <-
      EXPORT DEFAULT < exportableExpr > SEMI    ${e => ['exportDefaultX', e]}
    / EXPORT moduleDeclaration                  ${(_, d) => ['exportX', ...d]};
    `;
};

export default makeJessieModule;
