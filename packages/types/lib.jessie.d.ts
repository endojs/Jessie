// Copyright (C) 2011 Google Inc.
// Copyright (C) 2018 Agoric
// Copyright (C) 2019 Michael FIG <michael+jessica@fig.org>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved. 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0  
 
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, 
MERCHANTABLITY OR NON-INFRINGEMENT. 
 
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

/// <reference no-default-lib="true"/>
/// <reference path="./jessie-proposed.d.ts"/>

// In order according to
// http://www.ecma-international.org/ecma-262/ with chapter
// numbers where applicable

// 18 The Global Object

declare const Infinity: number;
declare const NaN: number;

/**
 * Make all properties in T optional
 */
 type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Make all properties in T required
 */
type Required<T> = {
  [P in keyof T]-?: T[P];
};

/**
 * Make all properties in T readonly
 */
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

/**
 * Exclude from T those types that are assignable to U
 */
type Exclude<T, U> = T extends U ? never : T;

/**
 * Extract from T those types that are assignable to U
 */
type Extract<T, U> = T extends U ? T : never;

/**
 * Construct a type with the properties of T except for those in type K.
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

/**
 * Exclude null and undefined from T
 */
type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Obtain the parameters of a function type in a tuple
 */
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

/**
 * Obtain the parameters of a constructor function type in a tuple
 */
type ConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (...args: infer P) => any ? P : never;

/**
 * Obtain the return type of a function type
 */
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

/**
 * Obtain the return type of a constructor function type
 */
type InstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R ? R : any;

/**
 * Convert string literal type to uppercase
 */
type Uppercase<S extends string> = intrinsic;

/**
 * Convert string literal type to lowercase
 */
type Lowercase<S extends string> = intrinsic;

/**
 * Convert first character of string literal type to uppercase
 */
type Capitalize<S extends string> = intrinsic;

/**
 * Convert first character of string literal type to lowercase
 */
type Uncapitalize<S extends string> = intrinsic;


interface Symbol {}
interface SymbolConstructor {
  readonly toStringTag: symbol;
  readonly iterator: symbol;
}
declare const Symbol: SymbolConstructor;

interface IteratorResult<T> {
  readonly done: boolean;
  readonly value: T;
}

interface Iterator<T> {
  readonly next: (value?: any) => IteratorResult<T>;
  readonly return?: (value?: any) => IteratorResult<T>;
  readonly throw?: (e?: any) => IteratorResult<T>;
}

interface Function {
  (...args: any[]): any;
}
interface IFunction<R, A> {
  (...args: A[]): R;
}
interface RegExp {}

interface IArguments {
  readonly [index: number]: any;
}

interface Iterable<T> {
  readonly [Symbol.iterator]: () => Iterator<T>;
}

interface IterableIterator<T> extends Iterator<T> {
  readonly [Symbol.iterator]: () => IterableIterator<T>;
}

type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};
// 19 Fundamental Objects
interface Object {
  // 19.1
}

interface ObjectConstructor {
  (value: any): any;
  (): any;

  readonly prototype: Object;

  /**
   * Prevents the modification of attributes of existing properties, and prevents the addition of new properties.
   *
   * @param o Object on which to lock the attributes.
   */
  readonly seal: <T>(o: T) => T;

  readonly freeze: ObjectFreeze;

  /**
   * Prevents the addition of new properties to an object.
   *
   * @param o Object to make non-extensible.
   */
  readonly preventExtensions: <T>(o: T) => T;

  /**
   * Returns true if the values are the same value, false otherwise.
   *
   * @param value1 The first value.
   * @param value2 The second value.
   */
  readonly is: (value1: any, value2: any) => boolean;

  readonly entries: ObjectEntries;

  /**
   * Returns the names of the enumerable properties and methods of an object.
   *
   * @param o Object that contains the properties and methods. This can be an object that you create
d or an existing Document Object Model (DOM) object.
   */
  readonly keys: (o: {}) => string[];

  readonly values: ObjectValues;
}

interface ObjectValues {
  /**
   * Returns an array of values of the enumerable properties of an object
   *
   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   */
  <T>(o: { [s: string]: T } | ArrayLike<T>): T[];

  /**
   * Returns an array of values of the enumerable properties of an object
   *
   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   */
  (o: {}): any[];
}

