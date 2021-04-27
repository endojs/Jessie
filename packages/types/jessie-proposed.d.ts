// jessie-proposed.d.ts - Jessie proposed whitelist
// These are not part of the official Jessie whitelist, but are proposed
// to provide a smoother programming experience.
//
// When they have become a part of:
// https://github.com/Agoric/Jessie/blob/master/src/bundle/whitelist.js
// then they will be moved to lib.jessie.d.ts.
//
// Michael FIG <michael+jessica@fig.org>, 2019-02-23
/// <reference path="./ses.d.ts"/>
interface IMainDependencies {
    applyMethod: (boundThis: any, method: (...args: any[]) => any, args: any[]) => any,
    setComputedIndex: <T>(obj: Record<string | number, any>, index: string | number, value: T) => T,
    readInput: (file: string) => string;
    writeOutput: (file: string, data: string) => void;
}

interface ObjectConstructor {
  assign<T, U>(target: T, source: U): T & U;
  assign<T, U, V>(target: T, source1: U, source2: V): T & U & V;
  assign<T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
  assign(target: object, ...sources: any[]): any;
}

interface PartialConsole {
  readonly debug(...args: any[]): void;
  readonly log(...args: any[]): void;
  readonly info(...args: any[]): void;
  readonly warn(...args: any[]): void;
  readonly error(...args: any[]): void;
}

declare global {
  var console: PartialConsole;
}
declare var console: PartialConsole;
