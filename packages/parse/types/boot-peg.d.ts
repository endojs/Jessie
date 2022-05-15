export default bootPeg;
export type FlagTemplate = TemplateStringsArray | string;
export type TagFunction = (templateOrFlag: FlagTemplate, ...substs: PegHole[]) => W | IPegTag<W>;
/**
 * @template {IPegTag<any>} T
 * @param {MakePeg} makePeg
 * @param {Array<PegDef>} bootPegAst
 * @returns {T}
 */
declare function bootPeg<T extends IPegTag<any>>(makePeg: MakePeg, bootPegAst: Array<PegDef>): T;