interface ObjectEntries {
  /**
   * Returns an array of key/values of the enumerable properties of an object
   *
   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   */
  <T>(o: { [s: string]: T } | ArrayLike<T>): [string, T][];

  /**
   * Returns an array of key/values of the enumerable properties of an object
   *
   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   */
  (o: {}): [string, any][];
}

interface ObjectFreeze {
  /**
   * Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
   *
   * @param o Object on which to lock the attributes.
   */
  <T>(a: T[]): ReadonlyArray<T>;

  /**
   * Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
   *
   * @param o Object on which to lock the attributes.
   */
  <T extends Function>(f: T): T;

  /**
   * Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
   *
   * @param o Object on which to lock the attributes.
   */
  <T>(o: T): Readonly<T>;
}

declare const Object: ObjectConstructor;

interface Boolean {}

interface BooleanConstructor {
  (value?: any): boolean;
  readonly prototype: Boolean;
}
declare const Boolean: BooleanConstructor; // 19.3

// 20 Numbers and Dates
interface Number {}

interface NumberConstructor {
  // 20.1
  (value?: any): number;
  readonly prototype: Number;

  /**
   * Returns true if passed value is finite.
   * Unlike the global isFinite, Number.isFinite doesn't forcibly convert the parameter to a
   * number. Only finite values of the type number, result in true.
   *
   * @param number A numeric value.
   */
  readonly isFinite: (number: number) => boolean;

  /**
   * Returns a Boolean value that indicates whether a value is the reserved value NaN (not a
   * number). Unlike the global isNaN(), Number.isNaN() doesn't forcefully convert the parameter
   * to a number. Only values of the type number, that are also NaN, result in true.
   *
   * @param number A numeric value.
   */
  readonly isNaN: (number: number) => boolean;

  /**
   * Returns true if the value passed is a safe integer.
   *
   * @param number A numeric value.
   */
  readonly isSafeInteger: (number: number) => boolean;

  /**
   * The value of the largest integer n such that n and n + 1 are both exactly representable as
   * a Number value.
   * The value of Number.MAX_SAFE_INTEGER is 9007199254740991 2^53 − 1.
   */
  readonly MAX_SAFE_INTEGER: number;

  /**
   * The value of the smallest integer n such that n and n − 1 are both exactly representable as
   * a Number value.
   * The value of Number.MIN_SAFE_INTEGER is −9007199254740991 (−(2^53 − 1)).
   */
  readonly MIN_SAFE_INTEGER: number;
}

declare const Number: NumberConstructor;

interface Math {
  // 20.2
  /** The mathematical constant e. This is Euler's number, the base of natural logarithms. */
  readonly E: number;
  /** Pi. This is the ratio of the circumference of a circle to its diameter. */
  readonly PI: number;

  /**
   * Returns the absolute value of a number (the value without regard to whether it is positive or negative).
   * For example, the absolute value of -5 is the same as the absolute value of 5.
   *
   * @param x A numeric expression for which the absolute value is needed.
   */
  readonly abs: (x: number) => number;

  /**
   * Returns the smallest integer greater than or equal to its numeric argument.
   *
   * @param x A numeric expression.
   */
  readonly ceil: (x: number) => number;

  /**
   * Returns the greatest integer less than or equal to its numeric argument.
   *
   * @param x A numeric expression.
   */
  readonly floor: (x: number) => number;

  /**
   * Returns the larger of a set of supplied numeric expressions.
   *
   * @param values Numeric expressions to be evaluated.
   */
  readonly max: (...values: number[]) => number;
  /**
   * Returns the smaller of a set of supplied numeric expressions.
   *
   * @param values Numeric expressions to be evaluated.
   */
  readonly min: (...values: number[]) => number;

  /**
   * Returns a supplied numeric expression rounded to the nearest number.
   *
   * @param x The value to be rounded to the nearest number.
   */
  readonly round: (x: number) => number;

  /**
   * Returns the integral part of the a numeric expression, x, removing any fractional digits.
   * If x is already an integer, the result is x.
   *
   * @param x A numeric expression.
   */
  readonly trunc: (x: number) => number;
}

declare const Math: Math;

// 21 Text Processing

interface String {
  // 21.2
  readonly length: number;

  /**
   * Returns the Unicode value of the character at the specified location.
   *
   * @param index The zero-based index of the desired character. If there is no character at the specified index, NaN is returned.
   */
  readonly charCodeAt: (index: number) => number;

