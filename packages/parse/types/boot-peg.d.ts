export default bootPeg;
/**
 * @template {IPegTag<any>} T
 * @param {MakePeg} makePeg
 * @param {Array<PegDef>} bootPegAst
 * @returns {IPegTag<T>}
 */
declare function bootPeg<T extends IPegTag<any>>(makePeg: MakePeg, bootPegAst: Array<PegDef>): IPegTag<T>;
//# sourceMappingURL=boot-peg.d.ts.map