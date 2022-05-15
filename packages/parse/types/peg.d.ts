/* eslint-disable no-use-before-define,no-unused-vars */
type PegPredicate = (self: any, pos: number) => [number, any];
interface IStringable {
  toString(): string;
}
type PegConstant = Readonly<IStringable>;

type PegRun = (
  self: any,
  ruleOrPatt: PegRuleOrPatt,
  pos: number,
  name: string,
) => [number, string[]];

type PegEat = (
  self: any,
  pos: number,
  str: PegExpr,
) => [number, string | PegConstant];
type PegAction = (...terms: any[]) => any;
type PegHole = PegConstant | PegAction;

interface IBootPegTag<T = any> {
  (template: TemplateStringsArray, ...args: PegHole[]): T;
  ACCEPT: PegPredicate;
  HOLE: PegPredicate;
  SKIP: PegConstant;
}

interface ParserOptions {
  debug: boolean;
}

interface IParserTag<T = any, U = any> {
  (template: TemplateStringsArray, ...args: T[]): U;
  options(opts: Partial<ParserOptions>): IParserTag<T, U>;
  parserCreator: PegParserCreator;
  _asExtending: <V, W>(
    baseQuasiParser: IParserTag<W>,
    options: Partial<ParserOptions>,
  ) => IPegTag<IParserTag<V>>;
}

interface IPegParser {
  _memo: Map<number, Map<PegRuleOrPatt, any>>;
  _debug: boolean;
  _hits: (n?: number) => number;
  _misses: (n?: number) => number;
  template: TemplateStringsArray;
  start: (parser: IPegParser) => any;
  done: (parser: IPegParser) => void;
}

type PegParserCreator = (
  template: TemplateStringsArray,
  options: Partial<ParserOptions>,
) => IPegParser | undefined;

interface IPegTag<T = any> extends IParserTag<any, T> {
  ACCEPT: PegPredicate;
  FAIL: PegConstant;
  HOLE: PegPredicate;
  SKIP: PegConstant;
  EAT: PegEat;
  extends: <W, V>(peg: IParserTag<W>) => IPegTag<IParserTag<V>>;
}

// TODO: Fill out all the tree from PegDef.
type PegExpr = string | any[];
interface PegRule {
  (...args: any[]): any;
  name: string;
}
type PegRuleOrPatt = PegRule | PegExpr;
type PegDef = any[];

type MakePeg = <T = IPegTag<any>, U = IPegTag<IParserTag<any>>>(
  pegTag: IBootPegTag<T>,
  metaCompile: (defs: PegDef[]) => (..._: any[]) => U,
) => T;

type BootPeg<T extends IPegTag<any>> = (
  makePeg: MakePeg,
  bootPegAst: PegDef[],
) => IPegTag<IPegTag<T>>;

type ParserTag<T> = (...baseActions: Array<any>) => IPegTag<T>;