  /**
   * Returns true if the sequence of elements of searchString converted to a String is the
   * same as the corresponding elements of this object (converted to a String) starting at
   * endPosition – length(this). Otherwise returns false.
   */
  readonly endsWith: (searchString: string, endPosition?: number) => boolean;

  /**
   * Returns the position of the first occurrence of a substring.
   *
   * @param searchString The substring to search for in the string
   * @param position The index at which to begin searching the String object. If omitted, search starts at the beginning of the string.
   */
  readonly indexOf: (searchString: string, position?: number) => number;

  /**
   * Returns the last occurrence of a substring in the string.
   *
   * @param searchString The substring to search for.
   * @param position The index at which to begin searching. If omitted, the search begins at the end of the string.
   */
  readonly lastIndexOf: (searchString: string, position?: number) => number;

  /**
   * Returns a section of a string.
   *
   * @param start The index to the beginning of the specified portion of stringObj.
   * @param end The index to the end of the specified portion of stringObj. The substring includes the characters up to, but not including, the character indicated by end.
   * If this value is not specified, the substring continues to the end of stringObj.
   */
  readonly slice: (start?: number, end?: number) => string;

  /**
   * Split a string into substrings using the specified separator and return them as an array.
   *
   * @param separator A string that identifies character or characters to use in separating the string. If omitted, a single-element array containing the entire string is returned.
   * @param limit A value used to limit the number of elements returned in the array.
   */
  readonly split: (separator: string, limit?: number) => string[];

  /**
   * Returns true if the sequence of elements of searchString converted to a String is the
   * same as the corresponding elements of this object (converted to a String) starting at
   * position. Otherwise returns false.
   */
  readonly startsWith: (searchString: string, position?: number) => boolean;

  readonly [index: number]: string;
}
interface TemplateStringsArray extends ReadonlyArray<string> {
  readonly raw: ReadonlyArray<string>;
}

interface StringConstructor {
  (value?: any): string;
  readonly prototype: String;
  fromCharCode(...codes: number[]): string;

  /**
   * String.raw is intended for use as a tag function of a Tagged Template String. When called
   * as such the first argument will be a well formed template call site object and the rest
   * parameter will contain the substitution values.
   *
   * @param template A well-formed template string call site representation.
   * @param substitutions A set of substitution values.
   */
  readonly raw: (
    template: TemplateStringsArray,
    ...substitutions: any[]
  ) => string;
}

declare const String: StringConstructor;

// 22 Indexed Collections

interface ReadonlyArray<T> {
  /**
   * Gets the length of the array. This is a number one higher than the highest element defined in an array.
   */
  readonly length: number;

  readonly [Symbol.iterator]: () => IterableIterator<T>;

  /**
   * Performs the specified action for each element in an array.
   *
   * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   */
  readonly forEach: (
    callbackfn: (value: T, index: number, array: ReadonlyArray<T>) => void,
  ) => void;

  /**
   * Adds all the elements of an array separated by the specified separator string.
   *
   * @param separator A string used to separate one element of an array from the next in the resulti
ng String.
   */
  readonly join: (separator: string) => string;

  /**
   * Returns a section of an array.
   *
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array.
   */
  readonly slice: (start?: number, end?: number) => T[];

  /**
   * Returns the index of the first occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  readonly indexOf: (searchElement: T, fromIndex?: number) => number;
  /**
   * Returns the index of the last occurrence of a specified value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
   */
  readonly lastIndexOf: (searchElement: T, fromIndex?: number) => number;

  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   *
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   */
  readonly map: <U>(
    callbackfn: (value: T, index: number, array: ReadonlyArray<T>) => U,
  ) => U[];
  readonly filter: ArrayFilter<T>;
  readonly reduce: ArrayReduce<T>;
  readonly reduceRight: ArrayReduceRight<T>;
  readonly [n: number]: T;
}

interface ArrayFilter<T> {
  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   *
   * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
   */
  <S extends T>(
    predicate: (value: T, index: number, array: ReadonlyArray<T>) => value is S,
  ): S[];

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   *
   * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
   */
  (predicate: (value: T, index: number, array: ReadonlyArray<T>) => any): T[];
}

interface ArrayReduce<T> {
  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  (
    callbackfn: (
      previousValue: T,
      currentValue: T,
      currentIndex: number,
      array: ReadonlyArray<T>,
    ) => T,
  ): T;
  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  <U>(
    callbackfn: (
      previousValue: U,
      currentValue: T,
      currentIndex: number,
      array: ReadonlyArray<T>,
    ) => U,
    initialValue: U,
  ): U;
}

interface ArrayReduceRight<T> {
  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  (
    callbackfn: (
      previousValue: T,
      currentValue: T,
      currentIndex: number,
      array: ReadonlyArray<T>,
    ) => T,
  ): T;
  (
    callbackfn: (
      previousValue: T,
      currentValue: T,
      currentIndex: number,
      array: ReadonlyArray<T>,
    ) => T,
    initialValue: T,
  ): T;
  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  <U>(
    callbackfn: (
      previousValue: U,
      currentValue: T,
      currentIndex: number,
      array: ReadonlyArray<T>,
    ) => U,
    initialValue: U,
  ): U;
}

interface Array<T> {
  // 22.1
  readonly [Symbol.iterator]: () => IterableIterator<T>;
  /**
   * Gets or sets the length of the array. This is a number one higher than the highest element defined in an array.
   */
  length: number;

  /**
   * Adds all the elements of an array separated by the specified separator string.
   *
   * @param separator A string used to separate one element of an array from the next in the resulti
ng String.
   */
  readonly join: (separator: string) => string;

  /**
   * Removes the last element from an array and returns it.
   */
  readonly pop: () => T | undefined;
  /**
   * Appends new elements to an array, and returns the new length of the array.
   *
   * @param items New elements of the Array.
   */
  readonly push: (...items: T[]) => number;
  /**
   * Returns a section of an array.
   *
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array.
   */
  readonly slice: (start?: number, end?: number) => T[];
  /**
   * Returns the index of the first occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  readonly indexOf: (searchElement: T, fromIndex?: number) => number;
  /**
   * Returns the index of the last occurrence of a specified value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
   */
  readonly lastIndexOf: (searchElement: T, fromIndex?: number) => number;
  /**
   * Performs the specified action for each element in an array.
   *
   * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   */
  readonly forEach: (
    callbackfn: (value: T, index: number, array: T[]) => void,
  ) => void;
  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   *
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   */
  readonly map: <U>(
    callbackfn: (value: T, index: number, array: T[]) => U,
  ) => U[];
  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   *
   * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
   */
  readonly filter: <S extends T>(
    callbackfn: (value: T, index: number, array: T[]) => value is S,
  ) => S[];
  readonly reduce: ArrayReduce<T>;
  readonly reduceRight: ArrayReduceRight<T>;

  [n: number]: T;
}

interface ArrayLike<T> {
  readonly length: number;
  readonly [n: number]: T;
}

interface ArrayConstructor {
  (arrayLength?: number): any[];
  <T>(arrayLength: number): T[];
  <T>(...items: T[]): T[];
  readonly isArray: (arg: any) => arg is Array<any>;
  readonly prototype: Array<any>;

  readonly from: ArrayFrom;

  /**
   * Returns a new array from a set of elements.
   *
   * @param items A set of elements to include in the new array object.
   */
  readonly of: <T>(...items: T[]) => T[];
}
interface ArrayFrom {
  /**
   * Creates an array from an array-like object.
   *
   * @param arrayLike An array-like object to convert to an array.
   */
  <T>(arrayLike: ArrayLike<T>): T[];

  /**
   * Creates an array from an iterable object.
   *
   * @param arrayLike An array-like object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   */
  <T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U): U[];
}

declare const Array: ArrayConstructor;

// 23 Keyed Collections          all ES-Harmony

interface Map<K, V> {
  /** Returns an iterable of entries in the map. */
  readonly [Symbol.iterator]: () => IterableIterator<[K, V]>;

  readonly clear: () => void;
  readonly delete: (key: K) => boolean;
  readonly forEach: (
    callbackfn: (value: V, key: K, map: Map<K, V>) => void,
  ) => void;
  readonly get: (key: K) => V | undefined;
  readonly has: (key: K) => boolean;
  readonly set: (key: K, value: V) => Map<K, V>;
  readonly size: number;

  /**
   * Returns an iterable of key, value pairs for every entry in the map.
   */
  readonly entries: () => IterableIterator<[K, V]>;

  /**
   * Returns an iterable of keys in the map
   */
  readonly keys: () => IterableIterator<K>;

  /**
   * Returns an iterable of values in the map
   */
  readonly values: () => IterableIterator<V>;
}

interface MapConstructor {
  readonly prototype: Map<any, any>;
}
declare const Map: MapConstructor;

interface Set<T> {
  // 23.2
  readonly add: (value: T) => Set<T>;
  readonly clear: () => void;
  readonly delete: (value: T) => boolean;
  readonly forEach: (
    callbackfn: (value: T, value2: T, set: Set<T>) => void,
  ) => void;
  readonly has: (value: T) => boolean;
  readonly size: number;

  /** Iterates over values in the set. */
  readonly [Symbol.iterator]: () => IterableIterator<T>;
  /**
   * Returns an iterable of [v,v] pairs for every value `v` in the set.
   */
  readonly entries: () => IterableIterator<[T, T]>;
  /**
   * Despite its name, returns an iterable of the values in the set,
   */
  readonly keys: () => IterableIterator<T>;

  /**
   * Returns an iterable of values in the set.
   */
  readonly values: () => IterableIterator<T>;
}

interface SetConstructor {
  readonly prototype: Set<any>;
}
declare const Set: SetConstructor;

interface WeakMap<K extends object, V> {
  // 23.3
  readonly delete: (key: K) => boolean;
  readonly get: (key: K) => V | undefined;
  readonly has: (key: K) => boolean;
  readonly set: (key: K, value: V) => WeakMap<K, V>;
}

interface WeakMapConstructor {
  readonly prototype: WeakMap<object, any>;
}
declare const WeakMap: WeakMapConstructor;

interface WeakSet<T extends object> {
  // 23.4
  readonly add: (value: T) => WeakSet<T>;
  readonly delete: (value: T) => boolean;
  readonly has: (value: T) => boolean;
}

interface WeakSetConstructor {
  readonly prototype: WeakSet<object>;
}
declare const WeakSet: WeakSetConstructor;

// 24.4 TODO: Omitting Atomics for now

interface JSON {
  // 24.5
  /**
   * Converts a JavaScript Object Notation (JSON) string into an object.
   *
   * @param text A valid JSON string.
   * @param reviver A function that transforms the results. This function is called for each member of the object.
   * If a member contains nested objects, the nested objects are transformed before the parent object is.
   */
  readonly parse: (
    text: string,
    reviver?: (key: any, value: any) => any,
  ) => any;
  readonly stringify: JSONStringifier;
}

interface JSONStringifier {
  /**
   * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
   *
   * @param value A JavaScript value, usually an object or array, to be converted.
   * @param replacer A function that transforms the results.
   * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
   */
  (
    value: any,
    replacer?: (key: string, value: any) => any,
    space?: string | number,
  ): string;
  /**
   * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
   *
   * @param value A JavaScript value, usually an object or array, to be converted.
   * @param replacer An array of strings and numbers that acts as a approved list for selecting the object properties that will be stringified.
   * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
   */
  (
    value: any,
    replacer?: (number | string)[] | null,
    space?: string | number,
  ): string;
}

/**
 * An intrinsic object that provides functions to convert JavaScript values to and from the JavaScript Object Notation (JSON) format.
 */
declare const JSON: JSON;

interface PromiseLike<T> {
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   *
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  readonly then: <TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ) => PromiseLike<TResult1 | TResult2>;
}

/**
 * Represents the completion of an asynchronous operation
 */
interface Promise<T> {
  // 25.4
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   *
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  readonly then: <TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ) => Promise<TResult1 | TResult2>;

  /**
   * Attaches a callback for only the rejection of the Promise.
   *
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  readonly catch: <TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | undefined
      | null,
  ) => Promise<T | TResult>;
}

interface PromiseConstructor {
  /**
   * A reference to the prototype.
   */
  readonly prototype: Promise<any>;

  readonly all: PromiseAll;
  readonly race: PromiseRace;

  /**
   * Creates a new rejected promise for the provided reason.
   *
   * @param reason The reason the promise was rejected.
   * @returns A new rejected Promise.
   */
  reject<T = never>(reason?: any): Promise<T>;

  readonly resolve: PromiseResolve;
}

interface PromiseAll {
  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
    values: [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>,
      T6 | PromiseLike<T6>,
      T7 | PromiseLike<T7>,
      T8 | PromiseLike<T8>,
      T9 | PromiseLike<T9>,
      T10 | PromiseLike<T10>,
    ],
  ): Promise<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    values: [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>,
      T6 | PromiseLike<T6>,
      T7 | PromiseLike<T7>,
      T8 | PromiseLike<T8>,
      T9 | PromiseLike<T9>,
    ],
  ): Promise<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2, T3, T4, T5, T6, T7, T8>(
    values: [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>,
      T6 | PromiseLike<T6>,
      T7 | PromiseLike<T7>,
      T8 | PromiseLike<T8>,
    ],
  ): Promise<[T1, T2, T3, T4, T5, T6, T7, T8]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2, T3, T4, T5, T6, T7>(
    values: [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>,
      T6 | PromiseLike<T6>,
      T7 | PromiseLike<T7>,
    ],
  ): Promise<[T1, T2, T3, T4, T5, T6, T7]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2, T3, T4, T5, T6>(
    values: [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>,
      T6 | PromiseLike<T6>,
    ],
  ): Promise<[T1, T2, T3, T4, T5, T6]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2, T3, T4, T5>(
    values: [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>,
    ],
  ): Promise<[T1, T2, T3, T4, T5]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2, T3, T4>(
    values: [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
    ],
  ): Promise<[T1, T2, T3, T4]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2, T3>(
    values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>],
  ): Promise<[T1, T2, T3]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): Promise<
    [T1, T2]
  >;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T>(values: (T | PromiseLike<T>)[]): Promise<T[]>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <TAll>(values: Iterable<TAll | PromiseLike<TAll>>): Promise<TAll[]>;
}

interface PromiseRace {
  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
   * or rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
    values: [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>,
      T6 | PromiseLike<T6>,
      T7 | PromiseLike<T7>,
      T8 | PromiseLike<T8>,
      T9 | PromiseLike<T9>,
      T10 | PromiseLike<T10>,
    ],
  ): Promise<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10>;

  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
   * or rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    values: [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>,
      T6 | PromiseLike<T6>,
      T7 | PromiseLike<T7>,
      T8 | PromiseLike<T8>,
      T9 | PromiseLike<T9>,
    ],
  ): Promise<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;

  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
   * or rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2, T3, T4, T5, T6, T7, T8>(
    values: [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>,
      T6 | PromiseLike<T6>,
      T7 | PromiseLike<T7>,
      T8 | PromiseLike<T8>,
    ],
  ): Promise<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8>;

  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
   * or rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2, T3, T4, T5, T6, T7>(
    values: [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>,
      T6 | PromiseLike<T6>,
      T7 | PromiseLike<T7>,
    ],
  ): Promise<T1 | T2 | T3 | T4 | T5 | T6 | T7>;

  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
   * or rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2, T3, T4, T5, T6>(
    values: [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>,
      T6 | PromiseLike<T6>,
    ],
  ): Promise<T1 | T2 | T3 | T4 | T5 | T6>;

  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
   * or rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2, T3, T4, T5>(
    values: [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
      T5 | PromiseLike<T5>,
    ],
  ): Promise<T1 | T2 | T3 | T4 | T5>;
  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
   * or rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2, T3, T4>(
    values: [
      T1 | PromiseLike<T1>,
      T2 | PromiseLike<T2>,
      T3 | PromiseLike<T3>,
      T4 | PromiseLike<T4>,
    ],
  ): Promise<T1 | T2 | T3 | T4>;

  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
   * or rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2, T3>(
    values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>],
  ): Promise<T1 | T2 | T3>;

  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
   * or rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T1, T2>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): Promise<
    T1 | T2
  >;

  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
   * or rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T>(values: (T | PromiseLike<T>)[]): Promise<T>;

  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
   * or rejected.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  <T>(values: Iterable<T | PromiseLike<T>>): Promise<T>;
}

interface PromiseResolve {
  /**
   * Creates a new resolved promise for the provided value.
   *
   * @param value A promise.
   * @returns A promise whose internal state matches the provided promise.
   */
  <T>(value: T | PromiseLike<T>): Promise<T>;

  /**
   * Creates a new resolved promise .
   *
   * @returns A resolved promise.
   */
  (): Promise<void>;
}

declare const Promise: PromiseConstructor;

declare function eval<T>(src: string): T;
